const Task = require('../../base/task/task');
const utils = require('../../base/utils/utils');
const REDISKEY = require('../../database/consts').REDISKEY;
const dbUtils = require('../../database').dbUtils;

/**
 * 用户数据重置
 */
class RankBuildTask extends Task {
    constructor(conf) {
        super(conf);
    }

    _getRank(task, platform, skip, limit) {
        /* yxl */console.log(`_getRank()------------------------------`);
        let promise = new Promise(function (resolve, reject) {
            /* yxl */console.log(`skip:${skip}, limit:${limit}`);
            redisConnector.cmd.zrevrange(`${task.redisKey}:${platform}`, skip, limit, 'WITHSCORES', function (err, results) {
                if (err) {
                    /* yxl */console.log('err:', err);
                    reject(err);
                    return;
                }
                /* yxl */console.log('resolve(results):', results);
                resolve(results);
            });
        });

        return promise;
    }

    _getPlayerExInfoByMysql(task, player){
        let promise = new Promise(function (resolve, reject) {
            dbUtils.mysqlAccountSync.getAccount(player.uid, task.ext, function (err, account) {
                if(err || !account){
                    resolve(player);
                    return;
                }
                /* yxl */console.log('_getPlayerExInfoByMysql - account:', account);
                // player.ext = account.toJSON();
                player.ext = account;
                resolve();
            });

        });
        return promise;
    }

    async _getPlayerExInfoByRedis(task, player){
        try {
            let account = await dbUtils.redisAccountSync.getAccountAsync(player.uid, task.ext);
            /* yxl */console.log('account:', account);
            if(account){
                player.ext = account.toJSON();
                return null;
            }
        }catch (err){
            /* yxl */console.log('err:', err);
            logger.error(`${this.taskId}执行_getPlayerExInfoByRedis玩家数据异常uid:`, player.uid);
        }
        return player;
    }

    /**
     * 获取玩家详细信息
     * @param task
     * @param players
     * @returns {Promise}
     * @private
     */
    async _getPlayerExInfo(task, players) {
        let fromMysqlPlayers = [];
        for(let i = 0; i< players.length; i++){
            let p = await this._getPlayerExInfoByRedis(task, players[i]);
            if(p){
                fromMysqlPlayers.push(p);
            }
        }

        if(0 == fromMysqlPlayers.length){return;}

        for(let i = 0; i< fromMysqlPlayers.length; i++){
            let p = await this._getPlayerExInfoByMysql(task, fromMysqlPlayers[i]);
            if(p){
                logger.error(`${this.taskId}执行_getUserExInfo玩家数据异常uid:`, p.uid);
            }
        }
    }


    async _getRankInfo(task, platform) {
        let rankInfo = {
            players: [],
            ranks: {}
        };

        try {
            let rank100 = await this._getRank(task, platform, 0, task.showDetail - 1);

            for (let i = 0; i < rank100.length; i += 2) {
                rankInfo.players.push({uid: rank100[i], score: task.originScore ? task.originScore(rank100[i + 1]): rank100[i + 1]});
                rankInfo.ranks[rank100[i]] = rankInfo.players.length;
            }

            await this._getPlayerExInfo(task, rankInfo.players);

            //获取排名100以后玩家名次
            let skip = task.showDetail;
            while (skip < task.range){
                let ranks = await this._getRank(task, platform, skip, (skip + task.limit)-1);
                if(0 == ranks.length) break;
                for (let i = 0; i < ranks.length && skip < task.range; i += 2) {
                    skip++;
                    rankInfo.ranks[ranks[i]] = skip;
                }
            }

        } catch (err) {
            logger.error(`${this.taskId}执行_getRankInfo异常`, err);
        }

        return rankInfo;
    }

    _saveRankInfo(task, platform, rankInfo){
        let promise = new Promise(function (resolve, reject) {
            console.log(JSON.stringify(rankInfo).length);
            redisConnector.cmd.set(`${REDISKEY.getRankDataKey(task.redisKey)}:${platform}`, JSON.stringify(rankInfo), function (err, result) {
                if(err){
                    logger.error(`${this.taskId}执行_saveRankInfo异常`, err);
                }
                console.log('------_saveRankInfo ok')
                resolve(result);
            })
        });
        return promise;
    }

    async _build(task) {
        /* yxl */ console.log('_build() --- ');
        for(let platform of Object.values(REDISKEY.PLATFORM_TYPE)){
            let result =await this._getRankInfo(task, platform);
            await this._saveRankInfo(task, platform, result);
        }
    }

    async _exeTask(cb) {
        logger.info('排行榜生成开始');
        let tasks = this.taskConf.subTask;
        for(let i = 0; i< tasks.length; i++){
            await this._build(tasks[i]);
        }
        logger.info('排行榜生成完成');
        utils.invokeCallback(cb, null);

    }
}

//前一百名
//zrevrange rank_dev 0 100 withscores

//前一万名
//zrevrange rank_dev 100 10000 withscores

//返回有序集合中指定成员的排名，有序集成员按分数值递减(从大到小)排序
//ZREVRANK key member
module.exports = RankBuildTask;