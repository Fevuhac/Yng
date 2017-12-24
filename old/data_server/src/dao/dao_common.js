// 提供以下API作为通用方法
// checkAccount

//==============================================================================
// import
//==============================================================================
var CstError = require('../buzz/cst/buzz_cst_error');
var DaoAccountCommon = require('./account/common');

var CacheAccount = require('../buzz/cache/CacheAccount');
const async = require('async');
var StringUtil = require('../utils/StringUtil');
var utils = require('../utils/utils');

//==============================================================================
// constant
//==============================================================================
var ERROR_CODE = CstError.ERROR_CODE;
var ERROR_OBJ = CstError.ERROR_OBJ;

var ERROR = 1;
var DEBUG = 0;

var TAG = "【dao_common】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------

exports.checkAccount = checkAccount;
exports.handleError = handleError;
exports.checkAccountById = checkAccountById;

exports.getAccount = getAccount;



function checkTest(test, server_token, uid) {
    const FUNC = TAG + "checkTest() --- ";
    if (server_token && StringUtil.endsWith(server_token, "cheat")) {
        if (ERROR) console.error(FUNC + "Token显示玩家作弊");
        return false;
    }
    if (test == -1) {
        if (ERROR) console.error(FUNC + "玩家作弊被封号:" + uid);
        let token = uid + "_cheat";
        CacheAccount.setToken(uid, token);
        return false;
    }
    return true;
}

function checkToken(server_token, token) {
    let FUNC = 'checkToken';

    if (server_token == "daily_reset") {
        if (ERROR) console.error(FUNC + "服务器跨天更新token");
        // cb && cb(ERROR_OBJ.DAILY_RESET);// 1013
        return false;
    }
    if (server_token == "server_update") {
        if (ERROR) console.error(FUNC + "服务器更新重启");
        // cb && cb(ERROR_OBJ.SERVER_UPDATE);// 1012
        return false;
    }
    if (server_token != token) {
        if (ERROR) console.error(FUNC + "Token过期");
        if (ERROR) console.error(FUNC + "client_token:", token);
        if (ERROR) console.error(FUNC + "server_token:", server_token);
        // cb && cb(ERROR_OBJ.TOKEN_INVALID);// 1001
        return false;
    }
    return true;
}

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
function checkAccount(pool, token, cb) {
    const FUNC = TAG + "checkAccount() --- ";

    var uid = token.split("_")[0];

    async.waterfall(
        [
            function (_cb) {
                CacheAccount.getAccountById(uid, _cb);
            }
            , function (account, _cb) {
                if (!account) {
                    DaoAccountCommon.getAccountByUid(pool, uid, function(err, account) {
                        if (err) {
                            if (ERROR) console.error(FUNC + "数据库读写错误");
                            _cb(ERROR_OBJ.DB_ERR);
                            return;
                        }
                        if (DEBUG)console.log(FUNC + "玩家数据来自数据库:", uid);
                        _cb(null, account);
                    });
                }
                else {
                    if (DEBUG)console.log(FUNC + "玩家数据来自缓存:", uid);
                    _cb(null, account);
                }
            }
        ], 
        function(err, account) {
            if(err){
                utils.invokeCallback(cb, err, null);
            }
            else if(!checkTest(account.test, account.token, account.id) || !checkToken(account.token, token)){
                utils.invokeCallback(cb, '账号被锁')
            }
            else{
                utils.invokeCallback(cb,null, account);
            }
        }
    );
}

/**
 * 后台获取玩家信息
 */
function getAccount(pool, uid, cb) {
    const FUNC = TAG + "getAccount() --- ";

    console.log(FUNC + "updateSingleValue()uid:", uid);
    async.waterfall([function (_cb) {
        CacheAccount.getAccountById(uid, _cb);
    }, function (account, _cb) {
        if (!account) {
            DaoAccountCommon.getAccountByUid(pool, uid, function(err, account) {
                if (err) {
                    if (ERROR) console.error(FUNC + "数据库读写错误");
                    _cb(ERROR_OBJ.DB_ERR);
                    return;
                }
                console.log(FUNC + "updateSingleValue()玩家数据来自数据库:", uid);
                _cb(null, account);
            });
        }
        else {
            console.log(FUNC + "updateSingleValue()玩家数据来自缓存:", uid);
            _cb(null, account);
        }
    }], function(err, account) {
        if(err){
            utils.invokeCallback(cb, err, null);
        }
        else{
            utils.invokeCallback(cb,null, account);
        }
    });
}

/**
 * 通过id查询用户信息
 * @param pool
 * @param id
 * @param cb
 */
function checkAccountById(pool, uid, cb) {
    const FUNC = TAG + "checkAccountById() --- ";
    DaoAccountCommon.getAccountByUid(pool, uid, function (err, account) {
        if (err) {
            if (ERROR) console.error(FUNC + "数据库读写错误");
            cb(ERROR_OBJ.DB_ERR);
            return;
        }
        if (DEBUG)console.log(FUNC + "玩家数据来自数据库:", uid);
        cb(null, account);
    });
}

/**
 * 处理错误信息: 如果出现错误，则在服务器log中输出并调用回调
 * @err Error 错误对象
 * @cb Function 回调函数
 */
function handleError(err, cb) {
    if (err) {
        console.log(JSON.stringify(err));
        cb(err);
    }
    return err;
}