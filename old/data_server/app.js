var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var dao = require('./src/dao/dao');
var DateUtil = require('./src/utils/DateUtil');
var StringUtil = require('./src/utils/StringUtil');
var RedisUtil = require('./src/utils/RedisUtil');
var FileUtil = require('./src/utils/FileUtil');
var buzz_feedback = require('./src/buzz/buzz_feedback');
var buzz_redis = require('./src/buzz/buzz_redis');
var buzz_charts = require('./src/buzz/buzz_charts');
var CacheUserInfo = require('./src/buzz/cache/CacheUserInfo');

var DaoMail = require('./src/dao/dao_mail');
var DaoOperation = require('./src/dao/dao_operation');
var DaoChange = require('./src/dao/dao_change');
var CacheOperation = require('./src/buzz/cache/CacheOperation');
var CacheChange = require('./src/buzz/cache/CacheChange');
var CacheAccount = require('./src/buzz/cache/CacheAccount');
var CacheMail = require('./src/buzz/cache/CacheMail');
var AccountCommon = require('./src/dao/account/common');
var DropRecord = require('./src/buzz/pojo/DropRecord');
var redisSync = require('./src/buzz/redisSync');
var async = require('async');

var routes = require('./routes/index');
let runner = require('./src/cache/runner');

var SERVER_CFG = require('./src/cfgs/server_cfg').SERVER_CFG;
var DB = SERVER_CFG.DB;
var REDIS_KEYS = require('./src/buzz/cst/buzz_cst_redis_keys').REDIS_KEYS,
    PAIR = REDIS_KEYS.PAIR;

//==============================================================================
// 调试变量.
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
var TAG = "【app】";

//==============================================================================
// 创建express实例
//==============================================================================
var app = express();

//==============================================================================
//设置跨域访问
//==============================================================================
app.all('*', require('./routes/cross'));
app.all('*', function (req, res, next) {
    let warningMsg = buzz_redis.redisRegister("platform_early_warning");
    console.log("warningMsg:",warningMsg);
    if(warningMsg.lock){
        res.status(400);
        res.json({rc: 10000, error: "server is closed!"});
    }else {
        next();
    }
});

//==============================================================================
// 创建数据库访问池.
//==============================================================================
var pool = mysql.createPool({
    connectionLimit: 100,
    host: DB.host,
    user: DB.user,
    password: DB.pwd,
    database: DB.database,
});
global.myDao = dao.withDbPool(pool);
console.log('[MYSQL] Connected to localhost, database ', DB.database);

var myPool = {
    query: function (sql, values, cb) {
        pool.getConnection(function (err, conn) {
            const FUNC = TAG + "getConnection() --- ";
            if (err) {
                if (ERROR) console.error(FUNC + "create err:\n", err);
                cb && cb(err);
                return;
            }
            if (!conn) {
                var msg = "Can't create more database connection";
                if (ERROR) console.error(FUNC + msg);
                cb && cb({code: 1002, msg: msg});
                return;
            }
            try {
                conn.query(sql, values, function (err, data) {
                    conn.release(); //释放连接
                    cb && cb(err, data);
                });
            }
            catch (err) {
                if (ERROR) console.error(FUNC + "query err:\n", err);
                cb && cb(err);
            }
        });
    },
    getConnection: function (cb) {
        pool.getConnection(function (err, conn) {
            cb(err, conn);
        });
    }
};

//查询当前数据库玩家最大id，有误差！！！！！
myPool.query("SELECT max(id) FROM tbl_account", function (err, res) {
    var k = 'max(id)';
    console.log('res = ', res, err, res[0][k]);
    if (res && res[0] && res[0][k] >= 0) {
        var count_base = res[0][k];
        RedisUtil.getClient().get(PAIR.KEY_ACC_COUNTER, function (err, res) {
            if (res == null) RedisUtil.set(PAIR.KEY_ACC_COUNTER, count_base + 200);
        });
    } else {
        console.log('--玩家数量查询失败！---');
        throw err;//抛出错误
    }
});

global.mysqlPool = myPool;

RedisUtil.prepare(function () {
    buzz_redis.addListener();
    buzz_redis.setPool(myPool);
    buzz_charts.initAll();
    runner.start();
    //
    // buzz_charts.generateDailyReward();//TEST
    // buzz_charts.generateWeeklyReward();//TEST
    // buzz_charts.generateMonthlyReward();//TEST
    // buzz_charts.resetChartWeekly(function(err, result) {
    //     log_error(err, "重置本周数据" + result);
    // });//TEST
    // buzz_charts.resetChartMonthly(function(err, result) {
    //     log_error(err, "重置本月数据" + result);
    // });//TEST
});

/*buzz_feedback.loadAll(myPool, function (uid_list) {
    async.mapSeries(uid_list, function (uid, cb) {
            let fields = ['id', 'nickname', 'figure_url'];
            redisSync.getAccountById(uid, fields, cb);
        }, function (err, res) {
            for(let i in res) {
                if(res[i]) {
                    res[i] = res[i].toJSON();
                }
                //TODO mysql
            }
            CacheUserInfo.loadAll(res);
            setInterval(function () {
                buzz_feedback.saveAll(myPool);
            }, 1000);
        }
    )
});*/

var isCrash = false;
var isUpdate = false;

exports.setServerUpdate = setServerUpdate;

function setServerUpdate() {
    isUpdate = true;
}

function getClientIp(req) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
}

app.use(function (req, res, next) {
    console.log('--------收到来自' + getClientIp(req) + '用户业务请求', req.originalUrl, '   ', req.path);
    if (isUpdate) {
        res.json({rc: 10000, error: "服务器更新中, 不要再请求数据了"});
    }
    else if (isCrash) {
        // console.log('服务器已经Crash, 不要再请求数据了');
        // res.error(10000, "服务器已经Crash, 不要再请求数据了");
        res.json({rc: 10000, error: "服务器已经Crash, 不要再请求数据了"});
    }
    else {
        // 使用已有的连接池创建数据库接入
        req.dao = dao.withDbPool(pool);
        req.pool = myPool;

        res.success = function (data) {
            var rs = data || {rc: 0};
            try {
                res.json(rs);
            }
            catch (e) {
                console.error("估计是Can't set headers after they are sent.——e:", e);
            }
        };

        res.error = function (code, message) {
            console.log('Error Msg!!!');
            res.status(400);
            res.json({rc: code, error: message});
        };

        next();
    }
});

// const loadMassiveAccountTimeHint = "重启服务器时批量加载玩家数据";
// console.time(loadMassiveAccountTimeHint);
// AccountCommon.loadMassive(myPool, function (err, rows) {

//     console.timeEnd(loadMassiveAccountTimeHint);
//     var len = CacheAccount.length();
//     console.log('[MYSQL] 玩家数据从数据库加载到缓存成功, 共加载玩家数据%d条', len);
// });

DaoMail.loadMail(myPool, function (err, rows) {
    var len = CacheMail.length();
    console.log('[MYSQL] 邮件数据从数据库加载到缓存成功, 共加载邮件数据%d条', len);
});

DaoOperation.loadAll(myPool, function () {
    var len = CacheOperation.length();
    console.log('[MYSQL] 共加载%d条运营配置数据', len);
});

DaoChange.loadAll(myPool, function () {
    var len = CacheChange.length();
    console.log('[MYSQL] 共加载%d条实物兑换数据', len);
});

DropRecord.init(myPool);


//==============================================================================
// 设置路由
// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
console.log("Set View Engine");
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
// 如果不要get或post被打印到console, 就注释掉下面的语句
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
var app_path = "/fjds";//fjds: FishJoy Data Server
var admin_path = "/admin";
app.use(app_path, express.static(path.join(__dirname, 'public')));
// 静态资源
app.use('/app_hot_update', express.static(path.join(__dirname, 'app_hot_update')));
app.use('/download', express.static(path.join(__dirname, 'public/download')));
app.use('/social', express.static(path.join(__dirname, 'public/social')));

app.use('/', routes);

// 管理后台前端页面
app.use(admin_path, require('./routes/backend'));

// 接口链接
app.use('/account_api', require('./routes/account_api'));
app.use('/data_api', require('./routes/data_api'));
app.use('/test_api', require('./routes/test_api'));
app.use('/admin_api', require('./routes/admin_api'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    req && console.log('data_server:Warning----404 from----:', req.originalUrl);
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// 将logger中间件放在所有的静态资源, API之后就看不到get,post请求了
app.use(logger('dev'));

//==============================================================================
// 每次重启时覆写cfg_list.cfg(配置文件版本列表)
// console.log("生成配置文件的版本表");
// FileUtil.dir("cfgs/", "cfgs/cfg_list.cfg", true, null, "js");
// FileUtil.dir("cfgs/", "cfgs/json_list.cfg", true, null, "json");

// var buzz_manage = require('./src/buzz/buzz_manage');
// buzz_manage.makeResMap();

// 启动时检测活动礼包是否有新的数据需要插入
myDao.updateGift(function (err) {
});

var common_mathadjust_const_cfg = require('./cfgs/common_mathadjust_const_cfg');
var Global = require('./src/buzz/pojo/Global');
Global.pumpBegin(
    myPool,
    common_mathadjust_const_cfg.time1 * 1000,
    common_mathadjust_const_cfg.time2 * 1000,
    common_mathadjust_const_cfg.time3 * 1000,
    common_mathadjust_const_cfg.extract,
    common_mathadjust_const_cfg.addvalue,
    common_mathadjust_const_cfg.reducevalue
);

myDao.makeNewAi(function (err) {
    log_error(err, "更新AI数据");
});

var buzz_cron = require('./src/buzz/buzz_cron');
buzz_cron.startCronJob(myDao, myPool);

function log_error(err, info) {
    if (err)
        console.error(info + ' 【失败】, err:', err);
    else
        console.log(info + ' 【成功】');
}

process.on('uncaughtException', function (err) {
    isCrash = true;
    console.log("【" + DateUtil.getTime() + "】uncaughtException:", err);
    console.log("stack:", err.stack);

    var admin_server = require('./routes/api/admin_server');
    admin_server.shutdownWithCrash(myPool);
});

process.on('unhandledRejection', (reason, p) => {
    console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
});


module.exports = app;
