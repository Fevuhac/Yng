const RankReward = require('./rankReward');
const REDISKEY = require('../../database/consts').REDISKEY;
const dbUtils = require('../../database/').dbUtils;
class GoddessReward extends RankReward{
    constructor(){
        super();
    }

    async handle(task, week){
        /* yxl */ console.log('handle');
        super.handle(task, week);
    }

    _getUids(rankInfo) {
        let uids = [];
        for (let uid in rankInfo.ranks) {
            uids.push(uid);
        }
        return uids;
    }

    async generateChart(rankInfo, week) {
        /* yxl */ console.log('2222222222222222222222222222rankInfo:', rankInfo);
        /* yxl */ console.log('GoddessReward.generateChart');
        let uids = this._getUids(rankInfo);
        if (uids.length == 0) {
            return;
        }

        let maxWaves = await dbUtils.redisAccountSync.oneCmdAsync(['hmget', `${REDISKEY.MAX_WAVE}`, uids]);

        /* yxl */ console.log('maxWaves', maxWaves);

        let cmds = [];
        for (let uid in rankInfo.ranks) {
            let award = this._getDailyAward(task.awardType, rankInfo.ranks[uid]);
            cmds.push(['hset', `${REDISKEY.RANK_DAILY_AWARD}:${task.redisKey}`, uid, award]);
            if (week) {
                award = this._getWeekAward(task.awardType, {rank:rankInfo.ranks[uid], wave:maxWaves[i]});
                cmds.push(['hset', `${REDISKEY.RANK_WEEK_AWARD}:${task.redisKey}`, uid, award]);
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