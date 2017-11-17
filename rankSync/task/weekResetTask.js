const Task = require('../../base/task/task');
const async = require('async');
const utils = require('../../base/utils/utils');
const SUBTASK_TYPE = require('../src/consts').SUBTASK_TYPE;

/**
 * 用户数据重置
 */
class WeekResetTask extends Task {
    constructor(conf) {
        super(conf);
    }

    _reset(task, cb) {
        if (SUBTASK_TYPE.DEL == task.type) {
            let platforms = task.platforms;
            if (platforms) {
                for (let platform of Object.values(platforms)) {
                    redisConnector.cmd.del(`${task.redisKey}:${platform}`, function (err, res) {
                        if (err) {
                            logger.error(`执行${task.redisKey}异常`, err);
                        }
                        utils.invokeCallback(cb, null);
                    });
                }
            }
            else {
                redisConnector.cmd.del(`${task.redisKey}`, function (err, res) {
                    if (err) {
                        logger.error(`执行${task.redisKey}异常`, err);
                    }
                    utils.invokeCallback(cb, null);
                });
            }

        }
        else {
            utils.invokeCallback(cb, null);
        }
    }

    _exeTask(cb) {
        logger.info('按周任务重置开始')
        let tasks = this.taskConf.subTask;
        async.mapSeries(tasks, this._reset.bind(this), function (err, results) {
            logger.info('按周任务重置完成')
            utils.invokeCallback(cb, null);
        });
    }
}

module.exports = WeekResetTask;