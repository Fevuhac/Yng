const Task = require('../../base/task/task');
const async = require('async');
const utils = require('../../base/utils/utils');
const SUBTASK_TYPE = require('../src/consts').SUBTASK_TYPE;
const REDISKEY = require('../../database/consts').REDISKEY;
const RankReward =require('../src/rankReward');
const RankReset =require('../src/rankReset');
const MatchReward = require('../src/matchReward');
const MatchReset = require('../src/matchReset');

/**
 * 用户数据重置
 */
class RankRewardTask extends Task {
    constructor(conf) {
        super(conf);
        this._rankReward = new RankReward();
        this._rankReset = new RankReset();

        this._matchReward = new MatchReward();
        this._matchReset = new MatchReset();
    }


    async _handleMatch(task) {


        let n = new Date();
        let d = n.getDay();
        let month = task.reset && task.reset();
        await this._matchReward.handle(task, month);
        if(true || month){
            await this._matchReset.handle(task);
        }
    }

    async _handleRank(task){
        let week = task.reset && task.reset();
        await this._rankReward.handle(task, week);
        if(week){
            await this._rankReset.handle(task);
        }
    }


    //处理任务
    async _handleTask(task) {
        try {
            switch (task.redisKey) {
                case REDISKEY.RANK.MATCH: {
                    await this._handleMatch(task);
                    logger.info('排位赛奖励执行完成');
                }
                    break;
                case REDISKEY.RANK.CHARM:
                case REDISKEY.RANK.AQUARIUM:
                case REDISKEY.RANK.FLOWER:
                case REDISKEY.RANK.GODDESS:
                case REDISKEY.RANK.BP:
                    logger.info(`排行奖励${task.redisKey}开始执行`);
                    await this._handleRank(task);
                    logger.info(`排行奖励${task.redisKey}执行完成`);

                default:
                    break;
            }
        }catch (err){
            logger.error(`排行奖励任务${this.taskId}执行异常`, err);
        }
    }

    async _exeTask(cb) {
        logger.info('排行奖励开始执行');
        let tasks = this.taskConf.subTask;
        for (let i = 0; i < tasks.length; i++) {
            await this._handleTask(tasks[i]);
        }
        logger.info('排行奖励执行完成');
        utils.invokeCallback(cb, null);

    }
}

module.exports = RankRewardTask;