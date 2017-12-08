// 缓存玩家目前在哪台服务器的信息

//==============================================================================
// import
//==============================================================================
var _ = require('underscore');

var dao_user = require('../../dao/server/dao_user');


//==============================================================================
// constant
//==============================================================================
var ERROR = 1;
var DEBUG = 0;
var TAG = "【CacheUser】";

/** 全局缓存对象 */
var gCacheUser = {};


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.init = init;
exports.push = push;
exports.cache = cache;
exports.length = length;
exports.getUserInfoByUid = getUserInfoByUid;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 初始化所有数据.
 */
function init(data) {
    const FUNC = TAG + "init() --- ";
    if (data) {
        for (var i = 0; i < data.length; i++) {
            // gCacheUser.push(data[i]);
            var uid = data[i].uid;// 用户ID
            gCacheUser["" + uid] = data[i];
        }
    }
}

/**
 * 插入新的用户数据.
 */
function push(pool, data, cb) {
    const FUNC = TAG + "push() --- ";
    var uid = data.uid;// 用户ID
    gCacheUser["" + uid] = data;

    cb();
    // 数据库中插入或更新一条数据
    // 修改: 负载服不再写入这个值, 只会读取
    // dao_user.insert(pool, data, function() {
    //     if (DEBUG) console.log(FUNC + "玩家登录数据插入成功");
    //     cb();
    // });
}

/**
 * 获取gCacheUser对象.
 */
function cache() {
    return gCacheUser;
}

/**
 * 获取gCacheUser对象.
 */
function getUserInfoByUid(uid) {
    return gCacheUser["" + uid];
}

/**
 * 将gAccountCache全部写入数据库中
 */
function length() {
    return _.keys(gCacheUser).length;
}