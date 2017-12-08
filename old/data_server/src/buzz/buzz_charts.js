////////////////////////////////////////////////////////////
// 排行榜相关工具类
////////////////////////////////////////////////////////////

var _ = require("underscore");
var async = require('async');
var redisSync = require('./redisSync');
var ArrayUtil = require('../utils/ArrayUtil'),
    SORT_RULE = ArrayUtil.SORT_RULE;
var BuzzUtil = require('../utils/BuzzUtil');
var RedisUtil = require("../utils/RedisUtil");
var ObjUtil = require('./ObjUtil');
var REDIS_KEYS = require("./cst/buzz_cst_redis_keys").REDIS_KEYS,
    CHANNEL = REDIS_KEYS.CHANNEL,
    RANK = REDIS_KEYS.RANK,
    CHART = REDIS_KEYS.CHART,
    PAIR = REDIS_KEYS.PAIR;

var CacheCharts = require('./cache/CacheCharts'),
    RANK_TYPE = CacheCharts.RANK_TYPE;

var DaoCommon = require('../dao/dao_common');
var dao_gold = require('../dao/dao_gold');
var CharmUtil = require('../utils/CharmUtil');
var CacheAccount = require('./cache/CacheAccount');
const MAX_NUM_CHART_TIMESTAMP = 1000;
const MAX_NUM_CHART_USERINFO = 100;
const sql_pojo = require('./pojo/sql_pojo');
const common = require('../dao/account/common');
var CstError = require('./cst/buzz_cst_error');
const ERROR_OBJ = CstError.ERROR_OBJ;

var common_log_const_cfg = require('../../cfgs/common_log_const_cfg');

var DEBUG = 0;
var ERROR = 1;
var TAG = "【buzz_charts】";

exports.updateRankGoddess = updateRankGoddess;
exports.updateRankMatch = updateRankMatch;
exports.updateRankAquarium = updateRankAquarium;
exports.updateRankCharm = updateRankCharm;
exports.updateRankBp = updateRankBp;
exports.updateRankFlower = updateRankFlower;

exports.getRankGold = getRankGold;
exports.getRankAchieve = getRankAchieve;
exports.getRankGoddess = getRankGoddess;
exports.getRankMatch = getRankMatch;
exports.getRankAquarium = getRankAquarium;
exports.getRankCharm = getRankCharm;
exports.getLastweekRank = getLastweekRank;
exports.getRankBp = getRankBp;
exports.getRankFlower = getRankFlower;

exports.trim = trim;
exports.trimAll = trimAll;
exports.generate = generate;
exports.getTop = getTop;
exports.getCharts = getCharts;
exports.getFriendsCharts = getFriendsCharts;
exports.resetCharts = resetCharts;
exports.initAll = initAll;
exports.generateDailyReward = generateDailyReward;
exports.generateWeeklyReward = generateWeeklyReward;
exports.generateMonthlyReward = generateMonthlyReward;

exports.getUserRank = getUserRank;
exports.getChartReward = getChartReward;
exports.resetChartWeekly = resetChartWeekly;
exports.resetChartMonthly = resetChartMonthly;

// 排行榜更新

function updateRankGoddess(platform, uid, max_wave) {
    const FUNC = TAG + "updateRankGoddess() --- ";
    if (DEBUG) console.log(FUNC + "1.max_wave:", max_wave);
    //max_wave += 60;//Test Only
    if (DEBUG) console.log(FUNC + "2.max_wave:", max_wave);
    RedisUtil.updateRank(RANK.GODDESS, platform, max_wave, uid);
}

function updateRankMatch(platform, uid, point, rank) {
    RedisUtil.updateRank(RANK.MATCH, platform, point, uid);
    // 需要一个hash表存所有玩家的比赛信息，用于玩家的好友排名
    RedisUtil.hset(PAIR.UID_POINTS, uid, point);
    RedisUtil.hset(PAIR.UID_RANK, uid, rank);
}

function updateRankAquarium(platform, uid, total_level) {
    RedisUtil.updateRank(RANK.AQUARIUM, platform, total_level, uid);
}

function updateRankCharm(platform, uid, point) {
    RedisUtil.updateRank(RANK.CHARM, platform, point, uid);
}

function updateRankBp(platform, uid, bp) {
    RedisUtil.updateRank(RANK.BP, platform, bp, uid);
}

function updateRankFlower(platform, uid, flowerCount) {
    RedisUtil.updateRank(RANK.FLOWER, platform, flowerCount, uid);
}

// 排行榜获取

function getRankGold(platform, cb) {
    RedisUtil.getRank(RANK.GOLD, platform, function (err, temp_rank) {
        if (err) return cb && cb(err);
        sortByTimestamp(RANK.GOLD_TIMESTAMP, temp_rank, cb);
    });
}

function getRankAchieve(platform, cb) {
    RedisUtil.getRank(RANK.ACHIEVE, platform, function (err, temp_rank) {
        if (err) return cb && cb(err);
        sortByTimestamp(RANK.ACHIEVE_TIMESTAMP, temp_rank, cb);
    });
}

function getRankGoddess(platform, cb) {
    RedisUtil.getRank(RANK.GODDESS, platform, function (err, temp_rank) {
        if (err) return cb && cb(err);
        sortByTimestamp(RANK.GODDESS_TIMESTAMP, temp_rank, cb);
    });
}

function getRankMatch(platform, cb) {
    const FUNC = TAG + "getRankMatch() --- ";
    RedisUtil.getRank(RANK.MATCH, platform, function (err, temp_rank) {
        // temp_rank是排行榜中所有玩家按名次排列的ID值.
        if (err) return cb && cb(err);
        sortByTimestamp(RANK.MATCH_TIMESTAMP, temp_rank, cb);
    });
}

function getRankAquarium(platform, cb) {
    const FUNC = TAG + "getRankAquarium() --- ";
    RedisUtil.getRank(RANK.AQUARIUM, platform, function (err, temp_rank) {
        if (err) return cb && cb(err);
        if (temp_rank.length == 0) return;
        sortByTimestamp(RANK.AQUARIUM_TIMESTAMP, temp_rank, cb);
    });
}

function getRankCharm(platform, cb) {
    const FUNC = TAG + "getRankCharm() --- ";
    RedisUtil.getRank(RANK.CHARM, platform, function (err, temp_rank) {
        if (err) return cb && cb(err);
        if (temp_rank.length == 0) return;
        sortByTimestamp(RANK.CHARM_TIMESTAMP, temp_rank, cb);
    });
}


function getLastweekRank(platform, start, stop, cb) {
    const FUNC = TAG + "getLastweekRank() --- ";
    RedisUtil.getRankEx(CHART.GODDESS_LW, platform, start, stop, function (err, temp_rank) {
        if (err) return cb && cb(err);
        cb && cb(null, temp_rank);
        // sortByTimestamp(RANK.CHARM_TIMESTAMP, temp_rank, cb);
    });
}

function getRankBp(platform, cb) {
    const FUNC = TAG + "getRankBp() --- ";
    RedisUtil.getRank(RANK.BP, platform, function (err, temp_rank) {
        if (err) return cb && cb(err);
        if (DEBUG) console.log(FUNC + "temp_rank:", temp_rank);
        if (temp_rank.length == 0) return;
        sortByTimestamp(RANK.BP_TIMESTAMP, temp_rank, cb);
    });
}

function getRankFlower(platform, cb) {
    const FUNC = TAG + "getRankFlower() --- ";
    RedisUtil.getRank(RANK.FLOWER, platform, function (err, temp_rank) {
        if (err) return cb && cb(err);
        if (temp_rank.length == 0) return;
        sortByTimestamp(RANK.FLOWER_TIMESTAMP, temp_rank, cb);
    });
}

function trimAll() {
    const FUNC = TAG + "trimAll() --- ";
    var start = 11000;
    var stop = 1000000000;

    var trim_list = [
        {key: RANK.GODDESS + ":1", desc: "女神闯关"},
        {key: RANK.MATCH + ":1", desc: "排位赛"},
        {key: RANK.AQUARIUM + ":1", desc: "水族馆"},
        {key: RANK.CHARM + ":1", desc: "魅力值"},
        {key: RANK.BP + ":1", desc: "捕鱼积分"},
        {key: RANK.FLOWER + ":1", desc: "鲜花榜"},

        {key: RANK.GODDESS + ":2", desc: "女神闯关"},
        {key: RANK.MATCH + ":2", desc: "排位赛"},
        {key: RANK.AQUARIUM + ":2", desc: "水族馆"},
        {key: RANK.CHARM + ":2", desc: "魅力值"},
        {key: RANK.BP + ":2", desc: "捕鱼积分"},
        {key: RANK.FLOWER + ":2", desc: "鲜花榜"},
    ];

    trim(trim_list, start, stop);
}

function trim(trim_list, start, stop, cb) {
    const FUNC = TAG + "trim() --- ";
    var trim_handled = 0;
    for (var i = 0; i < trim_list.length; i++) {
        var key = trim_list[i].key;
        var desc = trim_list[i].desc;
        RedisUtil.zrevremrangebyrank(key, start, stop, function (err, count) {
            DEBUG = 0;
            if (DEBUG) console.log(FUNC + "本次移除" + desc + "数据条数:", count);
            DEBUG = 0;
            trim_handled++;
            if (trim_handled >= trim_list.length) {
                cb && cb();
            }
        });
    }
}

/**
 * 生成10个排行榜(每个平台5个)
 * 金币排行榜暂时不生成.
 */
function generate() {
    const DT = 5000;
    var time_gap = 1000 - DT;
    for (var platform = 1; platform <= 2; platform++) {
        getRank(platform);
    }

    function getRank(platform) {

        time_gap += DT;
        setTimeout(function () {
            getRankBp(platform, function (err, rank_list) {
                DEBUG = 0;
                if (DEBUG) console.log("平台" + platform + "捕鱼积分排行榜:\n", rank_list);
                DEBUG = 0;
                var chart_string = JSON.stringify(rank_list);
                RedisUtil.publish(CHANNEL.CHART_BP + ":" + platform, chart_string);
                RedisUtil.set(CHART.BP + ":" + platform, chart_string);
            });
        }, time_gap);

        time_gap += DT;
        setTimeout(function () {
            getRankGoddess(platform, function (err, rank_list) {
                if (DEBUG) console.log("平台" + platform + "保卫女神排行榜:\n", rank_list);
                var chart_string = JSON.stringify(rank_list);
                RedisUtil.publish(CHANNEL.CHART_GODDESS + ":" + platform, chart_string);
                RedisUtil.set(CHART.GODDESS + ":" + platform, chart_string);
            });
        }, time_gap);

        time_gap += DT;
        setTimeout(function () {
            getRankMatch(platform, function (err, rank_list) {
                if (DEBUG) console.log("平台" + platform + "排位赛排行榜:\n", rank_list);
                var chart_string = JSON.stringify(rank_list);
                RedisUtil.publish(CHANNEL.CHART_MATCH + ":" + platform, chart_string);
                RedisUtil.set(CHART.MATCH + ":" + platform, chart_string);
            });
        }, time_gap);

        time_gap += DT;
        setTimeout(function () {
            getRankAquarium(platform, function (err, rank_list) {
                if (DEBUG) console.log("平台" + platform + "水族馆排行榜:\n", rank_list);
                var chart_string = JSON.stringify(rank_list);
                RedisUtil.publish(CHANNEL.CHART_AQUARIUM + ":" + platform, chart_string);
                RedisUtil.set(CHART.AQUARIUM + ":" + platform, chart_string);
            });
        }, time_gap);

        time_gap += DT;
        setTimeout(function () {
            getRankCharm(platform, function (err, rank_list) {
                if (DEBUG) console.log("平台" + platform + "魅力值排行榜:\n", rank_list);
                for (var i = 0; i < rank_list.length; i++) {
                    var ac = rank_list[i];
                    ac.charm_rank = CharmUtil.getCharmCfgLevel(ac.score, i + 1);
                    ac.myTempCharmRank = i + 1; //临时魅力排名
                    // CacheAccount.setCharmRank(ac.uid, ac.charm_rank);
                    RedisUtil.hset(PAIR.UID_CHARM_RANK, ac.uid, ac.charm_rank);
                }
                var chart_string = JSON.stringify(rank_list);
                RedisUtil.publish(CHANNEL.CHART_CHARM + ":" + platform, chart_string);
                RedisUtil.set(CHART.CHARM + ":" + platform, chart_string);
            });
        }, time_gap);

        time_gap += DT;
        setTimeout(function () {
            getRankFlower(platform, function (err, rank_list) {
                if (DEBUG) console.log("平台" + platform + "鲜花排行榜:\n", rank_list);
                // RedisUtil.publish(CHANNEL.CHART_FLOWER + ":" + platform, JSON.stringify(rank_list));
                var chart_string = JSON.stringify(rank_list);
                RedisUtil.publish(CHANNEL.CHART_FLOWER + ":" + platform, chart_string);
                RedisUtil.set(CHART.FLOWER + ":" + platform, chart_string);
            });
        }, time_gap);
    }
}

const CHART_NAME_LIST = [
    'GODDESS',
    'MATCH',
    'AQUARIUM',
    'CHARM',
    'BP',
    'FLOWER',
];

const CHART_NAME_LIST_LW = [
    'GODDESS',
];

// RW: Reset Weekly
const CHART_NAME_LIST_RW = [
    'GODDESS',
    'BP',
    'FLOWER',
];

const CHART_NAME_LIST_LM = [
    'MATCH',
];

// RW: Reset Monthly
const CHART_NAME_LIST_RM = [
    'MATCH',
];

/**
 * 服务器重启后初始化所有的排行榜数据
 * yTODO: 初始化昨日, 上周, 上月排行榜
 */
function initAll() {
    const FUNC = TAG + "initAll() --- ";

    var op_list = [];
    var channel_list = [];
    for (var platform = 1; platform <= 2; platform++) {
        for (var i = 0; i < CHART_NAME_LIST.length; i++) {
            var chart_name = CHART_NAME_LIST[i];
            op_list.push(['get', CHART[chart_name] + ":" + platform]);
            channel_list.push(CHANNEL['CHART_' + chart_name] + ":" + platform);
        }
    }
    RedisUtil.multi(op_list, function (err, res) {
        if (err) return console.error(FUNC + "初始化排行榜失败");
        if (res.length != channel_list.length) {
            throw new Error("保证op_list和channel_list数组长度一致");
        }
        for (var i = 0; i < res.length; i++) {
            resetCharts(channel_list[i], res[i]);
        }
    });
}

/**
 * 每日23:59:00产生一个昨日排行榜, 用于用户领取奖励.
 */
function generateDailyReward() {
    const FUNC = TAG + "generateDailyReward() --- ";
    if (DEBUG) console.log(FUNC + "CALL...");

    for (var platform = 1; platform <= 2; platform++) {
        for (var i = 0; i < CHART_NAME_LIST.length; i++) {
            generateOne(i, platform);
        }
    }

    function generateOne(i, platform) {
        var chart_name = CHART_NAME_LIST[i];
        var hashkey = CHART[chart_name + '_YD'] + ":" + platform;
        var key = CHART[chart_name + '_YD_STR'] + ":" + platform;
        RedisUtil.del(hashkey, function () {
            makeNewChartYD();
        });

        function makeNewChartYD() {
            RedisUtil.get(CHART[chart_name] + ":" + platform, function (err, chart_string) {
                if (err) return console.error(FUNC + "产生每日" + chart_name + "排行榜失败:", err);
                if (DEBUG) console.log(FUNC + "产生每日" + chart_name + "排行榜成功");
                if (DEBUG) console.log(FUNC + "key:", key);
                if (DEBUG) console.log(FUNC + "chart_string:", chart_string);
                makeNewChart(hashkey, key, chart_string, FUNC);
            });
        }
    }
}

/**
 * 每周日23:59:00产生一个上周排行榜, 用于用户领取奖励.
 */
function generateWeeklyReward() {
    const FUNC = TAG + "generateWeeklyReward() --- ";
    console.log(FUNC + "CALL...");

    for (var platform = 1; platform <= 2; platform++) {
        for (var i = 0; i < CHART_NAME_LIST_LW.length; i++) {
            generateOne(i, platform);
        }
    }

    function generateOne(i, platform) {
        var chart_name = CHART_NAME_LIST_LW[i];
        var hashkey = CHART[chart_name + '_LW'] + ":" + platform;
        var key = CHART[chart_name + '_YD_STR'] + ":" + platform;
        RedisUtil.del(hashkey, function () {
            makeNewChartLW();
        });

        function makeNewChartLW() {
            RedisUtil.get(CHART[chart_name] + ":" + platform, function (err, chart_string) {
                if (err) return console.error(FUNC + "产生每周" + chart_name + "排行榜失败:", err);
                makeNewChart(hashkey, key, chart_string, FUNC);
            });
        }
    }
}

/**
 * 每月1号凌晨产生一个上月排行榜, 用于用户领取奖励.
 */
function generateMonthlyReward() {
    const FUNC = TAG + "generateMonthlyReward() --- ";
    console.log(FUNC + "CALL...");

    for (var platform = 1; platform <= 2; platform++) {
        for (var i = 0; i < CHART_NAME_LIST_LM.length; i++) {
            generateOne(i, platform);
        }
    }

    function generateOne(i, platform) {
        var chart_name = CHART_NAME_LIST_LM[i];
        var hashkey = CHART[chart_name + '_LM'] + ":" + platform;
        var key = CHART[chart_name + '_YD_STR'] + ":" + platform;
        RedisUtil.del(hashkey, function () {
            makeNewChartLM();
        });

        function makeNewChartLM() {
            RedisUtil.get(CHART[chart_name] + ":" + platform, function (err, chart_string) {
                if (err) return console.error(FUNC + "产生每月" + chart_name + "排行榜失败:", err);
                makeNewChart(hashkey, key, chart_string, FUNC);
            });
        }
    }
}

/**
 * 根据chart_string生成一个排行榜hash表然后设置到hashkey中.
 */
function makeNewChart(hashkey, chartkey, chart_string, CALL_FUNC) {
    const FUNC = TAG + "makeNewChart() --- ";
    // console.log(FUNC + CALL_FUNC + "chart_string:", chart_string);
    var chart_arr = JSON.parse(chart_string);
    var new_chart_arr = [];
    var map = {};
    if (chart_arr && chart_arr.length > 0) {
        for (var i = 0; i < chart_arr.length; i++) {
            var account = chart_arr[i];
            var chart_info = {
                uid: account.uid,
                score: account.score,
                my_rank: i + 1,
                reward: 1,
            };
            var key = chart_info.uid;
            var value = JSON.stringify(chart_info);
            // console.log(FUNC + ">>>>key:", key);
            // console.log(FUNC + ">>>>value:", value);
            map[key] = value;
            new_chart_arr.push({
                uid: account.uid,
                score: account.score,
                my_rank: account.my_rank,
            });
        }
        RedisUtil.hmset(hashkey, map);
        // key对应一个排行榜的字符串, 取出后可以直接解析成一个数组型的排行榜
        // 由于存的值是字符串, 所以不用重置.
        RedisUtil.set(chartkey, JSON.stringify(new_chart_arr));
        if (DEBUG) console.log(FUNC + CALL_FUNC + "排行榜已经生成:", chartkey);
    }
    else {
        if (DEBUG) console.log(FUNC + CALL_FUNC + "排行榜没有生成:", chart_string);
    }
}

/**
 * 获取玩家历史排名(用于奖励发放, 分类为昨日，上周，上月)
 */
function getUserRank(req, dataObj, cb) {
    const FUNC = TAG + "getUserRank() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "get_user_rank");

    _getUserRank(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'account_id', 'type'], "buzz_charts", cb);
    }
}

/**
 * 获取排行榜奖励(根据玩家ID从排行榜中获取名次并发给对应的奖励)
 */
function getChartReward(req, dataObj, cb) {
    const FUNC = TAG + "getChartReward() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "get_chart_reward");

    _getChartReward(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'type'], "buzz_charts", cb);
    }
}


/**
 * 接收定时生成的排行榜数据并设置到各自服务器的缓存中.
 */
function resetCharts(channel, message) {
    const FUNC = TAG + "resetCharts() --- ";

    var rank_list = null;
    try {
        rank_list = JSON.parse(message);
    }
    catch (err) {
        if (ERROR) console.log(FUNC + "收到的排行榜信息有误, 不再继续下去");
        if (ERROR) console.log(FUNC + "err:\n", err);
        return;
    }

    switch (channel) {
        // Android
        case CHANNEL.CHART_GODDESS + ":1":
            CacheCharts.setChart(1, RANK_TYPE.GODDESS, rank_list);
            break;
        case CHANNEL.CHART_MATCH + ":1":
            CacheCharts.setChart(1, RANK_TYPE.MATCH, rank_list);
            break;
        case CHANNEL.CHART_AQUARIUM + ":1":
            CacheCharts.setChart(1, RANK_TYPE.AQUARIUM, rank_list);
            break;
        case CHANNEL.CHART_CHARM + ":1":
            CacheCharts.setChart(1, RANK_TYPE.CHARM, rank_list);
            break;
        case CHANNEL.CHART_BP + ":1":
            if (DEBUG) console.log("------------------------生成一个捕鱼积分排行榜");
            CacheCharts.setChart(1, RANK_TYPE.BP, rank_list);
            break;
        case CHANNEL.CHART_FLOWER + ":1":
            CacheCharts.setChart(1, RANK_TYPE.FLOWER, rank_list);
            break;

        // iOS
        case CHANNEL.CHART_GODDESS + ":2":
            CacheCharts.setChart(2, RANK_TYPE.GODDESS, rank_list);
            break;
        case CHANNEL.CHART_MATCH + ":2":
            CacheCharts.setChart(2, RANK_TYPE.MATCH, rank_list);
            break;
        case CHANNEL.CHART_AQUARIUM + ":2":
            CacheCharts.setChart(2, RANK_TYPE.AQUARIUM, rank_list);
            break;
        case CHANNEL.CHART_CHARM + ":2":
            CacheCharts.setChart(2, RANK_TYPE.CHARM, rank_list);
            break;
        case CHANNEL.CHART_BP + ":2":
            CacheCharts.setChart(2, RANK_TYPE.BP, rank_list);
            break;
        case CHANNEL.CHART_FLOWER + ":2":
            CacheCharts.setChart(2, RANK_TYPE.FLOWER, rank_list);
            break;
    }
}

function getTop(platform, type, num) {
    var chart = CacheCharts.getChart(platform, type, 0, num);
    formatChart(chart, "max_wave", 0);
    return chart;
}

/**
 * 客户端接口获取排行榜入口
 */
function getCharts(req, dataObj, cb) {
    const FUNC = TAG + "getCharts() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "get_ranking");

    _getCharts(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'account_id', 'ranking_count',], "buzz_charts", cb);
    }
}

/**
 * buzz_social调用接口
 */
function getFriendsCharts(pool, list, cb) {
    const FUNC = TAG + "getFriendsCharts() --- ";
    // 需要将uid_list中的空值去掉
    var uid_list = [];
    for (var i = 0; i < list.length; i++) {
        if (list[i] && !ArrayUtil.contain(uid_list, list[i])) uid_list.push(list[i]);
    }
    getFriendsDetailInfo(pool, uid_list, function (err, rank_list) {
        if (err) return cb && cb(err);
        // TODO: 按比赛胜点进行排序
        ArrayUtil.sort(rank_list, "points", SORT_RULE.DESC, "timestamp", SORT_RULE.INC);
        cb && cb(null, rank_list);
    });
}

function getFriendsDetailInfo(pool, uid_list, cb) {

    if (uid_list.length === 0) {
        cb(null, []);
        return;
    }
    const FUNC = TAG + "getFriendsDetailInfo() --- ";

    var rank_list = [];
    for (var i = 0; i < uid_list.length; i++) {
        rank_list.push({id: uid_list[i]});
    }

    var field = [
        "nickname",
        "rank",
        "points",
        "vip",
        "weapon",
        "weapons",
        "figure_url",
        "timestamp",
        "charm_rank",
        "channel_account_name",
        "tempname"
    ];

    var data = [
        ['hmget', PAIR.UID_NAME, uid_list],
        ['hmget', PAIR.UID_RANK, uid_list],
        ['hmget', PAIR.UID_POINTS, uid_list],
        ['hmget', PAIR.UID_VIP, uid_list],
        ['hmget', PAIR.UID_WEAPON, uid_list],
        ['hmget', "pair:uid:weapon_skin", uid_list],
        ['hmget', "pair:uid:figure_url", uid_list],
        ['hmget', RANK.MATCH_TIMESTAMP, uid_list],
        ['hmget', PAIR.UID_CHARM_RANK, uid_list],
        ['hmget', "pair:uid:channel_account_name", uid_list],
        ['hmget', "pair:uid:tempname", uid_list],
    ];

    RedisUtil.multi(data, function (err, res) {
        if (err) return cb && cb(err);
        for (var i = 0; i < res.length; i++) {
            setOneProperty(i, res);
        }
        var noid = [];

        // 设置客户端需要的值
        for (var i = 0; i < rank_list.length; i++) {
            var account = rank_list[i];
            //account.id = account.uid;

            //todo 查询数据库
            if (account.nickname == null) {
                if (account.channel_account_name && account.channel_account_name != "") {
                    account.nickname = account.channel_account_name;
                }
                else if (account.tempname && account.channel_account_name != "") {
                    account.nickname = account.tempname;
                }
                else {
                    noid.push(account.id);
                }
            }
            if (account.nickname == "") {
                if (account.channel_account_name && account.channel_account_name != "") {
                    account.nickname = account.channel_account_name;
                }
                else if (account.tempname && account.tempname != "") {
                    account.nickname = account.tempname;
                }
            }
        }
        if (noid.length > 0) {
            var sql = "SELECT ";
            sql += "a.id,";
            sql += "a.tempname,";
            sql += "a.channel_account_name,";
            sql += "a.nickname,";
            sql += "i.`web_url` AS figure_url,";
            sql += "a.vip,";
            sql += "a.weapon,";
            sql += "a.weapon_skin,";
            sql += "a.charm_rank,";
            sql += "r.rank,";
            sql += "r.points ";
            sql += "FROM `tbl_account` a ";
            sql += "left join `tbl_img` i on a.figure=i.id ";
            sql += "left join `tbl_rankgame` r on r.id=a.id ";
            sql += "where a.id in (" + noid.toString() + ")";

            var sql_data = [];

            pool.query(sql, sql_data, function (err, row) {
                if (err) {
                    cb(err);
                    return;
                }
                for (var j = 0; j < row.length; j++) {
                    var result = row[j];
                    let acc = {};
                    for (let k in rank_list) {
                        if (rank_list[k].id == result.id) {
                            acc = rank_list[k];
                        }
                    }

                    acc.nickname = result.channel_account_name;
                    if (!acc.nickname || acc.nickname == "") acc.nickname = result.nickname;
                    if (!acc.nickname || acc.nickname == "") acc.nickname = result.tempname;
                    acc.figure_url = result.figure_url;
                    acc.weapon = result.weapon;
                    var weapon_skin = result.weapon_skin && JSON.parse(result.weapon_skin);
                    acc.weapons = weapon_skin && weapon_skin.own;
                    acc.charm_rank = result.charm_rank;
                    acc.rank = result.rank;
                    acc.vip = result.vip;
                    acc.points = result.points;
                }
                cb && cb(null, rank_list);
            });
        } else {
            cb && cb(null, rank_list);
        }

    });

    function setOneProperty(i, res) {
        for (var rank_idx = 0; rank_idx < rank_list.length; rank_idx++) {
            setUserRank(i, rank_idx, res);
        }
    }

    function setUserRank(i, rank_idx, res) {
        var user_rank = rank_list[rank_idx];
        user_rank[field[i]] = res[i][rank_idx];
        switch (field[i]) {
            case "timestamp":
            case "vip":
            case "weapon":
            case "rank":
            case "charm_rank":
                user_rank[field[i]] = user_rank[field[i]] && parseInt(user_rank[field[i]]) || 0;
                break;

            case "weapons":
                try {
                    // 临时处理代码, 处理用户好友数据不匹配的问题
                    if (JSON.parse(user_rank[field[i]]) == null) {
                        user_rank[field[i]] = [1];
                    }
                    else {
                        user_rank[field[i]] = ArrayUtil.delRepeat(JSON.parse(user_rank[field[i]]).own);
                    }
                    //user_rank.weapons = user_rank[field[i]];
                }
                catch (err) {
                    console.error(FUNC + "err", err);
                    console.error(FUNC + "user_rank[field[i]]:", user_rank[field[i]]);
                    if (DEBUG) {
                        console.log(FUNC + "i:", i);
                        console.log(FUNC + "rank_idx:", rank_idx);
                        console.log(FUNC + "res:", res);
                        console.log(FUNC + "res[i]:", res[i]);
                        console.log(FUNC + "user_rank:", user_rank);
                    }
                }
                break;
        }
    }

}

/**
 * 每周重置排行榜(bp, goddess, flower)
 */
function resetChartWeekly(cb) {
    const FUNC = TAG + "resetChartWeekly() --- ";
    var data = [];
    for (var platform = 1; platform <= 2; platform++) {
        for (var i = 0; i < CHART_NAME_LIST_RW.length; i++) {
            var delKey = RANK[CHART_NAME_LIST_RW[i]] + ":" + platform;
            console.log(FUNC + "delKey:", delKey);
            data.push(['del', delKey]);
        }
    }

    data.push(['del', PAIR.UID_BP]);
    data.push(['del', PAIR.UID_FLOWER_RECEIVE_WEEKLY]);
    //data.push(['del', PAIR.UID_FLOWER_RECEIVE]);// yTODO: ；历史鲜花不需要每周重置

    if (DEBUG) console.log(FUNC + "data:", data);

    RedisUtil.multi(data, function (err, res) {
        if (err) return cb && cb(err);
        cb && cb(null, "success");
    });
}

/**
 * 每周重置排行榜(match)
 */
function resetChartMonthly(cb) {
    const FUNC = TAG + "resetChartMonthly() --- ";

    console.log(FUNC + "CALL...");
    // yTODO: Match的重置不是简单重置, 而是根据一个算法来进行
    var data = [];
    for (var platform = 1; platform <= 2; platform++) {
        for (var i = 0; i < CHART_NAME_LIST_RM.length; i++) {
            data.push(['del', RANK[CHART_NAME_LIST_RM[i]] + ":" + platform]);
        }
    }

    if (DEBUG) console.log(FUNC + "data:", data);

    RedisUtil.multi(data, function (err, res) {
        if (err) return cb && cb(err);

        resetAllMatchData();
    });

    var count_ret = 0;
    console.time("遍历元素耗时");
    console.time("每月重置Redis比赛数据耗时");

    function resetAllMatchData() {
        RedisUtil.repeatHscan(PAIR.UID_POINTS, 0, 1000,
            function op(res, nextCursor) {
                var uid_list = res[1];
                console.log(FUNC + "uid_list:", uid_list);
                // 所有操作结束后才进行下一个操作
                resetMatchPoints(uid_list, function () {
                    count_ret += uid_list.length / 2;
                    nextCursor();
                });
            },
            function next() {
                console.log("全部遍历完毕");
                console.log("遍历元素个数:", count_ret);
                console.timeEnd("遍历元素耗时");
                // 使用trim切割比赛排行榜
                var start = 11000;
                var stop = 1000000000;
                //todo 更新到mysql
                let fields = [];
                for(let i in sql_pojo.tbl_rankgame) {
                    fields.add(i);
                }
                let repeat = RedisUtil.tco(function (key,i=0,count=1000) {
                    RedisUtil.hscan(key,i,count,function (err, res) {
                        let cursor = res[0];
                        let list = res[1];
                        for (let i = 0; i < list.length; i += 2){
                            let id = list[i];
                            redisSync.getAccountById(id,fields,function (err, account) {
                                if(account && account.match_points>800 && account.match_win+account.match_fail>0) {
                                    common.syncUser(account,function (err, result) {
                                        err && console.log(err);
                                    });
                                }
                            });

                        }
                        if(cursor==0){
                            console.log("更新到mysql结束");
                        }else {
                            repeat(key, cursor,count);
                        }
                    })
                });
                repeat("pair:uid:platform");


                var trim_list = [
                    {key: RANK.MATCH + ":1", desc: "排位赛"},
                    {key: RANK.MATCH + ":2", desc: "排位赛"},
                ];
                trim(trim_list, start, stop, function () {
                    // 生成一个新的排行榜
                    generateMatchCharts();
                    console.timeEnd("每月重置Redis比赛数据耗时");
                    cb && cb(null, "重置完成, 等待新的排行榜生成");
                    // yTODO: 数据库重置
                });
            });
    }

    /**
     * 生成一个新的比赛排行榜
     */
    function generateMatchCharts() {
        const DT = 200000;
        var time_gap = -19000;
        for (var platform = 1; platform <= 2; platform++) {
            time_gap += DT;
            setTimeout(function () {
                getRankMatch(platform, function (err, rank_list) {
                    if (DEBUG) console.log("平台" + platform + "排位赛排行榜:\n", rank_list);
                    var chart_string = JSON.stringify(rank_list);
                    RedisUtil.publish(CHANNEL.CHART_MATCH + ":" + platform, chart_string);
                    RedisUtil.set(CHART.MATCH + ":" + platform, chart_string);
                });
            }, time_gap);
        }
    }

    /**
     * 重置一个玩家的goddess_free和goddess_crossover
     */
    function resetMatchPoints(uid_list, cb) {
        var data = [
            ['hmget', PAIR.UID_POINTS, uid_list],
            ['hmget', PAIR.UID_PLATFORM, uid_list],
        ];
        RedisUtil.multi(data, function (err, res) {

            console.log(FUNC + "res:", res);

            let all_points = res[0];
            let all_platforms = res[1];

            console.log(FUNC + "uid_list.length:", uid_list.length);
            console.log(FUNC + "all_points.length:", all_points.length);
            console.log(FUNC + "all_platforms.length:", all_platforms.length);

            var map_match_points = [];
            var map_match_rank = [];

            var map_match_season_count = [];
            var map_match_season_win = [];
            var map_match_season_box = [];
            var map_match_season_first_win = [];

            var map_match_zadd_1 = [];// ANDROID平台
            var map_match_zadd_2 = [];// iOS平台
            for (var i = 0; i < uid_list.length; i++) {
                var new_points = 800;
                var new_rank = 5;
                var uid = uid_list[i];
                var points = all_points[i];
                var platform = parseInt(all_platforms[i]);
                if (points > new_points) {
                    new_points = Math.floor(740 + Math.max(points - 800, 100) * 0.6);
                    new_rank = BuzzUtil.getRankIdFromPoints(new_points);
                }
                map_match_points.push(uid);
                map_match_points.push(new_points);
                map_match_rank.push(uid);
                map_match_rank.push(new_rank);

                map_match_season_count.push(uid);
                map_match_season_count.push(0);
                map_match_season_win.push(uid);
                map_match_season_win.push(0);
                map_match_season_box.push(uid);
                map_match_season_box.push(0);
                map_match_season_first_win.push(uid);
                map_match_season_first_win.push(0);

                if (platform == 1) {
                    map_match_zadd_1.push(new_points);
                    map_match_zadd_1.push(uid);
                }
                else if (platform == 2) {
                    map_match_zadd_2.push(new_points);
                    map_match_zadd_2.push(uid);
                }
            }
            var data = [];
            data.push(['hmset', PAIR.UID_POINTS, map_match_points]);
            data.push(['hmset', PAIR.UID_RANK, map_match_rank]);

            // BUG: 需要重置本季的数据
            // data.push(['hmset', PAIR.UID_MATCH_SEASON_COUNT, map_match_season_count]);
            // data.push(['hmset', PAIR.UID_MATCH_SEASON_WIN, map_match_season_win]);
            // data.push(['hmset', PAIR.UID_MATCH_SEASON_BOX, map_match_season_box]);
            // data.push(['hmset', PAIR.UID_MATCH_SEASON_1ST_WIN, map_match_season_first_win]);
            data.push(['hmset', 'pair:uid:match_season_count', map_match_season_count]);
            data.push(['hmset', 'pair:uid:match_season_win', map_match_season_win]);
            data.push(['hmset', 'pair:uid:match_season_box', map_match_season_box]);
            data.push(['hmset', 'pair:uid:match_season_1st_win', map_match_season_first_win]);

            // 使用zadd将新的UID_POINTS设置到RANK.MATCH中
            // BUG: 此处设置排行榜的时候没有区分平台
            if (map_match_zadd_1.length > 0) {
                data.push(['zadd', RANK.MATCH + ":1", map_match_zadd_1]);
            }
            if (map_match_zadd_2.length > 0) {
                data.push(['zadd', RANK.MATCH + ":2", map_match_zadd_2]);
            }

            console.log(FUNC + "data:", data);
            RedisUtil.multi(data, function (err, res) {
                cb && cb();
            });
        });
    }
}

//==============================================================================
// 私有方法
//==============================================================================

function _getUserRank(req, dataObj, cb) {
    const FUNC = TAG + "_getUserRank() --- ";
    const EFUNC = "<<<ERROR>>>" + TAG + "_getUserRank() --- ";

    var uid = dataObj.account_id;
    var token = dataObj.token;
    var type = dataObj.type;

    var pool = req.pool;

    DaoCommon.checkAccount(pool, token, function (error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {
        _getUserRankByType(account, type, function (ret) {
            cb(null, ret);
        });
    }
}

/**
 * 通用方法, 用于获取玩家的排行信息
 * @param type 排行榜类型
 */
function _getUserRankByType(account, type, cb) {
    const FUNC = TAG + "_getUserRankByType() --- ";
    var uid = account.id;
    var platform = account.platform;
    var ret = {};

    for (var i = 0; i < CHART_NAME_LIST.length; i++) {
        var chart_name = CHART_NAME_LIST[i];

        if (DEBUG) {
            console.log(FUNC + "type:", type);
            console.log(FUNC + "RANK_TYPE[chart_name + '_YD']:", RANK_TYPE[chart_name + '_YD']);
        }

        if (RANK_TYPE[chart_name + '_YD'] == type) {

            var hashkey = CHART[chart_name + '_YD'] + ":" + platform;
            if (DEBUG) {
                console.log(FUNC + "chart_name:", chart_name);
                console.log(FUNC + "hashkey:", hashkey);
            }
            RedisUtil.hget(hashkey, uid, function (err, ret) {

                if (DEBUG) console.log(FUNC + "ret:", ret);
                if (ret) {
                    ret = JSON.parse(ret);
                }

                // reward=0表示已经没有奖励可领了
                // reward=1表示有奖励还没领
                if (!ret) {
                    ret = {};
                    ret.my_rank = 10001;
                    ret.reward = 0;
                }
                DEBUG = 0;
                if (DEBUG) {
                    console.log("===================================");
                    console.log(FUNC + "ret:", ret);
                }
                DEBUG = 0;
                cb(ret, hashkey);
            });

            break;
        }
    }
    // yTODO: 把三块代码提取一个公共方法出来

    // 周和月排行信息获取
    for (var i = 0; i < CHART_NAME_LIST_LW.length; i++) {
        var chart_name = CHART_NAME_LIST_LW[i];

        if (RANK_TYPE[chart_name + '_LW'] == type) {

            var hashkey = CHART[chart_name + '_LW'] + ":" + platform;
            if (DEBUG) {
                console.log(FUNC + "chart_name:", chart_name);
                console.log(FUNC + "hashkey:", hashkey);
            }
            RedisUtil.hget(hashkey, uid, function (err, ret) {

                console.log(FUNC + "ret:", ret);
                if (ret) {
                    ret = JSON.parse(ret);
                }

                // reward=0表示已经没有奖励可领了
                // reward=1表示有奖励还没领
                if (!ret) {
                    ret = {};
                    ret.my_rank = 10001;
                    ret.reward = 0;
                }
                DEBUG = 0;
                if (DEBUG) {
                    console.log("===================================");
                    console.log(FUNC + "ret:", ret);
                }
                DEBUG = 0;
                cb(ret, hashkey);
            });

            break;
        }
    }

    for (var i = 0; i < CHART_NAME_LIST_LM.length; i++) {
        var chart_name = CHART_NAME_LIST_LM[i];

        if (RANK_TYPE[chart_name + '_LM'] == type) {

            var hashkey = CHART[chart_name + '_LM'] + ":" + platform;
            if (DEBUG) {
                console.log(FUNC + "chart_name:", chart_name);
                console.log(FUNC + "hashkey:", hashkey);
            }
            RedisUtil.hget(hashkey, uid, function (err, ret) {

                if (DEBUG) console.log(FUNC + "ret:", ret);
                if (ret) {
                    ret = JSON.parse(ret);
                }

                // reward=0表示已经没有奖励可领了
                // reward=1表示有奖励还没领
                if (!ret) {
                    ret = {};
                    ret.my_rank = 10001;
                    ret.reward = 0;
                }
                DEBUG = 0;
                if (DEBUG) {
                    console.log("===================================");
                    console.log(FUNC + "ret:", ret);
                }
                DEBUG = 0;
                cb(ret, hashkey);
            });

            break;
        }
    }

}

function _getChartReward(req, dataObj, cb) {
    const FUNC = TAG + "_getChartReward() --- ";
    const EFUNC = "<<<ERROR>>>" + TAG + "_getChartReward() --- ";

    // var uid = dataObj.account_id;
    var uid = dataObj.uid;
    var token = dataObj.token;
    var type = dataObj.type;

    var pool = req.pool;

    DaoCommon.checkAccount(pool, token, function (error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {
        _getUserRankByType(account, type, function (rank_ret, hashkey) {
            var myRank = rank_ret.my_rank;
            var rewardStat = rank_ret.reward || 0;
            var score = rank_ret.score;

            if (DEBUG) console.log(FUNC + "myRank:", myRank);
            if (DEBUG) console.log(FUNC + "rewardStat:", rewardStat);
            if (DEBUG) console.log(FUNC + "type:", type);
            if (DEBUG) console.log(FUNC + "score:", score);

            var reward = null;

            // 每日奖励
            if (type > 100 && type < 1000) {
                console.log(FUNC + "领取每日奖励");
                if (rewardStat == 1) {
                    console.log(FUNC + "可以领取");
                    type = type % 100 + 1;
                    reward = BuzzUtil.getChartRewardByTypeAndRank(type, myRank);
                }
                else {
                    if (DEBUG) console.log(FUNC + "不可领取");
                }
            }
            // 每周奖励
            else if (type > 1000 && type < 10000) {
                if (DEBUG) console.log(FUNC + "领取每周奖励");
                // goddess_rankreward_cfg
                if (rewardStat == 1) {
                    if (DEBUG) console.log(FUNC + "可以领取");
                    // type = type % 1000 + 1;
                    reward = BuzzUtil.getGoddessChartRewardByRank(myRank, score);
                }
                else {
                    if (DEBUG) console.log(FUNC + "不可领取");
                }
            }
            // 每月奖励
            else if (type > 10000) {
                if (DEBUG) console.log(FUNC + "领取每月奖励");
                // rank_rankgame_cfg
                if (rewardStat == 1) {
                    if (DEBUG) console.log(FUNC + "可以领取");
                    type = type % 10000 + 1;
                    reward = BuzzUtil.getSeasonRewardFromRankgameCfg(myRank);
                }
                else {
                    if (DEBUG) console.log(FUNC + "不可领取");
                }
            }
            if (DEBUG) console.log(FUNC + "reward:", reward);

            if (reward != null) {
                var item_list = BuzzUtil.getItemList(reward);
                if (DEBUG) console.log("item_list:", item_list);
                BuzzUtil.putIntoPack(req, account, item_list, function (reward_info) {
                    var change = BuzzUtil.getChange(account, reward_info);
                    var ret = {
                        item_list: item_list,
                        change: change,
                        my_rank: myRank,
                        reward: 0,
                    };
                    cb(null, ret);
                    // 修改Redis中的状态
                    rank_ret.reward = 0;
                    RedisUtil.hset(hashkey, uid, JSON.stringify(rank_ret));

                    for (var i = 0; i < item_list.length; i++) {
                        var item_info = item_list[i];
                        console.log(FUNC + "item_info.item_id:", item_info.item_id);

                        if ('i001' == item_info.item_id) {
                            if (DEBUG) console.log(FUNC + "排行榜奖励中有金币");

                            // yDONE: 金币数据记录
                            var data = {
                                account_id: uid,
                                token: token,
                                total: change.gold,
                                duration: 0,
                                group: [{
                                    "gain": item_info.item_num,
                                    "cost": 0,
                                    "scene": common_log_const_cfg.CHARTS_REWARD,
                                }],
                            };
                            dao_gold.addGoldLogCache(pool, data, function (err, res) {
                                if (err) return console.error(FUNC + "err:", err);
                            });
                        }
                        if ('i002' == item_info.item_id) {
                            if (DEBUG) console.log(FUNC + uid + "排行榜奖励中获得钻石");
                            // yDONE: 钻石数据记录
                            logDiamond.push({
                                account_id: uid,
                                log_at: new Date(),
                                gain: item_info.item_num,
                                cost: 0,
                                total: change.pearl,
                                scene: common_log_const_cfg.CHARTS_REWARD,
                                nickname: 0,
                            });
                        }
                        if ('i003' == item_info.item_id) {
                            if (DEBUG) console.log(FUNC + uid + "排行榜奖励中获得话费券");
                            // yDONE: 话费券数据记录
                            let total = account.package['9']['i003'];
                            logHuafei.push({
                                uid: uid,
                                gain: item_info.item_num,
                                cost: 0,
                                total: total,
                                scene: common_log_const_cfg.CHARTS_REWARD,
                                comment: "'排行榜奖励中获得话费券'",
                                time: new Date(),
                            });
                        }
                    }
                });
            }
            else {
                // 返回错误还是返回空值
                cb(null, {});
            }
        });
    }
}

function _getCharts(req, dataObj, cb) {
    const FUNC = TAG + "_getCharts() --- uid:" + dataObj.account_id;
    const EFUNC = "<<<ERROR>>>" + TAG + "_getCharts() --- uid:" + dataObj.account_id;
    if (DEBUG) console.log(FUNC + "CALL...");// _getCharts() --- CALL...

    var uid = dataObj.account_id;
    var token = dataObj.token;
    var ranking_count = dataObj.ranking_count;
    var offset = dataObj.offset || 0;
    var type = dataObj.type || RANK_TYPE.ALL;

    var pool = req.pool;

    var start = offset;
    var stop = offset + ranking_count;

    DaoCommon.checkAccount(pool, token, function (error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {
        if (ranking_count > 100) {
            if (ERROR) console.error(EFUNC + "请求的排名数超过了限制: 最大排名:100, 请求参数:" + ranking_count);
            cb(ERROR_OBJ.RANK_COUNT_TOO_LARGE);
            return;
        }

        var platform = account.platform;

        var chart_goddess = null;
        var chart_match = null;
        var chart_aquarium = null;
        var chart_charm = null;
        var chart_bp = null;
        var chart_flower = null;

        if (DEBUG) console.log(FUNC + "type:", type);

        if (RANK_TYPE.ALL == type || RANK_TYPE.GODDESS == type) {
            var chart = CacheCharts.getChart(platform, RANK_TYPE.GODDESS, start, stop);
            var my_rank = CacheCharts.getRank(platform, RANK_TYPE.GODDESS, uid);
            formatChart(chart, "max_wave", offset);
            chart_goddess = {"rank": chart, "my_rank": my_rank};
        }
        if (RANK_TYPE.ALL == type || RANK_TYPE.RANKING == type) {
            var chart = CacheCharts.getChart(platform, RANK_TYPE.MATCH, start, stop);
            var my_rank = CacheCharts.getRank(platform, RANK_TYPE.MATCH, uid);
            formatChart(chart, "points", offset);
            chart_match = {"rank": chart, "my_rank": my_rank};
        }
        if (RANK_TYPE.ALL == type || RANK_TYPE.PETFISH == type) {
            var chart = CacheCharts.getChart(platform, RANK_TYPE.AQUARIUM, start, stop);
            var my_rank = CacheCharts.getRank(platform, RANK_TYPE.AQUARIUM, uid);
            formatChart(chart, "total_level", offset);
            chart_aquarium = {"rank": chart, "my_rank": my_rank};
        }
        if (RANK_TYPE.ALL == type || RANK_TYPE.CHARM == type) {
            var chart = CacheCharts.getChart(platform, RANK_TYPE.CHARM, start, stop);
            var my_rank = CacheCharts.getRank(platform, RANK_TYPE.CHARM, uid);
            formatChart(chart, "charm", offset);
            chart_charm = {"rank": chart, "my_rank": my_rank};
        }
        if (RANK_TYPE.ALL == type || RANK_TYPE.BP == type) {
            var chart = CacheCharts.getChart(platform, RANK_TYPE.BP, start, stop);
            var my_rank = CacheCharts.getRank(platform, RANK_TYPE.BP, uid);
            formatChart(chart, "integral", offset);
            chart_bp = {"rank": chart, "my_rank": my_rank};
        }
        if (RANK_TYPE.ALL == type || RANK_TYPE.FLOWER == type) {
            var chart = CacheCharts.getChart(platform, RANK_TYPE.FLOWER, start, stop);
            var my_rank = CacheCharts.getRank(platform, RANK_TYPE.FLOWER, uid);
            formatChart(chart, "flower", offset);
            chart_flower = {"rank": chart, "my_rank": my_rank};
        }
        var ret = {
            "rankgame": chart_match,
            "goddess": chart_goddess,
            "aquarium": chart_aquarium,
            "charm": chart_charm,
            "integral": chart_bp,
            "flower": chart_flower,
        };
        if (DEBUG) {
            console.log("===================================");
            console.log(FUNC + "ret:", ret);
        }

        cb(null, ret);
    }
}

/**
 * 返回当前客户端支持的格式
 */
function formatChart(chart, field, offset) {
    for (var i = 0; i < chart.length; i++) {
        var account = chart[i];
        account.id = account.uid;
        if (account.match_rank) {
            account.rank = account.match_rank;
        }
        account[field] = account.score;
    }
}

// 通用方法

/**
 * 根据得到此分数的时间先后来排序
 * @param type 五种排行榜的类型, 直接获取对应排行榜中每个玩家的数据时间.
 * @param temp_rank 由getRank*方法获取的前1000个玩家的数据.
 * @param cb 排序好的前1000个玩家的数据.
 */
function sortByTimestamp(type, temp_rank, cb) {
    const FUNC = TAG + "sortByTimestamp() --- ";
    var uid_list = [];
    var rank_list = [];
    for (var i = 0; i < temp_rank.length; i = i + 2) {
        var uid = temp_rank[i];
        var score = parseInt(temp_rank[i + 1]);
        rank_list.push({uid: uid, score: score});
        // 只取前1000名玩家进行时间排序
        if (i < MAX_NUM_CHART_TIMESTAMP) {
            uid_list.push(uid);
        }
    }
    RedisUtil.hmget(type, uid_list, function (err, res) {
        // console.log("玩家时间戳res:", res);
        // 只有1000个玩家的时间戳
        // 生成一个最大时间戳用于排序时排在最后.
        var current_timestamp = new Date().getTime();
        for (var i = 0; i < rank_list.length; i++) {
            if (res.length > i) {
                rank_list[i].timestamp = res[i];
            }
            else {
                rank_list[i].timestamp = current_timestamp;
            }
        }

        // 对rank_list进行achieve优先的排序, 第二个排序参数是timestamp
        ArrayUtil.sort(rank_list, "score", SORT_RULE.DESC, "timestamp", SORT_RULE.INC);

        // 获取玩家详细信息丰富排行榜.
        getUserDetailInfo(rank_list, function (err, res) {

            //
            // userInfo 数据格式如下: 
            // { 
            // uid: '69914',
            // score: 601,
            // timestamp: '1507903224815',
            // name: 'fj_69914',
            // rank: 4
            // }
            if (RANK.MATCH_TIMESTAMP == type) {
                for (let i = 0; i < rank_list.length; i++) {
                    let userInfo = rank_list[i];
                    let uid = userInfo.uid;
                    let points = userInfo.score;
                    let rank = userInfo.rank;
                    console.log(FUNC + "uid:", uid);
                    console.log(FUNC + "points:", points);
                    // 根据score, i 计算新的rank, 并在score低于某个值的时候退出循环
                    let real_rank = BuzzUtil.getRankIdFromPointsAndRank(userInfo.score, i);
                    console.log(FUNC + "real_rank:", real_rank);

                    // 生成排行榜时重置玩家PAIR中的points和rank
                    RedisUtil.hset(PAIR.UID_POINTS, uid, points);
                    if (real_rank > 0) {
                        userInfo.rank = real_rank;
                        RedisUtil.hset(PAIR.UID_RANK, uid, real_rank);
                    }
                    else {
                        if (!rank) {
                            rank = BuzzUtil.getRankIdFromPoints(points);
                        }
                        userInfo.rank = rank;
                        RedisUtil.hset(PAIR.UID_RANK, uid, rank);
                        break;
                    }
                }
            }
            for (let i = 0; i < rank_list.length; i++) {
                if (res[i]) {
                    rank_list[i].nickname = res[i].nickname;
                    rank_list[i].match_rank = res[i].match_rank;
                    rank_list[i].vip = res[i].vip;
                    rank_list[i].weapon = res[i].weapon;
                    rank_list[i].weapons = res[i].weapon_skin_own;
                    rank_list[i].figure_url = res[i].figure_url;
                    rank_list[i].charm_rank = res[i].charm_rank;
                }
            }
            cb && cb(null, rank_list);
        });

    });
}

function getUserDetailInfo(rank_list, cb) {
    const FUNC = TAG + "getUserDetailInfo() --- ";

    // 排行榜为空就不再查询用户信息了
    if (!rank_list || rank_list.length == 0) {
        return cb && cb(null, rank_list);
    }

    var ids = [];
    // 仅返回前100名的详细信息供排行榜进行显示
    var max_user_info_length = rank_list.length;
    if (max_user_info_length > MAX_NUM_CHART_USERINFO) {
        max_user_info_length = MAX_NUM_CHART_USERINFO;
    }
    for (var i = 0; i < max_user_info_length; i++) {
        ids.push(rank_list[i].uid);
    }

    async.mapSeries(ids, function (id, cb) {
            var field = [
                "id",
                "nickname",
                "match_rank",
                "vip",
                "weapon",
                "weapon_skin",
                "figure_url",
                "charm_rank",
                "channel_account_name",
                "tempname"
            ];
            redisSync.getAccountById(id, field, cb);
        }, function (err, res) {
            if (err) {
                cb && cb(err);
                return;
            }

            for (var i in res) {
                if (res[i]) {
                    res[i] = res[i].toJSON();
                    var weapon_skin = res[i].weapon_skin;
                    res[i].weapon_skin_own = weapon_skin.own;
                    if (!res[i].nickname || res[i].nickname == "") res[i].nickname = res[i].channel_account_name;
                    if (!res[i].nickname || res[i].nickname == "") res[i].nickname = res[i].tempname;
                }
            }
            // console.log(FUNC + "res:", res);
            cb && cb(null, res);
        }
    );

}