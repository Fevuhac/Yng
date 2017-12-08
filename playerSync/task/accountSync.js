const async = require('async');
const dbUtils = require('../../database/').dbUtils;
const Task = require('../../base/task/task');
const REDISKEY = require('../../database/consts').REDISKEY;
const utils = require('../../base/utils/utils');
const deleteAllKey = require('../../tools/deleteAllKey').deleteAllKey;

/**
 * redis数据定时同步到mysql
 */
class AccountSync extends Task {
    constructor(conf) {
        super(conf);
    }

    async _sync(syncCount, uids, finish) {
        let subUids = uids.slice(syncCount, syncCount + this.taskConf.writeLimit);
        if (subUids.length === 0) {
            logger.info('redis数据同步到mysql成功');
            utils.invokeCallback(finish, null);
            return;
        }

        let self = this;
        let synced = syncCount + this.taskConf.writeLimit;
         console.time('----------------redis');
         console.log('-------------subUids', subUids.length);
        async.mapSeries(subUids, function (uid, cb) {
            dbUtils.redisAccountSync.getAccount(uid, function (err, account) {
                cb(err, account)
            });
        }, function (err, accounts) {
            if (err) {
                logger.error('获取account信息失败');
            }
            console.timeEnd('----------------redis');

            console.time('----------------mysql');
            let account_filter = dbUtils.redisAccountSync.Util.filterInvalidAccount(accounts);
            if (account_filter.length > 0) {
                console.log('-------------account_filter', account_filter.length);
                dbUtils.mysqlAccountSync.setAccount(account_filter, function (err, results) {
                    if (err) {
                        logger.error('redis数据同步到mysql存在异常，请注意检查数据', err);
                    }
                    console.timeEnd('----------------mysql');
                    self._sync(synced, uids, finish);
                });
            }
            else {
                self._sync(synced, uids, finish);
            }

        });
    }

    /**
     * 执行定时任务
     * @private
     */
    _exeTask(cb) {

        deleteAllKey();
        
        logger.info('---玩家数据同步开始');
        console.time('accountSync');
        let self = this;
        dbUtils.redisAccountSync.getSetValueLimit(REDISKEY.UPDATED_UIDS, 0, this.taskConf.readLimit, (res, next) => {
            if (!!res && res.length > 0) {
                let uids = dbUtils.redisAccountSync.Util.parseHashKey(res);
                dbUtils.redisAccountSync.remSetValues(REDISKEY.UPDATED_UIDS, uids, function (err, results) {
                    logger.error('--------------uids', uids.length);

                    self._sync(0, uids, function () {
                        logger.info('next -------');
                        next();
                    });
                });
            }else {
                next();
            }
        }, function(err){
            console.timeEnd('accountSync');
            utils.invokeCallback(cb, err);
            logger.info('----玩家数据同步完成');
        });
    }

}

module.exports = AccountSync;




