const REDISKEY = require('../../database/consts').REDISKEY;
const ACCOUNTKEY = require('../../database/consts').ACCOUNTKEY;
const dbUtils = require('../../database/').dbUtils;
const rank_rankgame_cfg = require('../../cfgs/rank_rankgame_cfg');

class MatchReset{

    constructor(){

    }

    _getRankIdByPoints(points) {
        for (let i = rank_rankgame_cfg.length - 1; i > 0; i--) {
            let rank_info = rank_rankgame_cfg[i];
            if (points >= rank_info.integral) {
                return rank_info.id;
            }
        }
    }

    _matchResetMysql(task, recordUid) {
        let promise = new Promise(function (resolve, reject) {
            resolve();
        });

        return promise;
    }

    //排位赛胜点、段位重置
    _matchResetRedis(task) {
        let recordUid = [];
        let self = this;

        let promise = new Promise(function (resolve, reject) {
            dbUtils.redisAccountSync.getHashValueLimit(REDISKEY.PLATFORM, 0, task.limit, async (res, next) => {
                let uids = dbUtils.redisAccountSync.Util.parseHashKey(res);
                if(0 == uids.length){
                    next();
                    return;
                }

                let platforms = dbUtils.redisAccountSync.Util.parseHashValue(ACCOUNTKEY.PLATFORM, res);
                let match_points = await dbUtils.redisAccountSync.multiAsync([['HMGET', REDISKEY.MATCH_POINTS, uids]]);
                match_points = dbUtils.redisAccountSync.Util.convertValue(ACCOUNTKEY.MATCH_POINTS, match_points[0]);

                let resetCmds = [];
                let match_points_new = {};
                let match_ranks_new = {};
                let match_season_count = {};
                let match_season_win = {};
                let match_season_box = {};
                let match_season_first_win = {};
                let match_zadd_android = {};// ANDROID平台
                let match_zadd_ios = {};// iOS平台

                for (let i = 0; i < uids.length; i++) {
                    let _points = match_points[i] || task.default_points;
                    let _rank = task.default_rank;
                    let uid = uids[i];

                    if (_points > task.default_points) {
                        _points = task.condition(_points);
                        _rank = self._getRankIdByPoints(_points);
                    }

                    match_points_new[uid]=_points;
                    match_ranks_new[uid] = _rank;
                    match_season_count[uid] = 0;
                    match_season_win[uid] = 0;
                    match_season_box[uid] = 0;
                    match_season_first_win[uid] = 0;

                    switch (Number(platforms[i])) {
                        case REDISKEY.PLATFORM_TYPE.ANDROID:
                            match_zadd_android[uid] = _points;
                            break;
                        case REDISKEY.PLATFORM_TYPE.IOS:
                            match_zadd_ios[uid] = _points;
                            break;
                        default:
                            break;
                    }
                }

                resetCmds.push(['hmset', REDISKEY.MATCH_POINTS, match_points_new]);
                resetCmds.push(['hmset', REDISKEY.MATCH_RANK, match_ranks_new]);
                resetCmds.push(['hmset', REDISKEY.MATCH_SEASON_COUNT, match_season_count]);
                resetCmds.push(['hmset', REDISKEY.MATCH_SEASON_WIN, match_season_win]);
                resetCmds.push(['hmset', REDISKEY.MATCH_SEASON_BOX, match_season_box]);
                resetCmds.push(['hmset', REDISKEY.MATCH_SEASON_1ST_WIN, match_season_first_win]);

                if (match_zadd_android.length > 0) {
                    resetCmds.push(['zadd', `${REDISKEY.RANK.MATCH}:${REDISKEY.PLATFORM_TYPE.ANDROID}`, match_zadd_android]);
                }
                if (match_zadd_ios.length > 0) {
                    resetCmds.push(['zadd', `${REDISKEY.RANK.MATCH}:${REDISKEY.PLATFORM_TYPE.IOS}`, match_zadd_ios]);
                }

                await dbUtils.redisAccountSync.multiAsync(resetCmds);

                recordUid = recordUid.concat(uids);

                next();

            }, function (err) {
                console.log(`执行${task.redisKey}重置完成`);
                resolve(recordUid);
            });
        });

        return promise;

    }

    async reset(task) {
        let recordUid = await this._matchResetRedis(task);
        this._matchResetMysql(task, recordUid);
    }
}

module.exports = new MatchReset();