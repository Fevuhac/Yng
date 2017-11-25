const RankReward = require('./rankReward');
const REDISKEY = require('../../database/consts').REDISKEY;
const dbUtils = require('../../database/').dbUtils;
class GoddessReward extends RankReward{
    constructor(){
        super();
    }

    async handle(task, week){
        super.handle(task, week);
    }

    _getUids(rankInfo) {
        let uids = [];
        for (let i = 0; i < rankInfo.ranks.length; i++) {
            uids.push(rankInfo.ranks[i].uid);
        }
        return uids;
    }

    generateChart(rankInfo) {
        let uids = this._getUids(rankInfo);

        let maxWaves = await dbUtils.redisAccountSync.oneCmdAsync(['hmget', `${REDISKEY.MAX_WAVE}`]);

        let cmds = [];
        for (let i = 0; i < rankInfo.ranks.length; i++) {
            let award = this._getDailyAward(task.awardType, rankInfo.ranks[i].rank);
            cmds.push(['hset', `${REDISKEY.RANK_DAILY_AWARD}:${task.redisKey}`, rankInfo.ranks[i].uid, award]);
            if (week) {
                award = this._getWeekAward(task.awardType, {rank:rankInfo.ranks[i].rank, wave:maxWaves[i]});
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

module.exports = GoddessReward;