const Task = require('../base/task/task');
const mysqlLogInsert = require('./mysqlLogInsert');
const redisLogInsert = require('./redisLogInsert');
const LogSource = require('./logSource');
const consts = require('../database/consts/consts');
const errorCode = require('../database/consts/errorCode');
const utils = require('../base/utils/utils');

/**
 * 定时写入日志到mysql
 */
class LogInsertTask extends Task{
    constructor(conf){
        super(conf);
        this.logSource = new LogSource();
        this.dbInsert = mysqlLogInsert;
    }

    /**
     * 设置log存储数据库类型
     * @param value
     */
    setDBtype(value){
        if(consts.DBType.checkValid(value)){
            switch (value){
                case consts.DBType.MYSQL:
                    this.dbInsert = mysqlLogInsert;
                    break;
                case consts.DBType.REDIS:
                    this.dbInsert = redisLogInsert;
                    break;
                case consts.DBType.MONGO:
                default:
                    return errorCode.NOT_SUPPORT;
            }
        }
        return errorCode.OK;
    }

    pushData(type, data){
        return this.logSource.add(type, data);
    }

    /**
     * 执行定时任务
     * @private
     */
    _exeTask(cb){
        let data = this.logSource.data;
        logger.error('--- data', data);
        this.dbInsert.flush(data, function (err, result) {
            if(err){
                console.log('定时写入LOG失败', err);
            }
            else {
                console.log('定时写入日志成功');
            }
            logger.error('--------------------------------- data', data);
            utils.invokeCallback(cb, err, result);
        });
    }
}

module.exports = LogInsertTask;




