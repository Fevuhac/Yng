/**
 * 设置城市
 * Created by zhenghang on 2017/9/21.
 */
var BuzzUtil = require('../utils/BuzzUtil');
var RedisUtil = require('../utils/RedisUtil');
var DaoCommon = require('../dao/dao_common');
var CacheAccount = require('./cache/CacheAccount');
var REDIS_KEYS = require('./cst/buzz_cst_redis_keys').REDIS_KEYS,
    PAIR = REDIS_KEYS.PAIR;
var TAG = "【buzz_city】";
var DEBUG = 1;

exports.setCity = setCity;

function setCity(req, dataObj, cb) {
    const FUNC = TAG + "setCity() --- ";
    if (!lPrepare(dataObj)) return;
    //BuzzUtil.cacheLinkDataApi(dataObj, "setCity");

    _setCity(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'city'], "buzz_city", cb);
    }
}

function _setCity(req, dataObj, cb) {
    const FUNC = TAG + "_setCity() --- ";
    var pool = req.pool;
    var token = dataObj.token;
    var city = dataObj.city;
    if(DEBUG)console.log(FUNC + "dataObj:");
    DaoCommon.checkAccount(pool, token, function (err, account) {
        if (err) {
            cb(err);
            return;
        }
        CacheAccount.setCity(account.id, city);
        cb(null, []);
    });
}