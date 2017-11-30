const moment = require('moment')
const taskPool = require('../base/task').taskPool;
const task_conf = require('./config');
const LogInsertTask = require('./logInsertTask');
const logTableDef = require('./logTableDef');
/**
 * TODO：日志构建
 */
class LogBuilder {
    constructor() {
        this.logInsertTask = new LogInsertTask(task_conf.logInsert);
        taskPool.addTask('logInsertTask', this.logInsertTask);

        // setInterval(function () {
        //     this.addGoldLog(1,10,20,100,1,10);
        // }.bind(this),1000);

    }

    _genNow() {
        return moment(new Date()).format('YYYY-MM-DD HH:mm:ss'); //坑爹：注意此处格式化，否则数据库可能写入失败
    }

    /**
     * 记录金币日志
     * @param {*} uid 
     * @param {*} gain 
     * @param {*} cost 
     * @param {*} total 
     * @param {*} scene 
     * @param {*} level 
     */
    addGoldLog(uid, gain, cost, total, scene, level) {
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

    /**
     * 记录钻石日志
     * @param {*} uid 
     * @param {*} gain 
     * @param {*} cost 
     * @param {*} total 
     * @param {*} scene 
     * @param {*} level 
     */
    addPearlLog(uid, gain, cost, total, scene, level) {
        let log = {
            account_id: uid,
            log_at: this._genNow(),
            gain: gain,
            cost: cost,
            total: total,
            scene: scene,
            nickname: 0
        };

        this.logInsertTask.pushData(logTableDef.TYPE.PEARL, log);
    }

    addSkillLog(uid, skill_id, gain, cost, total){
        let log = {
            account_id: uid,
            skill_id:skill_id,
            log_at: this._genNow(),
            gain: gain,
            cost: cost,
            total: total,
            nickname: 0
        };

        this.logInsertTask.pushData(logTableDef.TYPE.SKILL, log);   
    }


}

module.exports = new LogBuilder();