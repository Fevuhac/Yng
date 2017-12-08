//==============================================================================
// import
//==============================================================================
var app = require('../../app');
var admin_common = require('./admin_common');
var CacheUtil = require('../../src/buzz/cache/CacheUtil');
var DateUtil = require('../../src/utils/DateUtil');

var SERVER_CFG = require('../../src/cfgs/server_cfg').SERVER_CFG;

var TAG = "【admin_server】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.shutdownWithCrash = shutdownWithCrash;
exports.shutdown = shutdown;
exports.saveAll = saveAll;
exports.restartPlaza = restartPlaza;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

////////////////////////////////////////
function shutdownWithCrash(pool) {
    console.log("【" + DateUtil.getTime() + "】CALL shutdown: Server Crash");
    
    // 验证管理员身份
    _checkAdmin(function () {
        // 停止接收所有服务
        //server.close();
        
        var DaoServer = require('../../src/dao/dao_server');
        DaoServer.saveAll(pool, function (err, results) {
            _exit();
        });
    });

}

////////////////////////////////////////
function shutdown(req, res) {
    console.log("【" + DateUtil.getTime() + "】CALL shutdown: Server Update");
    app.setServerUpdate();

    // 验证管理员身份
    _checkAdmin(function () {
        // 停止接收所有服务
        //server.close();
        
        req.dao.saveAll(function (err, results) {
            res.success({ type: 1, msg: '缓存数据已经全部导入数据库，服务器可以安全关闭' });
            _exit();
        });
    });

}

////////////////////////////////////////
/**
 * 仅存入数据库, 不关闭服务器(用于调试时能立即看到数据库变化)
 */
function saveAll(req, res) {
    console.log("CALL saveAll");
    
    // TODO: 验证管理员身份
    req.dao.saveAll(function (err, results) {
        res.success({ type: 1, msg: '缓存数据已经全部导入数据库' });
    });

}

function restartPlaza(req, res) {
    const FUNC = TAG + "restartPlaza() --- ";
    console.log(FUNC + "【" + DateUtil.getTime() + "】CALL restartPlaza(): Server Update");

    // 验证管理员身份
    _checkAdmin(function () {
        // TODO: 调用房间服务器提供的重启API
        var io = require('socket.io-client');
        var socket = socketConnect();

        socket.on('connect', function () {
            console.log(FUNC + " connect to plaza pool...");
            
            // 关闭广场服务器
            socket.emit('shutdown', function() {
                console.log(FUNC + "已经关闭, 断开连接");
                socket.disconnect();
                res.success({ type: 1, msg: '房间服务器已经关闭' });
            });
        });

        function socketConnect() {
            var socket = null;
            if (SERVER_CFG.HTTP) {
                socket = io.connect(SERVER_CFG.ADDRESS.ROOM_ADMIN_API.HTTP);
            }
            else if (SERVER_CFG.HTTPS) {
                socket = io.connect(SERVER_CFG.ADDRESS.ROOM_ADMIN_API.HTTPS);
            }
            return socket;
        }
    });

}


//==============================================================================
// private
//==============================================================================
// TODO: 验证管理员身份
function _checkAdmin(cb) {
    cb();
}

function _exit() {
    try {
        // 200毫秒后关闭服务器
        var killTimer = setTimeout(function () {
            process.exit(1);
        }, 200);

    } catch (e) {
        console.log('error when exit', e.stack);
    }
}