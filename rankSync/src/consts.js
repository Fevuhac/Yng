const rank_ranklist_cfg = require('../../cfgs/rank_ranklist_cfg');
const rank_rankgame_cfg = require('../../cfgs/rank_rankgame_cfg');
const goddess_rankreward_cfg = require('../../cfgs/goddess_rankreward_cfg');
const RANK_TYPE = {
    MATCH: 3,   //排位赛排行榜
    GODDESS: 4,  //保卫女神排行榜
    PETFISH: 5, //宠物鱼
    CHARM: 6,  //魅力值排行榜
    BP: 7,    //捕鱼积分排行榜(渔王争霸)
    FLOWER: 8,  //鲜花排行榜
};


let rank_award_config = {};
rank_ranklist_cfg.forEach(function (item) {
    if (!rank_award_config[item.type]) {
        rank_award_config[item.type] = [];
    }
    rank_award_config[item.type].push({
        interval: item.interval,    //--排名区间
        reward: item.reward,    //--奖励
    })

});

//----------------------------------------------------------------------

let rank_weekaward_config = {};
goddess_rankreward_cfg.forEach(function (item) {
    if (!rank_weekaward_config[RANK_TYPE.GODDESS]) {
        rank_weekaward_config[RANK_TYPE.GODDESS] = [];
    }
    rank_weekaward_config[RANK_TYPE.GODDESS].push({
        interval: item.interval,    //--排名区间
        reward: item.weekreward,    //--奖励
        limit: item.limit,    //--波数限制
    })
});

let rank_monthaward_config = {};
rank_rankgame_cfg.forEach(function (item) {
    if (!rank_monthaward_config[RANK_TYPE.MATCH]) {
        rank_monthaward_config[RANK_TYPE.MATCH] = [];
    }
    rank_monthaward_config[RANK_TYPE.MATCH].push({
        rank: item.id,    //--排名区间
        reward: item.seasonreward,    //--奖励
    })
});

//----------------------------------------------------------------------


function getWeekAwardGoddess(rank, wave) {
    let goddessWeekAward = rank_weekaward_config[RANK_TYPE.GODDESS];
    for (var i = 0; i < goddessWeekAward.length; i++) {
        var rankreward_info = goddessWeekAward[i];
        var interval = rankreward_info.interval;
        if (i > 0) {
            var rankreward_info_last = goddessWeekAward[i - 1];
            var interval_last = rankreward_info_last.interval;
            if (rank >= interval_last && rank <= interval) {
                return getWeekAwardByMaxWave(rankreward_info, i, wave);
            }
        }
        else {
            if (rank <= interval) {
                return getWeekAwardByMaxWave(rankreward_info, i, wave);
            }
        }
    }
    return [];

    function getWeekAwardByMaxWave(rankreward_info, i, wave) {
        var limit = rankreward_info.limit;
        if (wave < limit) {
            if (i >= goddessWeekAward.length - 1) {
                return [];
            }
            else {
                rankreward_info = goddessWeekAward[i + 1];
                return getWeekAwardByMaxWave(rankreward_info, i + 1, wave);
            }
        }
        return rankreward_info.reward;
    }
}


module.exports = {
    getWeekAwardGoddess: getWeekAwardGoddess,

    //子任务类型定义
    SUBTASK_TYPE: {
        REWARD: Symbol('reward'),
        DEL: Symbol('del'),
        MODIFY: Symbol('modify')
    },

    RANK_TYPE: {
        MATCH: 3,   //排位赛排行榜
        GODDESS: 4,  //保卫女神排行榜
        PETFISH: 5, //宠物鱼
        CHARM: 6,  //魅力值排行榜
        BP: 7,    //捕鱼积分排行榜(渔王争霸)
        FLOWER: 8,  //鲜花排行榜
    },

    REWARD_TYPE: {
        DAILY: 1,
        WEEK: 2,
        MONTH: 3
    },

    RANK_DAILY_AWARD_CONFIG: rank_award_config,
    RANK_WEEK_AWARD_CONFIG: rank_weekaward_config,
    RANK_MONTH_AWARD_CONFIG: rank_monthaward_config,
};



