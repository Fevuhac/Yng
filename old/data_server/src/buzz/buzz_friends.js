////////////////////////////////////////////////////////////
// Friends Related
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------
var _ = require('underscore');
var utils = require('./utils');
var CommonUtil = require('./CommonUtil');
var DateUtil = require('../utils/DateUtil');
var ObjUtil = require('./ObjUtil');
var StringUtil = require('../utils/StringUtil');
var ArrayUtil = require('../utils/ArrayUtil');
var CstError = require('./cst/buzz_cst_error');
var BuzzUtil = require('../utils/BuzzUtil');
var RedisUtil = require('../utils/RedisUtil');
var CacheAccount = require('./cache/CacheAccount');
var BuzzUtil = require('../utils/BuzzUtil');
var REDIS_KEYS = require('./cst/buzz_cst_redis_keys').REDIS_KEYS,
    CHANNEL = REDIS_KEYS.CHANNEL,
    MSG = REDIS_KEYS.MSG,
    PAIR = REDIS_KEYS.PAIR;

//------------------------------------------------------------------------------
// 业务
//------------------------------------------------------------------------------
var buzz_cst_sdk = require('./cst/buzz_cst_sdk');
var CHANNEL_ID = buzz_cst_sdk.CHANNEL_ID;
var buzz_call_sdk_api = require('./buzz_call_sdk_api');
var buzz_sdk_tencent = require('./sdk/tencent');
//var buzz_sdk_egret = require('./sdk/egret');

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

var ERROR_CODE = CstError.ERROR_CODE;
var ERROR_OBJ = CstError.ERROR_OBJ;

var TAG = "【buzz_friends】";
var DEBUG = 0;
var ERROR = 1;

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getAppFriends = getAppFriends;
exports.addFriend = addFriend;
exports.delFriend = delFriend;
//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
/**
 * 获取游戏好友列表
 */
function getAppFriends(req_client, data, cb) {
    // 1. 参数验证
    if (!_prepare(data, cb)) return;

    //_callFriendsApi(data, req_client, function (err, succ_chunk) {

    //    cb("-------");
    //});
    _callFriendsApi(data, req_client, cb);
}

//==============================================================================
// private
//==============================================================================

function _prepare(data, cb) {
    const FUNC = TAG + "_prepare() --- ";
    if (DEBUG) console.log(FUNC + "data:", data);

    var channelid = data["channelid"];
    var openid = data["openid"];
    var openkey = data["openkey"];
    var zoneid = data["zoneid"];


    if (!CommonUtil.isParamExist("buzz_friends", channelid, "接口调用请传参数channelid(渠道ID, 用于选择渠道参数)", cb)) return false;
    if (channelid == buzz_cst_sdk.CHANNEL_ID.WANBA) {
        if (!CommonUtil.isParamExist("buzz_friends", openid, "接口调用请传参数openid(玩家在平台的唯一标识)", cb)) return false;
        if (!CommonUtil.isParamExist("buzz_friends", openkey, "接口调用请传参数openkey(玩家身份验证)", cb)) return false;
        if (!CommonUtil.isParamExist("buzz_friends", zoneid, "接口调用请传参数zoneid(Android-1, iOS-2)", cb)) return false;
    }
    else {
        // do nothing
    }

    return true;

}

function _callFriendsApi(data, req_client, cb) {

    var channelid = data["channelid"];

    if (channelid == buzz_cst_sdk.CHANNEL_ID.WANBA) {
        buzz_sdk_tencent.callFriendsApi(data, req_client, cb);
    }
    //TODO 白鹭SDK
    else {
        // do nothing
    }
}

function addFriend(req, dataObj, cb) {
    const FUNC = TAG + "give_reward() --- ";
    if (!lPrepare(dataObj)) return;
    //BuzzUtil.cacheLinkDataApi(dataObj, "addFriend");

    _addFriend1(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'type', 'id'], "buzz_friends", cb);
    }
}

/*function _addFriend(req, dataObj, cb) {
    const FUNC = TAG + "_addFriend() --- ";
    if (DEBUG) console.log(FUNC + "dataObj:",dataObj);
    var id = dataObj.id;
    var uid = dataObj.token.split("_")[0];
    RedisUtil.lrem(MSG.ASK_FRIEND + "_" + uid, 1, dataObj.msg);
    //拒绝好友申请
    if (dataObj.type == 1) {
        cb(null, "success");
        return;
    }
    //查看用户好友信息
    var tmp = [
        ['hget', PAIR.UID_QQ_FRIEND, uid],
        ['hget', PAIR.UID_GAME_FRIEND, uid],
        //['hget', PAIR.UID_QQ_FRIEND, id],
        ['hget', PAIR.UID_GAME_FRIEND, id]
    ];
    RedisUtil.multi(tmp, function (err, replies) {
        if (err) {
            console.log(FUNC + "err:", err);
            cb(err);
            return;
        }
        var c_friend = replies[0] && JSON.parse(replies[0]) || [];
        //我的好友列表
        var g_friend = replies[1] && JSON.parse(replies[1]) || [];
        //var c_friend1 = replies[2] && JSON.parse(replies[2]) || [];
        //好友的好友列表
        var g_friend1 = replies[2] && JSON.parse(replies[2]) || [];

        if (ArrayUtil.contain(c_friend, id) || ArrayUtil.contain(g_friend, id)) {
            cb(ERROR_OBJ.CHAT_FRIEND_ALREADY_ERROR);
        } else {
            CacheAccount.setCharmPointWithFriendChange(uid, g_friend, g_friend + 1);
            CacheAccount.setCharmPointWithFriendChange(id, g_friend1, g_friend1 + 1);
            g_friend.push(id);
            g_friend1.push(uid);
            RedisUtil.hset(PAIR.UID_GAME_FRIEND, id, ObjUtil.data2String(g_friend1));
            RedisUtil.hset(PAIR.UID_GAME_FRIEND, uid, ObjUtil.data2String(g_friend));
            if(DEBUG)console.log(FUNC + "game_friends:", g_friend);
            cb(null, "success");
        }
    });
}*/

/**
 * 使用有序集合处理
 * @param req
 * @param dataObj
 * @param cb
 * @private
 */
function _addFriend1(req, dataObj, cb) {
    const FUNC = TAG + "_addFriend() --- ";
    if (DEBUG) console.log(FUNC + "dataObj:",dataObj);
    var id = dataObj.id;
    var uid = dataObj.token.split("_")[0];
    RedisUtil.zrem(MSG.ASK_FRIEND + "_" + uid, id);
    //拒绝添加好友
    if (dataObj.type == 1) {
        cb(null, "success");
        return;
    }
    //查看用户好友信息
    var tmp = [
        ['hget', PAIR.UID_QQ_FRIEND, uid],
        ['hget', PAIR.UID_GAME_FRIEND, uid],
        //['hget', PAIR.UID_QQ_FRIEND, id],
        ['hget', PAIR.UID_GAME_FRIEND, id],
        ['hget', PAIR.UID_VIP, uid],
        ['hget', PAIR.UID_VIP, id]
    ];
    RedisUtil.multi(tmp, function (err, replies) {
        if (err) {
            console.log(FUNC + "err:", err);
            cb(err);
            return;
        }
        var c_friend = replies[0] && JSON.parse(replies[0]) || [];
        var g_friend = replies[1] && JSON.parse(replies[1]) || [];
        //var c_friend1 = replies[2] && JSON.parse(replies[2]) || [];
        var g_friend1 = replies[2] && JSON.parse(replies[2]) || [];
        var myvip = replies[3] && JSON.parse(replies[3]) || 0;
        var yourvip = replies[4] && JSON.parse(replies[4]) || 0;
        var myFrindCount = g_friend.length;
        var yourFrindCount = g_friend1.length;
        console.log(FUNC+"myvip,yourvip,myFrindCount,yourFrindCount", myvip, yourvip, myFrindCount, yourFrindCount);
        if (ArrayUtil.contain(c_friend, id) || ArrayUtil.contain(g_friend, id)) {
            cb("已经是好友");
        }
        else if(BuzzUtil.getMaxFriendNum(myvip)<=myFrindCount){
            cb("好友已经达到上限,请提升vip等级");
        }
        else if(BuzzUtil.getMaxFriendNum(yourvip)<=yourFrindCount){
            cb("对方好友满了");
        }
        else {
            g_friend.push(id);
            g_friend1.push(uid);
            RedisUtil.hset(PAIR.UID_GAME_FRIEND, id, ObjUtil.data2String(g_friend1));
            RedisUtil.hset(PAIR.UID_GAME_FRIEND, uid, ObjUtil.data2String(g_friend));
            
            CacheAccount.setCharmPointWithFriendChange(uid);
            CacheAccount.setCharmPointWithFriendChange(id);

            if(DEBUG)console.log(FUNC + "game_friends:", g_friend);
            cb(null, "success");
        }
    });
}

function delFriend(req, dataObj, cb) {
    const FUNC = TAG + "delFriend() --- ";
    if (!lPrepare(dataObj)) return;
    //BuzzUtil.cacheLinkDataApi(dataObj, "addFriend");

    _delFriend(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'id'], "buzz_friends", cb);
    }
}

function _delFriend(req, dataObj, cb) {
    const FUNC = TAG + "_delFriend() --- ";
    if (DEBUG) console.log(FUNC + "CALL...");
    var id = dataObj.id;
    var uid = dataObj.token.split("_")[0];

    //查看用户好友信息
    var tmp = [
        ['hget', PAIR.UID_GAME_FRIEND, uid],
        ['hget', PAIR.UID_GAME_FRIEND, id]
    ];
    RedisUtil.multi(tmp, function (err, replies) {
        if (err) {
            console.log(FUNC + "err:", err);
            cb(err);
            return;
        }
        var me = replies[0] && JSON.parse(replies[0]);
        var he = replies[1] && JSON.parse(replies[1]);
        if (me) {
            var myFrindCount = me.length;
            ArrayUtil.removeByValue(me, id);
            if (DEBUG)console.log(FUNC + "me:", me);
            RedisUtil.hset(PAIR.UID_GAME_FRIEND, uid, ObjUtil.data2String(me));
            CacheAccount.setCharmPointWithFriendChange(uid);
            if(he) {
                var yourFrindCount = he.length;
                ArrayUtil.removeByValue(he, uid);
                if (DEBUG)console.log(FUNC + "he:", he);
                RedisUtil.hset(PAIR.UID_GAME_FRIEND, id, ObjUtil.data2String(he));
                CacheAccount.setCharmPointWithFriendChange(id);
            }
            cb(null, me);
        }
        else {
            cb(ERROR_OBJ.CHAT_FRIEND_GAME_ERROR);
        }
    });
}