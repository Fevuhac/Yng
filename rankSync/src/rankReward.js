const REDISKEY = require('../../database/consts').REDISKEY;
const dbUtils = require('../../database/').dbUtils;
const consts = require('./consts');

class RankReward{
    constructor(){
    }

    /**
     * 获取周奖励
     * @param type
     * @param rank
     * @private
     */
    _getWeekAward(type, cond){
        switch(type) {
            case consts.RANK_TYPE.GODDESS:
                consts.getWeekAwardGoddess(cond.rank, cond.wave);
            break;
        }
    }

    /**
     * 获取每日奖励
     * @param type 排行类型
     * @param rank 排行名次
     * @private
     */
    _getDailyAward(type, rank){
        let list = consts.RANK_DAILY_AWARD_CONFIG[type];
        for (let i = 0; i < list.length; ++i) {
            if (rank >= list[i].interval[0] && rank <= list[i].interval[1]) {
                return JSON.stringify(list[i].reward);
            }
        }

        return null;
    }

    /**
     * 处理奖励发放
     * @param task
     * @param week
     * @returns {Promise}
     */
    async handle(task, week){
        for(let platform of Object.values(REDISKEY.PLATFORM_TYPE)){
            try{
                let rankData = await dbUtils.redisAccountSync.oneCmdAsync(['get', `${REDISKEY.getRankDataKey(task.redisKey)}:${platform}`]);
                if(!rankData){
                    continue;
                }
                let rankInfo = JSON.parse(rankData);
                this.generateChart(rankInfo, week);

            }catch (err){
                logger.error(`发放奖励${task.redisKey}执行异常`, err);
            }
        }
    }

    generateChart(rankInfo, week) {

        let cmds = [];
        for (let i = 0; i < rankInfo.ranks.length; i++) {
            let award = this._getDailyAward(task.awardType, rankInfo.ranks[i].rank);
            cmds.push(['hset', `${REDISKEY.RANK_DAILY_AWARD}:${task.redisKey}`, rankInfo.ranks[i].uid, award]);
            if (week) {
                award = this._getWeekAward(task.awardType, rankInfo.ranks[i].rank);
                cmds.push(['hset', `${REDISKEY.RANK_WEEK_AWARD}:${task.redisKey}`, rankInfo.ranks[i].uid, award]);
            }

            if (cmds.length >= task.limit) {
                await dbUtils.redisAccountSync.multiAsync(cmds);
                cmds = [];
            }
        }
        await dbUtils.redisAccountSync.multiAsync(cmds);
    }
}

module.exports = RankReward;