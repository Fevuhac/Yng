const Task = require('../../base/task/task');
const REDISKEY = require('../../database/consts').REDISKEY;
const ACCOUNTKEY = require('../../database/consts').ACCOUNTKEY;
const dbUtils = require('../../database/').dbUtils;
const rank_rankgame_cfg = require('../../cfgs/rank_rankgame_cfg');
const async = require('async');
const utils = require('../../base/utils/utils');
const SUBTASK_TYPE = require('../src/consts').SUBTASK_TYPE;
/**
 * 用户数据重置
 */

class MonthTask extends Task {
    constructor(conf) {
        super(conf);
    }

    _reset(task, cb) {
        utils.invokeCallback(cb, null);
    }

    async _exeTask(cb) {
        logger.info('按月任务重置开始');
        // for(let i=0; i< 20000; i++){
        //     let val = i*100;
        //     let id = i+1000;
        //     redisConnector.cmd.zadd(`${REDISKEY.RANK.MATCH}:${REDISKEY.PLATFORM_TYPE.ANDROID}`, val, id);
        //     dbUtils.redisAccountSync.setAccount(id, {match_points:1000, match_rank:10, platform:1, nickname:`nickname`, figure_url:'http://www.baidu.com'});
        // }
        // return;
        let tasks = this.taskConf.subTask;
        async.mapSeries(tasks, this._reset.bind(this), function (err, results) {
            logger.info('按月任务重置完成')
            utils.invokeCallback(cb, null);
        });
    }
}

module.exports = MonthTask;