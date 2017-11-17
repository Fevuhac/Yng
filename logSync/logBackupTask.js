const async = require('async');
const util = require('util');
const utils = require('../base/utils/utils');
const Task = require('../base/task/task');

/**
 * mysql日志表备份，并导出
 */
class LogBackupTask extends Task{
    constructor(conf){
        super(conf);
    }

    /**
     * 检查是否需要备份数据
     * @param task
     * @private
     */
    _isNeedBak(task, cb){
        mysqlConnector.query(`SELECT COUNT(*) FROM ${task.table}`, null, function (err, result) {
            if(err){
                utils.invokeCallback(cb, err);
                return;
            }

            task.count = result[0]['COUNT(*)'];
            let needBak = task.count >= task.retain + task.bak;
            console.log('----------------_isNeedBak:', task.count, needBak, result);
            if(needBak){
                mysqlConnector.query(`SELECT id FROM ${task.table} LIMIT ${task.retain},1`, function (err, result) {
                    if(err){
                        utils.invokeCallback(cb, err);
                        return;
                    }

                    console.log('--------task.begin_id:', result[0].id);
                    task.begin_id = result[0].id;

                    mysqlConnector.query(`SELECT id FROM ${task.table} LIMIT ${task.count - 1},1`, function (err, result) {
                        if(err){
                            utils.invokeCallback(cb, err);
                            return;
                        }
                        console.log('--------task.end_id:', result[0].id);
                        task.end_id = result[0].id;
                        utils.invokeCallback(cb, null, needBak);
                    })
                })

            }
        });
    }

    /**
     * 计算备份表索引
     * @param task
     * @param cb
     * @private
     */
    _getBakIndex(task, cb){
        redisConnector.cmd.incr(`logbak:${task.table}`, function (err, result) {
            if(err){
                utils.invokeCallback(cb, err);
                return;
            }
            utils.invokeCallback(cb, null, result % task.max_bak_file);
        })

    }

    /**
     * 创建备份表
     * @param task
     * @param index
     * @param cb
     * @private
     */
    _createBakTable(task, index, cb){
        let tname = `${task.table}_${index}`;
        let sql = util.format(task.structure, tname);
        mysqlConnector.query(sql, function (err, result) {
            console.log('create table'+tname+'err:'+err+'result:'+result);
            utils.invokeCallback(cb, err, tname);
        });

    }


    /**
     * 导出备份数据
     * @param tname
     * @param cb
     * @private
     */
    _exportBakData(tname, cb){
        let path = `./data/${tname}_${Date.now()}.txt`;
        let sql = `SELECT * FROM ${tname} INTO OUTFILE \'${path}\' lines terminated by '\\r\\n'`;
        console.log('-----_exportBakData:', path, '       ', sql);
        mysqlConnector.query(sql, function (err, result) {
            if(err){
                // console.gameLogSync('-----_exportBakData:', err);
            }
            mysqlConnector.query(`TRUNCATE ${tname}`, function (err, result) {
                console.log('-----_exportBakData truncate result:', result);
                utils.invokeCallback(cb, null, tname)
            })
        });
    }


    /**
     * 拷贝数据到备份表
     * @param task
     * @param tname
     * @param skip
     * @param limit
     * @param cb
     * @private
     */
    _moveData(task, tname, skip, limit, cb){
        let sql = `INSERT INTO ${tname} SELECT * FROM ${task.table} WHERE id >= ${task.begin_id} AND id <= ${task.end_id} LIMIT ${skip}, ${limit}`;
        mysqlConnector.query(sql, function (err, result) {
            if(err){
                console.log('-------------------_moveData', err)
                utils.invokeCallback(cb, err);
            }

            console.log('-------------------_moveData', result.affectedRows)
            let affectedRows = !!result && result.affectedRows ? result.affectedRows:0;
            utils.invokeCallback(cb, err, skip, affectedRows, cb)
        })
    }

    /**
     * 移动数据到备份表 // INSERT INTO bak_tbl_gold_log_0005 SELECT * FROM tbl_gold_log WHERE id>34000000 AND id<=42000000;
     * @param task
     * @param tname
     * @param cb
     * @private
     */
    _backupData(task, tname, cb){
        this._moveData(task, tname, 0, task.bak, function (err, skip, affectedRows, callback) {
            if(affectedRows < task.bak){
                mysqlConnector.query(`DELETE FROM ${task.table} WHERE id >= ${task.begin_id} AND id <= ${task.end_id}`, function (err, result) {
                    utils.invokeCallback(cb, null);
                });
                return;
            }
            this._moveData(task, tname, skip + affectedRows, task.bak, callback);
        }.bind(this));
    }

    /**
     * 执行定时任务
     * @private
     */
    _exeTask(){
        let tasks = this.taskConf.subTask;
        let self = this;
        console.log('执行任务列表:', tasks);
        tasks.forEach(function (task) {
            async.waterfall([function (cb) {
                self._isNeedBak(task, cb);
            },function (need, cb) {
                if(!need){
                    cb(`暂时不需要备份该数据表${task.table}`);
                    return;
                }
                self._getBakIndex(task, cb);
            },function (index, cb) {
                self._createBakTable(task, index, cb)
            },function(tname,cb)
            {
                self._exportBakData(tname, cb)
            },function (tname, cb) {
                self._backupData(task, tname, cb);
            }], function (err) {
                if(err){
                    console.log(err);
                }
                else {
                    console.log(`执行${task.table}日志备份完成`);
                }
            });
        });
    }
}

module.exports =  LogBackupTask;
