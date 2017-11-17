const Task = require('../../base/task/task');
const REDISKEY = require('../../database/consts').REDISKEY;
const dbUtils = require('../../database/').dbUtils;
const async = require('async');
const utils = require('../../base/utils/utils');
const SUBTASK_TYPE = require('../src/consts').SUBTASK_TYPE;
/**
 * 用户数据重置
 */
class DailyTask extends Task {
    constructor(conf) {
        super(conf);
    }

    _resetMysqlKey(){

    }

    _delKey(task, cb){
        redisConnector.cmd.del(task.redisKey, function (err, res) {
            if (err) {
                logger.error(`执行删除${task.redisKey}异常`, err);
            }
            utils.invokeCallback(cb, null);
        });
    }

    _setDefault(task, cb){
        dbUtils.redisAccountSync.getHashValueLimit(REDISKEY.PLATFORM, 0, task.limit, (res, next) => {
            let uids = dbUtils.redisAccountSync.Util.parseHashKey(res);
            let cmds = [];
            let cmds1 = [];//条件性重置goddess_free
            uids.forEach(function (uid) {
                if (REDISKEY.TOKEN == task.redisKey) {
                    cmds.push(['hset', task.redisKey, uid, task.value]);
                }
                else if (REDISKEY.GODDESS_FREE == task.redisKey) {
                    cmds1.push(['hget', REDISKEY.GODDESS_ONGOING, uid]);
                }
                else if (REDISKEY.GODDESS_CROSSOVER == task.redisKey) {
                    cmds.push(['hincrby', REDISKEY.GODDESS_CROSSOVER, uid, task.value]);
                }
            });

            async.waterfall([function (cb) {
                if (REDISKEY.TOKEN == task.redisKey) {
                    redisConnector.cmd.multi(cmds).exec(cb);
                }
                else if (REDISKEY.GODDESS_FREE == task.redisKey) {
                    redisConnector.cmd.multi(cmds1).exec(function (err, res) {
                        if (err) {
                            console.log(`执行${task.redisKey}1:`, err);
                            cb();
                        } else {
                            let sub_cmds = [];
                            for (let i in res) {
                                if (0 == Number(res[i])) {
                                    sub_cmds.push(['hset', REDISKEY.GODDESS_FREE, uids[i], task.value]);
                                }
                            }
                            redisConnector.cmd.multi(sub_cmds).exec(cb);
                        }
                    })
                }
                else if (REDISKEY.GODDESS_CROSSOVER == task.redisKey) {
                    redisConnector.cmd.multi(cmds).exec(cb)
                }
            }], function (err, result) {
                next();
            });

        }, function (err) {
            console.log(`执行${task.redisKey}重置完成`);
            utils.invokeCallback(cb, null);
        });
    }

    _reset(task, cb){
        if (SUBTASK_TYPE.DEL == task.type) {
            this._delKey(task, cb);
        } else if (SUBTASK_TYPE.MODIFY == task.type) {
            this._setDefault(task, cb);
        }
        else {
            utils.invokeCallback(cb, null);
        }
    }

    _exeTask(cb) {
        logger.info('按天任务重置开始')
        let tasks = this.taskConf.subTask;
        async.mapSeries(tasks, this._reset.bind(this), function (err, results) {
            logger.info('按天任务重置完成')
            utils.invokeCallback(cb, null);
        });
    }
}

module.exports = DailyTask;