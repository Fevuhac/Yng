const moment = require('moment')
const taskPool = require('../base/task').taskPool;
const task_conf = require('./config');
const LogInsertTask = require('./logInsertTask');
const logTableDef = require('./logTableDef');
/**
 * TODO：日志构建
 */
class LogBuilder{
    constructor(){
        this.logInsertTask = new LogInsertTask(task_conf.logInsert);
        taskPool.addTask('logInsertTask', this.logInsertTask);
    }

    _genNow(){
        return moment().format('YYYY-MM-DD HH:MM:SS');
    }

    addGoldLog(uid, gain, cost, total, scene, level){
        let log = {
            'account_id': uid,
            'log_at': this._genNow(),
            'gain': gain,
            'cost': cost,
            'total': total,
            'duration': 0,
            'scene': scene,
            'nickname': 0,
            'level': level
        };
        this.logInsertTask.pushData(logTableDef.TYPE.GOLD, log);
    }
}

module.exports = new LogBuilder();