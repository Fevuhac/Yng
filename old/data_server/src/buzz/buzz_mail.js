////////////////////////////////////////////////////////////
// 邮件相关的业务逻辑
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------
var _ = require('underscore');
var CstError = require('./cst/buzz_cst_error');
var ERROR_OBJ = CstError.ERROR_OBJ;
var CommonUtil = require('./CommonUtil');
// var ObjUtil = require('./ObjUtil');
var BuzzUtil = require('../utils/BuzzUtil');
// var RandomUtil = require('../utils/RandomUtil');
var RedisUtil = require('../utils/RedisUtil');
var StringUtil = require('../utils/StringUtil');
// var HttpUtil = require('../utils/HttpUtil');


var CacheCharts = require('./cache/CacheCharts'),
    RANK_TYPE = CacheCharts.RANK_TYPE;

//------------------------------------------------------------------------------
// POJO
//------------------------------------------------------------------------------
// var Reward = require('./pojo/Reward');

//------------------------------------------------------------------------------
// DAO
//------------------------------------------------------------------------------
// var DaoAccountCommon = require('../dao/account/common');
var DaoCommon = require('../dao/dao_common');
var DaoMail = require('../dao/dao_mail');
var AccountRanking = require('../dao/account/ranking');

//------------------------------------------------------------------------------
// 业务
//------------------------------------------------------------------------------
// var buzz_reward = require('./buzz_reward');
// var buzz_pearl = require('./buzz_pearl');

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------
// var CacheOperation = require('./cache/CacheOperation');
// var CacheChange = require('./cache/CacheChange');
var CacheAccount = require('./cache/CacheAccount');
var CacheMail = require('./cache/CacheMail');

//------------------------------------------------------------------------------
// 常量(Const)
//------------------------------------------------------------------------------
// 邮件类型
const MAIL_TYPE = {
    SYS :   1,// 系统
    RANK :  2,// 排行榜
    SPECIFY : 3,// 补偿邮件(指定玩家发送)
}

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------

//==========================================================
// Cst
//==========================================================
var REDIS_KEYS = require('./cst/buzz_cst_redis_keys').REDIS_KEYS,
    CHART = REDIS_KEYS.CHART,
    CHANNEL = REDIS_KEYS.CHANNEL;

//==============================================================================
// const
//==============================================================================
var DEBUG = 1;
var ERROR = 1;
var TAG = "【buzz_mail】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.sendMail = sendMail;
exports.redisNotifyMail = redisNotifyMail;
exports.reloadMail = reloadMail;
exports.mailCharts = mailCharts;
exports.addMail = _addMail;
exports.addRankMail = _addRankMail;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 后台发邮件接口.
 */
function sendMail(req, dataObj, cb) {
    const FUNC = TAG + "sendMail() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "open_box");

    _sendMail(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['type', 'title', 'content', 'reward', 'player_list'], "buzz_mail", cb);
    }
}

/**
 * Redis监听到新的邮件信息
 */
function redisNotifyMail(channel, message) {
    const FUNC = TAG + "redisNotifyMail() --- ";

    switch(channel) {
        case CHANNEL.MAIL_SEND:
            _addMail(message);
        break;

        case CHANNEL.MAIL_RANK:
            _addRankMail(message);
        break;
    }

}

function reloadMail(pool, channel, message) {
    const FUNC = TAG + "reloadMail() --- ";
    if (DEBUG) console.log(FUNC + "channel:", channel);
    if (DEBUG) console.log(FUNC + "message:", message);

    DaoMail.loadMail(pool, function () {
    });
}

/**
 * 定时发放奖励邮件.
 */
function mailCharts(pool, cb) {
    const FUNC = TAG + "mailCharts() --- "; 

    _mailCharts(pool, cb);
}


//==============================================================================
// private
//==============================================================================

/**
 * 后台发邮件接口.
 */
function _sendMail(req, dataObj, cb) {
    const FUNC = TAG + "_sendMail() --- ";
    if (DEBUG) console.log(FUNC + "CALL...");

    var type = dataObj.type;
    var title = dataObj.title;
    var content = dataObj.content;
    var reward = dataObj.reward;
    var player_list = dataObj.player_list;

    var pool = req.pool;

    DaoMail.sendMail(pool, dataObj, function(err, insertId) {
        if (err) return cb(err);

        var mid = insertId;

        // 邮件内容加入缓存
        var new_mail = {
            id: mid,
            type: type,
            title: title,
            content: content,
            reward: reward,
            player_list: player_list,
            sendtime: new Date().getTime(),
        };

        if (type == MAIL_TYPE.SYS) {
            DaoMail.addMailForAll(pool, mid, cb);
            CacheAccount.addSysMail(mid);
        }
        else if (type == MAIL_TYPE.SPECIFY) {
            DaoMail.addMailForPlayer(pool, mid, player_list, cb);
            CacheAccount.addSpecifyMail(mid, player_list);
        }
        else {
            cb(err, insertId);
        }
    });

}

/**
 * Redis注册的频道收到消息后向缓存中的用户写入邮件数据
 */
function _addMail(message) {
    const FUNC = TAG + "_addMail() --- ";

    var new_mail = null;
    try {
        new_mail = JSON.parse(message);
    }
    catch(err) {
        if (ERROR) console.error(FUNC + "err:\n", err);
    }

    if (new_mail) {
        CacheMail.push(new_mail);

        var mid = new_mail.id;
        var type = new_mail.type;
        var player_list = new_mail.player_list;
        
        if (type == MAIL_TYPE.SYS) {
            CacheAccount.addSysMail(mid);
        }
        else if (type == MAIL_TYPE.SPECIFY) {
            CacheAccount.addSpecifyMail(mid, player_list);
        }
        else {
            if (ERROR) console.error(FUNC + "邮件类型不支持:", type);
        }
    }
}

function _addRankMail(mail_info) {
    const FUNC = TAG + "_addRankMail() --- ";

    DEBUG = 1;
    if (DEBUG) console.log(FUNC + "mail_info:");

    if (mail_info) {
        var mid = mail_info.mid;
        var reciever_list = mail_info.reciever_list;

        if (DEBUG) console.log(FUNC + "mid:", mid);
        if (DEBUG) console.log(FUNC + "reciever_list:", reciever_list);

        CacheAccount.addSpecifyMail(mid, reciever_list);
    }
    DEBUG = 0;
}

function _mailCharts(pool, cb) {
    const FUNC = TAG + "_mailCharts() --- ";

    AccountRanking.makeChartsMail(pool, function(mail_list, insertId) {
        console.log(FUNC + "新生成的邮件id——insertId:", insertId);
        RedisUtil.publish(CHANNEL.MAIL_RELOAD, "hello");
        for (var i = 0; i < mail_list.length; i++) {
            mail_list[i].id = insertId + i;// 设置邮件id
        }
        _mailChartsAfterMakeMail(pool, mail_list, cb);
    });
}

function _mailChartsAfterMakeMail(pool, mail_list, cb) {
    const FUNC = TAG + "_mailChartsAfterMakeMail() --- ";
    // 获取昨日排行榜奖励
    var count_ret = 0;
    const CHART_LIST = [
        {name:"ACHIEVE", platform:1, desc:"成就", type: RANK_TYPE.ACHIEVE},
        {name:"GODDESS", platform:1, desc:"女神", type: RANK_TYPE.GODDESS},
        {name:"MATCH", platform:1, desc:"比赛", type: RANK_TYPE.MATCH},
        {name:"AQUARIUM", platform:1, desc:"宠物鱼", type: RANK_TYPE.AQUARIUM},

        {name:"ACHIEVE", platform:2, desc:"成就", type: RANK_TYPE.ACHIEVE},
        {name:"GODDESS", platform:2, desc:"女神", type: RANK_TYPE.GODDESS},
        {name:"MATCH", platform:2, desc:"比赛", type: RANK_TYPE.MATCH},
        {name:"AQUARIUM", platform:2, desc:"宠物鱼", type: RANK_TYPE.AQUARIUM},
    ];

    for (var i = 0; i < CHART_LIST.length; i++) {
        mailOneChart(i);
    }

    function mailOneChart(idx) {
        setTimeout(function () {
            var start = idx * 8;
            var end = (idx + 1) * 8;
            var name = CHART_LIST[idx].name;
            var platform = CHART_LIST[idx].platform;
            var desc = CHART_LIST[idx].desc;
            var key = CHART[name + "_YD_STR"] + ":" + platform;
            
            var timeStr = "发放" + (platform == 1 ? "Android" : "iOS") + "平台的" + desc + "奖励邮件";
            console.log(FUNC + "key:", key);
            console.time(timeStr);
            RedisUtil.get(key, function(err, res) {
                console.log(FUNC + "res:", res);
                if (res && StringUtil.strLen(res) > 0) {
                    didMailOneChart(res, idx, start, end, function(err, res) {
                        console.timeEnd(timeStr);
                    });
                }
                else {
                    console.error(FUNC + "没有发邮件奖励");
                }
            });
        }, idx * 1000);
    }

    /**
     * 完成对一个排行榜的邮件发放.
     */
    function didMailOneChart(res, idx, start, end, cb) {
        var chart_arr = JSON.parse(res);
        console.error(FUNC + "idx:", idx);
        var type = CHART_LIST[idx].type;
        var platform = CHART_LIST[idx].platform;

        for (var i = 0; i < chart_arr.length; i++) {
            console.error(FUNC + "用户数据:", chart_arr[i]);
        }
        
        var level_info = [];
        _getLevelInfo(level_info, mail_list, start, end);
        console.log(FUNC + "level_info:", level_info);

        rank = _.pluck(chart_arr, 'uid');
        console.log(FUNC + "rank:", rank);
        _executeSql(pool, rank, level_info, 2, platform, function() {
            cb();
        });
    }
}

var LIMIT_10000 = 1;

function _getLevelInfo(level_info, mail_list, start, end) {
    const FUNC = TAG + "_getLevelInfo() --- ";

    var ranking_count = 0;
    for (var i = start; i < end; i++) {
        var mail_info = mail_list[i];
        if (mail_info != null) {
            // console.log(FUNC + "interval: min-" + mail_info.min_interval + ", max-" + mail_info.max_interval);
            if (i == end - 2) {
                ranking_count = mail_info.max_interval;
            }
            if (LIMIT_10000) {
                if (i == end - 1) {
                    ranking_count = mail_info.max_interval;
                }
            }
            // console.log(FUNC + "ranking_count:" + ranking_count);
            level_info.push(
                {
                    id: mail_info.id,
                    min: mail_info.min_interval,
                    max: mail_info.max_interval,
                }
            );
        }
    }
    return ranking_count;
}

function _executeSql(pool, rank, level_info, type, platform, next) {
    const FUNC = TAG + "_executeSql() --- ";

    var op_set = [];
    for (var i = 0; i < level_info.length; i++) {
        var mail_interval = level_info[i];
        var min = mail_interval.min;
        var max = mail_interval.max;
        
        var isLastLevel = i == level_info.length - 1;
        var mail_id = mail_interval.id;
        var account_list = rank.slice(min - 1, max);

        op_set.push({
            func: DaoMail.addMailsIn,
            mail_id: mail_id,
            account_list: account_list,
            type: type,
            platform: platform,
        });
    }
    if (op_set.length == 0) {
        next();
    }
    else {
        DaoMail.addMails(pool, op_set, function () {
            next();
        });
    }
}