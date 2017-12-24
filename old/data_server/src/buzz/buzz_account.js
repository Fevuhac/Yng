////////////////////////////////////////////////////////////
// Account Related
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------
var BuzzUtil = require('../utils/BuzzUtil');
var RedisUtil = require('../utils/RedisUtil');
var ObjUtil = require('./ObjUtil');
var CstError = require('./cst/buzz_cst_error');
var ERROR_OBJ = CstError.ERROR_OBJ;
var CacheAccount = require('./cache/CacheAccount');
var CacheAccountServer = require('./cache/CacheAccountServer');
var DaoCommon = require('../dao/dao_common');

var REDIS_KEYS = require('./cst/buzz_cst_redis_keys').REDIS_KEYS,
    LOG = REDIS_KEYS.LOG;

//------------------------------------------------------------------------------
// 业务
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// DAO
//------------------------------------------------------------------------------
var dao_account_server = require('../dao/dao_account_server');

//------------------------------------------------------------------------------
// 缓存
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------

//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;

var TAG = "【buzz_account】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.check = check;
exports.getAccountByToken = getAccountByToken;
exports.flushAccountServer = flushAccountServer;

exports.banUser = banUser;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 对玩家施行封号操作
 */
function banUser(req, dataObj, cb) {
    const FUNC = TAG + "banUser() --- ";

    if (!lPrepare(dataObj)) return;

    var token = dataObj.token;
    var admin_uid = token.split('_')[0];
    if (admin_uid != "admin") {
        // 管理员权限判定
        CacheAccount.getAccountById(admin_uid, function (err, admin_account) {
            var isAdmin = admin_account.msgboard_mgmt;
            if (!isAdmin) {
                CacheAccount.setTest(req.pool, admin_uid, -1);
                _removeRank([admin_uid]);
                console.error(FUNC + "玩家" + admin_uid + "被封号, 原因: 不是管理员调用封号接口");
                cb && cb(ERROR_OBJ.PLAYER_CHEAT);

                var nickname = 'admin';
                if (admin_account) {
                    nickname = admin_account.channel_account_name || admin_account.nickname;
                }
                //todo error uid_list未定义
                logBanUser(admin_uid, nickname, dataObj.uid_list, "fail, reason: not an admin");
                return;
            }
        });

    }

    _banUser(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'uid_list'], "buzz_account.banUser", cb);
    }

}

function logBanUser(admin_uid, nickname, uid_list, comment) {
    const FUNC = TAG + "logBanUser() --- ";

    var value = {
        admin_uid: admin_uid,
        nickname: nickname,
        uid_list: uid_list,
        comment: comment,
        timestamp: new Date().getTime(),
    };
    value = JSON.stringify(value);
    RedisUtil.rpush(LOG.BAN_USER, value, function (err, res) {
        if (err) {
            console.error(FUNC + "Redis设置失败, err:", err);
        }
        else {
            console.log(FUNC + "Redis设置成功, res:", res);
        }
    })
}

function _removeRank(uids) {
    let rank_key = {
        GOLD: "rank:gold",
        ACHIEVE: "rank:achieve",
        GODDESS: "rank:goddess",
        MATCH: "rank:match",
        AQUARIUM: "rank:aquarium",
        CHARM: "rank:charm",
        BP: "rank:bp",
        FLOWER: "rank:flower",
    };
    for(let key in rank_key){
        _delPlayerRankData(`${rank_key[key]}:1`, uids);
        _delPlayerRankData(`${rank_key[key]}:2`, uids);
    }
}

function _delPlayerRankData(key, uids){
    RedisUtil.zrem(key, uids, function(err, result){
        console.log('-------------------', result);
        if(err){
            console.log('清空玩家排行榜信息失败');
            return;
        }
        console.log('移除玩家排行信息ok,玩家列表:', uids, '排行类型:', key);
    });
}

function _banUser(req, dataObj, cb) {
    const FUNC = TAG + "_banUser() --- ";

    var token = dataObj.token;
    var admin_uid = token.split('_')[0];
    var uid_list = dataObj.uid_list;

    if (token == "admin") {
        doNextWithAccount(null);
    }
    else {
        DaoCommon.checkAccount(req.pool, token, function(error, account) {
            if (error) {
                cb(error);
                return;
            }
            doNextWithAccount(account);
        });
    }

    function doNextWithAccount(account) {

        uid_list = uid_list.split(',');

        if (uid_list.length > 0) {
            for (var i = 0; i < uid_list.length; i++) {
                CacheAccount.setTest(req.pool, uid_list[i], -1);
            }
            // 删除排行榜
            _removeRank(uid_list);
            console.log(FUNC + "如下玩家被封号:", uid_list);
            cb && cb(null, "success");
            var nickname = 'admin';
            if (account) {
                nickname = account.channel_account_name || account.nickname;
            }
            logBanUser(admin_uid, nickname, uid_list, "success");
        }
        else {
            console.log(FUNC + "do nothing...");
            cb && cb(ERROR_OBJ.PARAM_MISSING);
        }
    }
}

/**
 * 验证用户有效性
 */
function check(req, data, cb) {

    var token = data["token"];
    
    if (token == null) {
        cb(ERROR_OBJ.TOKEN_NULL);
        return;
    }
    
    // 用户token数据进缓存, 读取缓存, 如果没有就读取数据库并存入缓存
    var account_id = _getIdByToken(token);
    
    if (account_id == null) {
        cb(ERROR_OBJ.TOKEN_FORMAT_ERR);
        return;
    }

    if (!_checkCache(account_id, token, cb)) return;

    _checkDb(req, token, function (err, account) {
        cb(err, account);
    })

}

/**
 * 通过用户的token信息来获取玩家账户信息.
 */
function getAccountByToken(req, token, cb) {

    const FUNC = TAG + "getAccountByToken() --- ";
    
    if (token == null) {
        cb(ERROR_OBJ.TOKEN_NULL);
        return;
    }
    var uid = _getIdByToken(token);

    CacheAccount.getAccountById(uid, function (err, account) {
        if(err || !account){
            cb('用户信息获取失败');
            return;
        }

        if (account.token == token) {
            cb(null, account);
        }
        else {
            if (DEBUG) console.log(FUNC + "token与客户端不匹配");
            if (account.token == "daily_reset") {
                if (ERROR) console.error(FUNC + "服务器跨天更新token");
                cb(ERROR_OBJ.DAILY_RESET);// 1013
            }
            else if (account.token == "server_update") {
                if (ERROR) console.error(FUNC + "服务器更新重启");
                cb(ERROR_OBJ.SERVER_UPDATE);// 1012
            }
            else {
                console.error(FUNC + "token:", token);
                console.error(FUNC + "account.token:", account.token);
                if (ERROR) console.error(FUNC + "玩家账号在其他地方登录");
                cb(ERROR_OBJ.TOKEN_INVALID);//1011
            }
        }
    });

}

/**
 * 将CacheAccountServer中的数据全部向数据库写入(写入后清空)
 * 调用:
 * 1. 每分钟定时调用
 * 2. 服务器更新或Crash时调用
 */
function flushAccountServer(pool, cb) {
    var list = CacheAccountServer.shift();
    if (list && list.length > 0) {
        dao_account_server.insert(pool, list, function() {
            cb();
        });
    }
    else {
        cb("没有可以写入的数据");
    }
}


//==============================================================================
// private
//==============================================================================

function _getIdByToken(token) {
    var arr = token.split("_");
    if (arr.length != 2) {
        return null;
    }
    return arr[0];
}

// 缓存中验证玩家token.
function _checkCache(account_id, token, cb) {
    const FUNC = TAG + "_checkCache() --- ";
    CacheAccount.getAccountById(account_id, function (err, account) {
        if (!account || account.token != token) {
            if (ERROR) console.error(FUNC + "玩家token错误, 请重新登录更新");
            if (ERROR) console.error(FUNC + "缓存token:", CacheAccount.getToken(account_id));
            if (ERROR) console.error(FUNC + "参数token:", token);
            cb(ERROR_OBJ.TOKEN_INVALID);
            return;// 验证完毕, 返回
        }
        cb(null, account);
    });

}

// 数据库中验证玩家token.
function _checkDb(req, token, cb) {
    req.dao.getAccountByToken(token, function (err, results) {
        if (err) {
            if (ERROR) console.error("在数据库中查找token失败");
            cb(ERROR_OBJ.DB_ERR);
            return;
        }
        if (results.length == 0) {
            if (ERROR) console.error("玩家token未在数据库中查找到");
            cb(ERROR_OBJ.TOKEN_INVALID);
            return;
        }
        // 用户数据进缓存
        var account = results[0];
        CacheAccount.push(account);
        cb(err, account);
    });
}