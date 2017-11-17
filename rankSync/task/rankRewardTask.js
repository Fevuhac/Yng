const Task = require('../../base/task/task');
const async = require('async');
const utils = require('../../base/utils/utils');
const SUBTASK_TYPE = require('../src/consts').SUBTASK_TYPE;
const REDISKEY = require('../../database/consts').REDISKEY;

/**
 * 用户数据重置
 */
class RankRewardTask extends Task {
    constructor(conf) {
        super(conf);
    }


    _handleMatch(task) {

    }

    _handleCharm(task) {

    }

    _handleAquarium(task) {

    }

    _handleFlower(task) {

    }

    _handleGoddess(task) {

    }

    _handleBP(task) {

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
                case REDISKEY.RANK.CHARM: {
                    await this._handleCharm(task);
                    logger.info('魅力值排行奖励执行完成');
                }
                    break;
                case REDISKEY.RANK.AQUARIUM: {
                    await this._handleAquarium(task);
                    logger.info('宠物鱼总等级排行奖励执行完成');
                }
                    break;
                case REDISKEY.RANK.FLOWER: {
                    await this._handleFlower(task);
                    logger.info('人气王排行排行奖励执行完成');
                }
                    break;
                case REDISKEY.RANK.GODDESS: {
                    await this._handleGoddess(task);
                    logger.info('女神波数排行奖励执行完成');
                }
                    break;
                case REDISKEY.RANK.BP: {
                    await this._handleBP(task);
                    logger.info('捕鱼积分排行奖励执行完成');
                }
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
        logger.info('排行榜生成完成');
        utils.invokeCallback(cb, null);

    }
}

module.exports = RankRewardTask;