// 缓存玩家的openid和uid对应关系

//==============================================================================
// import
//==============================================================================
var _ = require('underscore');


//==============================================================================
// constant
//==============================================================================
var ERROR = 1;
var DEBUG = 0;
var TAG = "【CacheOpenid】";

/** 全局缓存对象 */
var gCacheOpenid = {};


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.push = push;
exports.cache = cache;
exports.length = length;
exports.contains = contains;
exports.getUidByOpenid = getUidByOpenid;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
/**
 * 插入新的用户数据.
 */
function push(openid, uid) {
    gCacheOpenid[openid] = {
        /** 用户ID. */
        uid: uid,
        /** 访问时间, 每次查询时需要进行更新. */
        access_time: new Date().getTime(),
    };
}

/**
 * 获取gCacheOpenid对象.
 */
function cache() {
    return gCacheOpenid;
}

/**
 * 将gAccountCache全部写入数据库中
 */
function length() {
    return _.keys(gCacheOpenid).length;
}

/**
 * 判断用户对象是否存在于缓存.
 */
function contains(openid) {
    return gCacheOpenid[openid] != null;
}

/**
 * 获取用户对象, 不存在则返回null.
 */
function getUidByOpenid(openid) {
    const FUNC = TAG + "getUidByOpenid() --- ";
    //----------------------------------
    if (contains(openid)) {
        if (DEBUG) console.log(FUNC + "缓存中存在用户:", openid);
        gCacheOpenid[openid].access_time = new Date().getTime();
        return gCacheOpenid[openid].uid;
    }
    else {
        if (DEBUG) console.log(FUNC + "缓存中不存在用户:", openid);
        return null;
    }
}