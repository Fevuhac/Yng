//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// 系统工具(System Tools)
//------------------------------------------------------------------------------
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------
var CacheOperation = require('./src/buzz/cache/CacheOperation');
var CacheChange = require('./src/buzz/cache/CacheChange');
var CacheUser = require('./src/buzz/cache/CacheUser');

//------------------------------------------------------------------------------
// 数据库操作(DAO)
//------------------------------------------------------------------------------
var DaoOperation = require('./src/dao/server/dao_operation');
var DaoChange = require('./src/dao/server/dao_change');
var DaoUser = require('./src/dao/server/dao_user');

//------------------------------------------------------------------------------
// 配置表(Configs)
//------------------------------------------------------------------------------
var SERVER_CFG = require('./src/cfgs/server_cfg').SERVER_CFG;


//==============================================================================
// 调试变量.
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
var TAG = "【app】";


//==============================================================================
// Express Configs
//==============================================================================
var app = express();
//------------------------------------------------------------------------------
//设置跨域访问
var cross_fn_all = function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", '3.2.1')
    next();
};
app.all('/client_api/*', cross_fn_all);
app.all('/server_api/*', cross_fn_all);
app.all('/admin_api/*', cross_fn_all);
//------------------------------------------------------------------------------

// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'));
// uncomment if you want see HTTP Connection Log
// app.use(logger('dev'));

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// 数据库访问
var pool = mysql.createPool({
    connectionLimit: 3,
    host: SERVER_CFG.DB.host,
    user: SERVER_CFG.DB.user,
    password: SERVER_CFG.DB.pwd,
    database: SERVER_CFG.DB.database
});

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

DaoOperation.loadAll(myPool, function () {
    var len = CacheOperation.length();
    console.log('[MYSQL] 共加载%d条运营配置数据', len);
});

DaoChange.loadAll(myPool, function () {
    var len = CacheChange.length();
    console.log('[MYSQL] 共加载%d条实物兑换数据', len);
});

DaoUser.loadAll(myPool, function () {
    var len = CacheUser.length();
    console.log('[MYSQL] 共加载%d条用户服务器数据', len);
});

// API调用后能使用res.success(data)将值返回给客户端
app.use(function (req, res, next) {
    // 设置pool作为req的子对象.
    req.pool = myPool;
    
    res.success = function (data) {
        var rs = data || { rc: 0 };
        res.json(rs);
    };
    
    next();
});

// 提供给客户端调用的API
app.use('/client_api', require('./routes/client_api'));

// 提供给其他服务器调用的API
app.use('/server_api', require('./routes/server_api'));

// 后台管理调用的API
app.use('/admin_api', require('./routes/admin_api'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        const FUNC = TAG + "handleErrorForDevelopment() --- ";
        res.status(err.status || 500);
        console.log(FUNC + "err:", err.message);
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    const FUNC = TAG + "handleError() --- ";
    res.status(err.status || 500);
    console.log(FUNC + "err:", err.message);
});

process.on('uncaughtException', function (err) {
    const FUNC = TAG + "handleUncaughtException() --- ";
    console.log(FUNC + "uncaughtException:", err);
    console.log(FUNC + "stack:", err.stack);
    
    var admin_server = require('./routes/admin/admin_server');
    admin_server.shutdownWithCrash(myPool);
});


module.exports = app;
