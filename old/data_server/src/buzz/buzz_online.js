/**
 * 获取用户在线信息
 * Created by zhenghang on 2017/9/21.
 */
var CacheLink = require('./cache/CacheLink');
var RedisUtil = require('../utils/RedisUtil');
var REDIS_KEYS = require('./cst/buzz_cst_redis_keys').REDIS_KEYS,
    PAIR = REDIS_KEYS.PAIR;

exports.isOnline = isOnline;
var DEBUG = 1;
var ERROR = 1;

function isOnline(id,cb) {
    RedisUtil.hget(PAIR.UID_LAST_ONLINE_TIME, id, function (err, result) {
        if (err) {
            cb(err);
            return;
        }
        var now = new Date().getTime();
        var last_online_time = parseInt(result);
        cb(null,now - last_online_time < 120000);
    })
}