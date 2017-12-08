////////////////////////////////////////////////////////////
// 玩家信息获取.
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------
var CstError = require('./cst/buzz_cst_error');
var ERROR_OBJ = CstError.ERROR_OBJ;

//------------------------------------------------------------------------------
// 业务
//------------------------------------------------------------------------------
var ObjUtil = require('./ObjUtil');
var DateUtil = require('../utils/DateUtil');
var BuzzUtil = require('../utils/BuzzUtil');
var RandomUtil = require('../utils/RandomUtil');
var RedisUtil = require('../utils/RedisUtil');
var REDIS_KEYS = require("./cst/buzz_cst_redis_keys").REDIS_KEYS,
    PAIR = REDIS_KEYS.PAIR;

var ItemTypeC = require('./pojo/Item').ItemTypeC;
let _package = require('../dao/account/update/package');

//------------------------------------------------------------------------------
// DAO
//------------------------------------------------------------------------------
// var dao_reward = require('../dao/dao_reward');
var DaoCommon = require('../dao/dao_common');

//------------------------------------------------------------------------------
// 缓存
//------------------------------------------------------------------------------
var CacheAccount = require('./cache/CacheAccount');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------

//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;

var TAG = "【buzz_info】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getHuafeiquan = getHuafeiquan;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 获取限时道具领取时间戳
 */
exports.getItemLimitGotTime = function (req, dataObj, cb) {
    if (!BuzzUtil.checkParams(dataObj, ['token'], "buzz_info", cb)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "get_item_limit_got_time");
    var token = dataObj.token;
    var pool = req.pool;
    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        var id = account.id;
        if (id) {
            _package.checkItemLimitEnd(account, function (res) {
                if (!res) {
                    cb && cb('尚无限时道具');
                }else{
                    cb && cb(null, res);
                }
            });
        }else{
            cb('用户校验失败');
        }
    });
};

/**
 * 获取指定限时道具剩余时长
 */
exports.getItemLimitTime = function (req, dataObj, cb) {
    if (!BuzzUtil.checkParams(dataObj, ['token'], "buzz_info", cb)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "get_item_limit_time");
    var token = dataObj.token;
    let itemId = dataObj.itemId;
    let gotAt = dataObj.gotAt;
    var pool = req.pool;
    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        var id = account.id;
        if (id) {
            _package.getLimitLeft(id, itemId, gotAt, function (left) {
                if (left == -1) {
                    cb && cb('不是限时道具');
                }else if (left == -2) {
                    cb && cb('时间戳有误');
                }else if (left == -3) {
                    cb && cb('道具不存在');
                }else{
                    cb && cb(null, {itemId: itemId, ltime: left});
                }
            });
        }else{
            cb('用户校验失败');
        }
    });
};

/**
 * 获取喇叭使用个数、收到鲜花数量
 */
exports.getHornFlower = function (req, dataObj, cb) {
    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token'], "buzz_info", cb);
    }

    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "get_horn_flower");

    var token = dataObj.token;
    var pool = req.pool;
    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        var id = account.id;
        if (id) {
            var flowerC = 0;
            var hornC = 0;
            var tmp = [
                ['hget', PAIR.UID_FLOWER_RECEIVE, id],
                ['hget', PAIR.UID_HORN_USED, id],
            ];
            RedisUtil.multi(tmp, function (err, ret) {
                if (ret && ret.length == tmp.length) {
                    flowerC = parseInt(ret[0]) || 0;
                    hornC = parseInt(ret[1]) || 0;
                    cb && cb(null, {hornC: hornC, flowerC: flowerC});
                }else{
                    cb(err);
                }
            });
        }else{
            cb(null);
        }
    });
};

/**
 * 获取话费券数量.
 */
function getHuafeiquan(req, dataObj, cb) {
    const FUNC = TAG + "getHuafeiquan() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "get_huafeiquan");

    _getHuafeiquan(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token'], "buzz_info", cb);
    }
}

//==============================================================================
// private
//==============================================================================

/**
 * 获取话费券数量.
 */
function _getHuafeiquan(req, dataObj, cb) {
    const FUNC = TAG + "_getHuafeiquan() --- ";
    const EFUNC = "<<<ERROR>>>" + TAG + "_getHuafeiquan() --- ";
    var uid = dataObj.uid;
    var token = dataObj.token;
    var pool = req.pool;

    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {
        DEBUG = 0;

        if (!_checkGetHuafeiquan1()) return;

        var num = getHuafeiquanFromPack(account.package);
        if (DEBUG) console.log(FUNC + "num:", num); 

        var ret = {
            change:{
                package: {
                    "9":{
                        "i003": num,
                    },
                },
            },
        };
        cb(null, ret);
        DEBUG = 0;

        // 校验方法1
        function _checkGetHuafeiquan1() {
            // if (null == weapon_info) {
            //     if (ERROR) console.error(EFUNC + "");
            //     cb(ERROR_OBJ.WEAPON_INFO_NULL);
            //     return false;
            // }

            return true;
        }
    }
  
}

//==============================================================================
// private common
//==============================================================================

function getHuafeiquanFromPack(pack) {
    if (undefined == pack[ItemTypeC.TOKENS]) {
        pack[ItemTypeC.TOKENS] = {};
    }
    if (undefined == pack[ItemTypeC.TOKENS]["i003"]) {
        pack[ItemTypeC.TOKENS]["i003"] = 0;
    }
    return pack[ItemTypeC.TOKENS]["i003"];
}
