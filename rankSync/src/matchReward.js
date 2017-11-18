const RankReward = require('./rankReward');
const REDISKEY = require('../../database/consts').REDISKEY;
const dbUtils = require('../../database/').dbUtils;
class MatchReward extends RankReward{
    constructor(){
        super();
    }

    /**
     * 获取排位赛季奖励
     * @param rank 名次
     * @param score 分数
     * @private
     */
    _getMonthAward(rank, score) {
        return [rank, score];
    }

    async _getMatchInfo(uids){
        let cmds = [];
        cmds.push(['HMGET', REDISKEY.MATCH_SEASON_WIN, uids]);
        cmds.push(['HMGET', REDISKEY.MATCH_SEASON_BOX, uids]);
        cmds.push(['HMGET', REDISKEY.MATCH_SEASON_1ST_WIN, uids]);

        return await dbUtils.redisAccountSync.multiAsync(cmds);
    }


    _requirement(condition, win, box, win_1st){
        if(win >= condition.match_season_win && box >= condition.match_season_box && win_1st >= condition.match_season_1st_win){
            return true;
        }

        return false;
    }


    async _giveAward(task, platform, month){
        let rank = 0;
        let cmds = [];
        while (true){
            let ranks = await dbUtils.redisAccountSync.getRankLimit(`${task.redisKey}:${platform}`, rank, (rank + task.limit)-1);
            if(0 == ranks.length) {
                break;
            }

            let uids = [];
            for (let i = 0; i < ranks.length; i += 2) {
                uids.push(ranks[i]);
            }

            let matchInfos = await this._getMatchInfo(uids);

            let match_season_win = matchInfos[0];
            let match_season_box = matchInfos[1];
            let match_season_1st_win = matchInfos[2];

            for (let i = 0; i < ranks.length; i += 2) {
                let uid = ranks[i];
                let score = ranks[i+1];
                rank++;

                let award = this._getDailyAward(task.awardType, rank);
                if(award){
                    cmds.push(['HSET', `${REDISKEY.RANK_DAILY_AWARD}:${task.redisKey}`, uid, award]);
                }

                if(month){
                    if(this._requirement(task.condition, match_season_win[i], match_season_box[i], match_season_1st_win[i])){
                        let month_award = this._getMonthAward(rank, score);
                        if(month_award){
                            cmds.push(['HSET', `${REDISKEY.RANK_WEEK_AWARD}:${task.redisKey}`, uid, month_award]);
                        }

                    }
                }

                if(cmds.length >= task.limit){
                    await dbUtils.redisAccountSync.multiAsync(cmds);
                    cmds = [];
                }
            }
        }

        await dbUtils.redisAccountSync.multiAsync(cmds);
    }

    async handle(task, month){
        for(let platform of Object.values(REDISKEY.PLATFORM_TYPE)){
            await this._giveAward(task, platform, month);
        }
    }
}

module.exports = MatchReward;