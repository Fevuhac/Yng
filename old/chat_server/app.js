var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var RedisUtil = require('./src/utils/RedisUtil');
var buzz_redis = require('./src/buzz/buzz_redis');
var dao = require('./src/dao/dao');
var buzz_feedback = require('./src/buzz/buzz_feedback');
var redisSync = require('./src/buzz/redisSync');
var async = require('async');
var CacheUserInfo = require('./src/buzz/cache/CacheUserInfo');

var SERVER_CFG = require('./src/cfgs/server_cfg').SERVER_CFG;
var DB = SERVER_CFG.DB;


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
var myDao = dao.withDbPool(pool);
console.log('[MYSQL] Connected to localhost, database ', DB.database);

var myPool = {
    query: function (sql, values, cb) {
        pool.getConnection(function(err,conn){
            const FUNC = TAG + "getConnection() --- ";
            if (err) {
                if (ERROR) console.error(FUNC + "create err:\n", err);
                cb(err);
                return;
            }
            if (!conn) {
                var msg = "Can't create more database connection";
                if (ERROR) console.error(FUNC + msg);
                cb({code:1002, msg:msg});
                return;
            }
            try {
                conn.query(sql, values, function(err, data){
                    conn.release(); //释放连接
                    cb(err, data);
                });
            }
            catch(err) {
                if (ERROR) console.error(FUNC + "query err:\n", err);
                cb(err);
            }
        });
    }
};

buzz_feedback.loadAll(myPool, function (uid_list) {
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
});

RedisUtil.prepare(function() {
    buzz_redis.addListener();
    buzz_redis.setPool(myPool);
});


var isCrash = false;
var isUpdate = false;

exports.setServerUpdate = setServerUpdate;
function setServerUpdate() {
    isUpdate = true;
}

app.use(function (req, res, next) {
    if (isUpdate) {
        res.json({ rc: 10000, error: "服务器更新中, 不要再请求数据了" });
    }
    else if (isCrash) {
        // console.log('服务器已经Crash, 不要再请求数据了');
        // res.error(10000, "服务器已经Crash, 不要再请求数据了");
        res.json({ rc: 10000, error: "服务器已经Crash, 不要再请求数据了" });
    }
    else {
        // 使用已有的连接池创建数据库接入
        req.dao = dao.withDbPool(pool);
        req.pool = myPool;
        
        res.success = function (data) {
            var rs = data || { rc: 0 };
            try {
                res.json(rs);
            }
            catch(e) {
                console.error("估计是Can't set headers after they are sent.——e:", e);
            }
        };
        
        res.error = function (code, message) {
            console.log('Error Msg!!!');
            res.status(400);
            res.json({ rc: code, error: message });
        };
        
        next();
    }
});


//==============================================================================
// 设置路由
// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
console.log("Set View Engine");
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'));
// 如果不要get或post被打印到console, 就注释掉下面的语句
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// 接口链接
app.use('/chat_api', require('./routes/data_api'));
app.use('/data_api', require('./routes/data_api'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    req && console.log('data_server:Warning----404 from----:', req.originalUrl);
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// 将logger中间件放在所有的静态资源, API之后就看不到get,post请求了
app.use(logger('dev'));

function log_error(err, info) {
    if (err)
        console.error(info + ' 【失败】, err:', err);
    else
        console.log(info + ' 【成功】');
}

process.on('uncaughtException', function (err) {
    isCrash = true;
    //console.log("【" + DateUtil.getTime() + "】uncaughtException:", err);
    console.log("stack:", err.stack);
    
    //var admin_server = require('./routes/api/admin_server');
    //admin_server.shutdownWithCrash(myPool);
});


module.exports = app;
