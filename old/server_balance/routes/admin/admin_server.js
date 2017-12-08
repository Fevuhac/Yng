//==============================================================================
// import
//==============================================================================
// var admin_common = require('./admin_common');
// var CacheUtil = require('../../src/buzz/cache/CacheUtil');
// var DateUtil = require('../../src/utils/DateUtil');

// var SERVER_CFG = require('../../src/cfgs/server_cfg').SERVER_CFG;

//------------------------------------------------------------------------------
// 路径(Path)
//------------------------------------------------------------------------------
var PATH_SRC = '../../src/';
var PATH_SRC_DAO = PATH_SRC + 'dao/';

//------------------------------------------------------------------------------
// 数据库访问(DAO)
//------------------------------------------------------------------------------
var DaoServer = require(PATH_SRC_DAO + 'server/dao_server');


//==============================================================================
// variables
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
var TAG = "【admin_server】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.shutdownWithCrash = shutdownWithCrash;
exports.shutdownByUpdate = shutdownByUpdate;
exports.saveAll = saveAll;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 服务器异常退出
 */
function shutdownWithCrash(pool) {
    const FUNC =  TAG + "shutdownWithCrash() --- ";
    if (DEBUG) console.log(FUNC + "CALL...");
    
    // 验证管理员身份
    _checkAdmin(function () {
        // 停止接收所有服务
        //server.close();
        
        DaoServer.saveAll(pool, function (err, results) {
            _exit();
        });
    })

}

/**
 * 服务器更新重启(需要后台操作)
 */
function shutdownByUpdate(req, res) {
    const FUNC =  TAG + "shutdownByUpdate() --- ";
    if (DEBUG) console.log(FUNC + "CALL...");

    // 验证管理员身份
    _checkAdmin(function () {
        // 停止接收所有服务
        //server.close();

        DaoServer.saveAll(req.pool, function (err, results) {
            res.success({ type: 1, msg: '缓存数据已经全部导入数据库，服务器可以安全关闭' });
            _exit();
        });
    })

}

/**
 * 仅存入数据库, 不关闭服务器(用于调试时能立即看到数据库变化)
 */
function saveAll(req, res) {
    const FUNC =  TAG + "saveAll() --- ";
    if (DEBUG) console.log(FUNC + "CALL...");
    
    // TODO: 验证管理员身份
    req.dao.saveAll(function (err, results) {
        res.success({ type: 1, msg: '缓存数据已经全部导入数据库' });
    });

}


//==============================================================================
// private
//==============================================================================
// TODO: 验证管理员身份
function _checkAdmin(next) {
    next();
}

/**
 * 通用退出方法.
 */
function _exit() {
    const FUNC =  TAG + "_exit() --- ";
    try {
        // 200毫秒后关闭服务器
        var killTimer = setTimeout(function () {
            process.exit(1);
        }, 200);

    } catch (e) {
        if (ERROR) console.error(FUNC + 'error when exit:', e.stack);
    }
}
