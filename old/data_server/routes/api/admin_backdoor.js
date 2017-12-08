//==============================================================================
// import
//==============================================================================
var _ = require('underscore');
var admin_common = require('./admin_common');
var CacheUtil = require('../../src/buzz/cache/CacheUtil');
var CacheAccount = require('../../src/buzz/cache/CacheAccount');
var CacheMail = require('../../src/buzz/cache/CacheMail');
var CacheGold = require('../../src/buzz/cache/CacheGold');

var buzz_charts = require('../../src/buzz/buzz_charts');
var buzz_bigdata = require('../../src/buzz/buzz_bigdata');

var DateUtil = require('../../src/utils/DateUtil');

//------------------------------------------------------------------------------
// Redis
//------------------------------------------------------------------------------
var RedisUtil = require('../../src/utils/RedisUtil');
var REDIS_KEYS = require('../../src/buzz/cst/buzz_cst_redis_keys').REDIS_KEYS,
    LOG = REDIS_KEYS.LOG;
var SYS_LOG = require('../../src/buzz/cst/buzz_cst_log').SYS_LOG,
    SYS_LOG_TYPE = SYS_LOG.TYPE;

//==============================================================================
// const
//==============================================================================
var ERROR = 1;
var DEBUG = 0;

var TAG = "【routes/api/admin_backdoor】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getCacheAccount = getCacheAccount;
exports.delCacheAccount = delCacheAccount;
exports.getCacheAccountStatistics = getCacheAccountStatistics;
exports.getCacheMail = getCacheMail;
exports.queryCfgs = queryCfgs;
exports.getGoldLog = getGoldLog;
exports.mailCharts = mailCharts;
exports.resetDaily = resetDaily;
exports.resetWeekly = resetWeekly;
exports.generateRetention = generateRetention;
exports.modifyUserData = modifyUserData;
exports.kickUser = kickUser;
exports.accountForbidden = accountForbidden;
exports.accountAuth = accountAuth;
exports.switchMatch = switchMatch;
exports.switchCik = switchCik;
exports.generateCycleReward = generateCycleReward;
exports.queryAdminLog = queryAdminLog;

exports.queryGold = queryGold;
exports.queryLog = queryLog;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

////////////////////////////////////////
function accountForbidden(req, res) {
    const FUNC = TAG + "accountForbidden()---";
    
    var data = admin_common.getDataObj(req);

    req.dao.accountForbidden(data, function (err, results) {
        handleDaoResult(res, err, results, "重置账号", FUNC);
    });
}

////////////////////////////////////////
function accountAuth(req, res) {
    const FUNC = TAG + "accountAuth()---";
    
    var data = admin_common.getDataObj(req);

    req.dao.accountAuth(data, function (err, results) {
        handleDaoResult(res, err, results, "账号权限设置", FUNC);
    });
}

////////////////////////////////////////
function switchMatch(req, res) {
    const FUNC = TAG + "accountAuth()---";
    
    var data = admin_common.getDataObj(req);

    req.dao.switchMatch(data, function (err, results) {
        handleDaoResult(res, err, results, "排位赛开关", FUNC);
    });
}

////////////////////////////////////////
function switchCik(req, res) {
    const FUNC = TAG + "switchCik()---";
    
    var data = admin_common.getDataObj(req);

    req.dao.switchCik(data, function (err, results) {
        handleDaoResult(res, err, results, "实物兑换开关", FUNC);
    });
}

function generateCycleReward(req, res) {
    const FUNC = TAG + "generateCycleReward()---";
    
    var data = admin_common.getDataObj(req);

    switch(data.type) {
        case 1:
            buzz_charts.generateDailyReward();
        break;
        case 2:
            buzz_charts.generateWeeklyReward();
        break;
        case 3:
            buzz_charts.generateMonthlyReward();
        break;
    }
    var err = null;
    if (!data.type) {
        err = {code:100001, msg: "请传入生成的类型"};
    }
    handleDaoResult(res, err, "success:" + data.type, "生成排行奖励", FUNC);
}

////////////////////////////////////////
function kickUser(req, res) {
    const FUNC = TAG + "kickUser()---";
    
    var data = admin_common.getDataObj(req);
    var uid_list = data.uid_list;

    console.log(FUNC + "uid_list:", uid_list);

    req.dao.kickUser(data, function (err, results) {
        handleDaoResult(res, err, results, "踢出玩家", FUNC);
    });
}

////////////////////////////////////////
function modifyUserData(req, res) {
    const FUNC = TAG + "modifyUserData() --- ";
    
    var data = admin_common.getDataObj(req);
    var uid = data.uid;
    var field = data.field;
    var value = data.value;

    console.log(FUNC + "uid:", uid);
    console.log(FUNC + "field:", field);
    console.log(FUNC + "value:", value);

    req.dao.modifyUserData(data, function (err, results) {
        handleDaoResult(res, err, results, "修改玩家数据", FUNC);
    });
}

////////////////////////////////////////
function generateRetention(req, res) {
    const FUNC = TAG + "generateRetention()---";
    
    var data = admin_common.getDataObj(req);
    var start_time = data.start_time;
    var end_time = data.end_time;

    console.log(FUNC + "start_time:", start_time);
    console.log(FUNC + "end_time:", end_time);

    req.dao.fillDayData(data, function (err, results) {
        handleDaoResult(res, err, results, "手动生成留存数据", FUNC);
    });
}

////////////////////////////////////////
function resetDaily(req, res) {
    const FUNC = TAG + "resetDaily()---";
    
    var data = admin_common.getDataObj(req);
    var id_list = data.id_list;

    console.log(FUNC + "id_list:", id_list);

    CacheAccount.dailyReset(id_list);
    req.dao.resetDayInfoForAll(id_list, function (err, results) {
        if (err) {
            console.error(FUNC + "重置每日数据失败");
            console.error(FUNC + "err:", err);
        }
        else {
            console.error(FUNC + "重置每日数据成功");
            console.log(FUNC + "results:", results);
        }
        admin_common.response('重置每日数据', res, err, results);
    });
}

////////////////////////////////////////
function resetWeekly(req, res) {
    const FUNC = TAG + "resetWeekly()---";
    
    var data = admin_common.getDataObj(req);
    var id_list = data.id_list;

    console.log(FUNC + "id_list:", id_list);

    req.dao.resetWeeklyInfoForAll(id_list, function (err, results) {
        handleDaoResult(res, err, results, "重置每周数据", FUNC);
    });
}



function cacheAndRedisDiff(cache_data, redis_data) {

    let diff = {diffVal:{}, cacheOwn:{}, redisOwn:{}};
    if(JSON.stringify(cache_data) === JSON.stringify(redis_data)){
        return diff;
    }

    for(let key in cache_data){
        if(redis_data[key]){
            if(redis_data[key] !== cache_data[key]){
                diff.diffVal[key] = {cache:cache_data[key], redis:redis_data[key]};
            }
        }
        else {
            diff.cacheOwn[key] = cache_data[key];
        }
    }

    for(let key in redis_data){
        if(!cache_data[key]){
            diff.redisOwn[key] = redis_data[key];
        }
    }

    return diff;
}

////////////////////////////////////////
function getCacheAccount(req, res) {
    const FUNC = TAG + "getCacheAccount() --- ";
    
    if (DEBUG) console.log("CALL...");
    
    var data = admin_common.getDataObj(req);
    var uid = data.account_id;
    var field = data.field;
    
    console.log(FUNC + "uid:", uid);
    console.log(FUNC + "field:", field);
    
    if (CacheAccount.contains(uid)) {
        var ret = {cacheData:null, redisData:null, diffData:null};
        if (isNull(field)) {
            console.log(FUNC + "请求字段为空, 返回全部字段数据");
            CacheAccount.getAccountById(uid, function (err, account) {
                if (account) {
                    ret.redisData = datas;
                }
                admin_common.response('获取玩家信息', res, null, ret);
            });
        }
        else {
            console.log(FUNC + "请求字段不为空, 返回单独字段数据:", field);
            CacheAccount.getAccountById(uid, function (err, account) {
                if (account) {
                    ret.redisData = account[field];
                }
                admin_common.response('获取玩家信息', res, null, ret);
            });
        }

    }
    else {
        var ret = {};
        CacheAccount.getAccountById(uid, function (err, account) {
            if (account) {
                ret.redisData = account;
            }
            admin_common.response('获取玩家信息', res, null, ret);
        });
        // console.error(FUNC + "没有在内存中找到联系人");
        // admin_common.response('没有在内存中找到联系人', res, '数据不存在', {});

    }

}

////////////////////////////////////////
function delCacheAccount(req, res) {
    const FUNC = TAG + "delCacheAccount() --- ";
    
    if (DEBUG) console.log(FUNC + "CALL...");
    
    var data = admin_common.getDataObj(req);
    var uid = data.account_id;
    
    console.log(FUNC + "uid:", uid);
    
    if (CacheAccount.contains(uid)) {
        var err = null;
        var ret = {msg:"删除缓存数据完成"};
        CacheAccount.remove(uid);
        admin_common.response('获取玩家信息', res, err, ret);
    }
    else {
        console.error(FUNC + "没有在内存中找到联系人");
    }

}

////////////////////////////////////////
/**
 * 获取玩家统计信息
 * @return 返回给管理后台如下信息:
 * (1) 内存中的玩家总数
 * (2) 内存中的玩家updated_at字段
 */
function getCacheAccountStatistics(req, res) {
    const FUNC = TAG + "getCacheAccountStatistics()---";
    console.log(FUNC + "CALL...");
    
    //var data = admin_common.getDataObj(req);

    var ret = [];

    // for (var uid in CacheAccount.cache()) {
    //     var account = CacheAccount.getAccountById(uid);
    //     ret.push({
    //         uid: account.id,
    //         gold: account.gold,
    //         pearl: account.pearl,
    //         level: account.level,
    //         rmb: account.rmb,
    //         updated_at: account.updated_at,
    //     });
    // }

    admin_common.response('缓存已干掉，当前操作无法进行：获取玩家统计信息, 返回需要的信息, 排序及求和求平均操作在客户端完成', res, null, ret);
}

////////////////////////////////////////
function getCacheMail(req, res) {
    const FUNC = TAG + "getCacheMail()---";
    console.log("【CALL】 getCacheMail");
    
    var data = admin_common.getDataObj(req);
    var min = data.min;
    var max = data.max;
    
    if (!isNull(min)) min = parseInt(min);
    if (!isNull(max)) max = parseInt(max);
    
    console.log(FUNC + "min:", min);
    console.log(FUNC + "max:", max);
    
    var err = null;
    var ret = {};
    var mail = CacheMail.cache();
    if (isNull(min) && isNull(max)) {
        console.log(FUNC + "没有参数, 返回整个邮件列表");
        ret = _.keys(mail);
    }
    else if (!isNull(min) && !isNull(max)) {
        console.log(FUNC + "设置返回邮件ID的最大最小值");
        ret = _.filter(mail, function (obj) {
            return obj.id >= min && obj.id <= max;
        });
        ret = _.pluck(ret, "id");
    }
    else if (!isNull(min) && isNull(max)) {
        console.log(FUNC + "设置返回邮件ID的最小值");
        ret = _.filter(mail, function (obj) {
            return obj.id >= min;
        });
        ret = _.pluck(ret, "id");
    }
    else if (isNull(min) && !isNull(max)) {
        console.log(FUNC + "设置返回邮件ID的最大值");
        ret = _.filter(mail, function (obj) {
            return obj.id <= max;
        });
        ret = _.pluck(ret, "id");
    }
    console.log(FUNC + "ret:\n", ret);
    admin_common.response('获取邮件信息', res, err, ret);

}

////////////////////////////////////////
function queryCfgs(req, res) {
    const FUNC = TAG + "queryCfgs()---";
    console.log("【CALL】 queryCfgs");
    
    var data = admin_common.getDataObj(req);
    var cfg_name = data.cfg_name;
    
    console.log(FUNC + "cfg_name:", cfg_name);

    try {
        var target = require("../../cfgs/" + cfg_name);
        admin_common.response('获取配置表信息成功', res, null, target);
    }
    catch(err) {
        admin_common.response('获取配置表信息失败', res, err);
    }

}

////////////////////////////////////////
function getGoldLog(req, res) {
    const FUNC = TAG + "getGoldLog()---";
    console.log("【CALL】 getGoldLog");
    
    var data = admin_common.getDataObj(req);
    var account_id = data.account_id;
    
    console.log(FUNC + "account_id:", account_id);

    var ret = CacheGold.getLogListByAccountId(account_id);

    admin_common.response('获取用户' + account_id + '的金币记录', res, null, ret);

}

////////////////////////////////////////
function mailCharts(req, res) {
    const FUNC = TAG + "mailCharts()---";
    
    if (DEBUG) console.info(FUNC + "CALL...");

    req.dao.mailCharts(function (err, results) {
        if (err) {
            if (ERROR) console.error(FUNC + "err:", err);
            return;
        }
        if (DEBUG) console.log("排行榜邮件奖励已经补发");
        admin_common.response('排行榜邮件奖励已经补发', res, null, results);
    });
}

////////////////////////////////////////
function queryAdminLog(req, res) {
    const FUNC = TAG + "queryAdminLog()---";
    
    if (DEBUG) console.info(FUNC + "CALL...");

    var redis_key = SYS_LOG_TYPE[0].redis_key;

    // 直接从Redis中的日志获取
    RedisUtil.lrange(redis_key, 0, 10, function (err, ret) {
        if (err) {
            admin_common.response('获取管理员日志失败:' + redis_key, res, err);
        }
        else {
            console.log(FUNC + "redis_key:", redis_key);
            console.log(FUNC + "ret:", ret);
            for (var i = 0; i < ret.length; i++) {
                ret[i] = JSON.parse(ret[i]);
                ret[i].timestamp = DateUtil.format(new Date(ret[i].timestamp), "yyyy-MM-dd hh:mm:ss");
            }
            admin_common.response('获取管理员日志成功:' + redis_key, res, null, ret);
        }
    });
}

////////////////////////////////////////
function queryGold(req, res) {
    const FUNC = TAG + "queryGold()---";
    
    if (DEBUG) console.info(FUNC + "CALL...");
    
    var data = admin_common.getDataObj(req);
    var start_date = data.start_date || DateUtil.getCurrentByFormat('yyyy-MM-dd');
    var end_date = data.end_date || DateUtil.getCurrentByFormat('yyyy-MM-dd');

    buzz_bigdata.queryGold(start_date, end_date, function (err, ret) {
        if (err) {
            admin_common.response('获取金币数据失败', res, err);
        }
        else {
            console.log(FUNC + "ret:", ret);
            admin_common.response('获取金币数据成功', res, null, ret);
        }
    });
}

////////////////////////////////////////
function queryLog(req, res) {
    const FUNC = TAG + "queryLog()---";
    
    if (DEBUG) console.info(FUNC + "CALL...");
    
    var data = admin_common.getDataObj(req);
    var start_date = data.start_date || DateUtil.getCurrentByFormat('yyyy-MM-dd');
    var end_date = data.end_date || DateUtil.getNextDayByFormat('yyyy-MM-dd');

    buzz_bigdata.queryLog(data, start_date, end_date, function (err, ret) {
        if (err) {
            admin_common.response('获取日志数据', res, err);
        }
        else {
            console.log(FUNC + "ret:", ret);
            admin_common.response('获取日志数据', res, null, ret);
        }
    });
}

//==============================================================================
// private
//==============================================================================

function isNull(field) {
    return field == null || field == undefined || field == "";
}

function handleDaoResult(res, err, results, hint, FUNC) {
    if (err) {
        console.error(FUNC + hint + "失败");
        console.error(FUNC + "err:", err);
    }
    else {
        console.error(FUNC + hint + "成功");
        console.log(FUNC + "results:", results);
    }
    admin_common.response(hint, res, err, results);
}