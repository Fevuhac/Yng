const rank_rankgame_cfg = require('../../cfgs/rank_ranklist_cfg');


let rank_award_config = {};
rank_rankgame_cfg.forEach(function (item) {
    if (!rank_award_config[item.type]) {
        rank_award_config[item.type] = [];
    }
    rank_award_config[item.type].push({
        interval: item.interval,    //--排名区间
        reward: item.reward,    //--奖励
    })

});


function getAward(type, rank) {
    let list = rank_rankgame_cfg[type];
    for (let i = 0; i < list.length; ++i) {
        if (rank >= list[i].interval[0] && rank <= list[i].interval[1]) {
            return list.reward;
        }
    }

    return null;
}


module.exports = {
    //子任务类型定义
    SUBTASK_TYPE: {
        REWARD: Symbol('reward'),
        DEL: Symbol('del'),
        MODIFY: Symbol('modify')
    },

    REWARD_TYPE: {
        DAILY: Symbol('daily'),
        WEEK: Symbol('week'),
        MONTH: Symbol('month'),
    },

    RANK_DAILY_AWARD_CONFIG: rank_award_config,
    RANK_WEEK_AWARD_CONFIG: rank_award_config,
};



