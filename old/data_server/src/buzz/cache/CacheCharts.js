////////////////////////////////////////////////////////////
// 排行榜缓存
////////////////////////////////////////////////////////////

let BuzzUtil = require('../../utils/BuzzUtil');

//==============================================================================
// Cache1000: 缓存排行榜前面1000个玩家的数据
//==============================================================================
const ANDROID = 1;
const IOS = 2;
const DEBUG = 0;
const RANK_LENGTH  = 10000;

const RANK_TYPE = {
    // Current
    ALL : -1,
    GOLD: 0,
    ACHIEVE: 1,  //成就点排行榜
    MATCH: 2,   //排位赛排行榜
    RANKING: 2,
    GODDESS: 3,  //保卫女神排行榜
    AQUARIUM: 4,  //水族馆排行榜
    PETFISH: 4,
    CHARM : 5,  //魅力值排行榜
    BP : 6,    //捕鱼积分排行榜
    FLOWER : 7,  //鲜花排行榜

    // YD: Yesterday(10*)
    GOLD_YD: 100,
    ACHIEVE_YD: 101,
    MATCH_YD: 102,
    GODDESS_YD: 103,
    AQUARIUM_YD: 104,
    CHARM_YD : 105,
    BP_YD : 106,
    FLOWER_YD : 107,

    // LW: Last Week(100*)
    GODDESS_LW: 1003,

    // YD: Last Month(1000*)
    MATCH_LM: 10002,
};

/** 排行榜由每个数据服务器各自拉取Redis数据生成并缓存. */
var all_charts = {'1':{}, '2':{}};
var TAG = "【CacheCharts】";

exports.setChart = setChart;
exports.getChart = getChart;
exports.getRank = getRank;
exports.RANK_TYPE = RANK_TYPE;

/**
 * 设置排行榜
 */
function setChart(platform, type, charts) {
    if(type==5 && charts && charts.length> 0 && charts[0].nickname === "undefined"){
        console.log(1);
    }
    all_charts[platform][type] = charts;
}

/**
 * 获取排行榜
 */
function getChart(platform, type, start, stop) {
    var ret = [];
    var charts = all_charts[platform][type];
    if (charts) {
        var range = stop - start;
        if (range > 0 ) {
            range = Math.min(charts.length, range);
            var length = start + range;
            for (var i = start; i < length; i ++) {
                var chart = charts[i];
                ret.push(chart);
            }
        }
    }
    return ret;
}

/**
 * 获取指定玩家的排名
{
    id:?,
    nickname:?,
    my_rank:?
}
 */
function getRank(platform, type, uid) {
    const FUNC = TAG + "getRank() --- ";
    var charts = all_charts[platform][type];
    var ret  = {
        id: uid,
        my_rank: RANK_LENGTH + 1,
    };
    if (charts) {
        var range = Math.min(charts.length, RANK_LENGTH);
        for (var i = 0; i < range; i ++) {
            var chart = charts[i];
            if (chart.uid == uid) {
                ret.my_rank = i + 1;
                setRankField(ret, type, chart, i, uid);
                break;
            }
        }
    }
    return ret;
}

function setRankField(ret, type, rank_info, i, uid) {
    const FUNC = TAG + "setRankField() --- ";
    //console.log(FUNC + "rank_info:", rank_info);
    switch(type) {
        case RANK_TYPE.GOLD:
            ret.gold = rank_info.score;
        break;
        case RANK_TYPE.ACHIEVE:
            ret.achieve_point = rank_info.score;
        break;
        case RANK_TYPE.GODDESS:
            ret.max_wave = rank_info.score;
        break;
        case RANK_TYPE.MATCH:
            ret.points = rank_info.score;
            ret.rank = rank_info.rank;
	        // 个人信息中返回rank, 这样客户端在排位赛界面左上角就可以使用服务器数据进行段位显示
            ret.rank = BuzzUtil.getRankIdFromPointsAndRank(ret.points, i);
	        if (ret.rank == 0) {
                ret.rank = BuzzUtil.getRankIdFromPoints(ret.points);
	        }
            if (uid == 44) {
                console.log(FUNC + "ret.rank:", ret.rank);
            }
        break;
        case RANK_TYPE.AQUARIUM:
            ret.total_level = rank_info.score;
        break;
        case RANK_TYPE.CHARM:
            ret.charm = rank_info.score;
        break;
        case RANK_TYPE.BP:
            ret.integral = rank_info.score;
        break;
        case RANK_TYPE.FLOWER:
            ret.flower = rank_info.score;
        break;
    }
}
