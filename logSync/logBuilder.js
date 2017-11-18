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

        setInterval(function () {
            this.addGoldLog(1,10,20,100,1,10);
        }.bind(this),1000);

    }

    _genNow(){
        return moment(new Date()).format('YYYY-MM-DD HH:mm:SS');
    }

    addGoldLog(uid, gain, cost, total, scene, level){

        logger.error(uid, gain, cost, total, scene, level);

        let log = {
            account_id: uid,
            log_at: this._genNow(),
            gain: gain,
            cost: cost,
            total: total,
            duration: 0,
            scene: scene,
            nickname: 0,
            level: level
        };

        this.logInsertTask.pushData(logTableDef.TYPE.GOLD, log);
    }
}

module.exports = new LogBuilder();