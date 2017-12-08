var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

//==============================================================================
//设置跨域访问
app.all('*', require('./routes/cross'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// NOTE: first place, or static path will take place.
var entry = require('./routes/entry');
app.use('/fishjoy/index.html', entry);

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// 正式发布时注释下面的语句
process.env.NODE_ENV = "development";

function getClientIp(req) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
}

var isCrash = false;
var isUpdate = false;
app.use(function (req, res, next) {
    console.log('--------收到来自' + getClientIp(req) +'用户业务请求', req.originalUrl,'   ', req.path);
    if (isUpdate) {
        res.json({ rc: 10000, error: "服务器更新中, 不要再请求数据了" });
    }
    else if (isCrash) {
        // console.log('服务器已经Crash, 不要再请求数据了');
        // res.error(10000, "服务器已经Crash, 不要再请求数据了");
        res.json({ rc: 10000, error: "服务器已经Crash, 不要再请求数据了" });
    }
    else {

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
//下载图片
app.use('/', require('./routes/img_api'));

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
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;