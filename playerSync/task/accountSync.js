const async = require('async');
const dbUtils = require('../../database/').dbUtils;
const Task = require('../../base/task/task');
const REDISKEY = require('../../database/consts').REDISKEY;
const utils = require('../../base/utils/utils');

const testUIds = require('../test_ids_1');


function checkTestUids(uid) {
    if(testUIds[uid]){
        return true;
    }

    return false;
}


// function deletePlatform() {
//
//     let cmds = [];
//     for(let uid in testUIds){
//         cmds.push(['hdel', redisKey.getKey(redisKey.PLATFORM), uid])
//     }
//     redisConnector.cmd.multi(cmds).exec(function (err, result) {
//         if(err){
//             console.log('删除玩家异常:', err);
//         }else {
//             console.log('删除玩家成功:', result);
//         }
//     })
// }

/**
 * redis数据定时同步到mysql
 */
class AccountSync extends Task {
    constructor(conf) {
        super(conf);
    }

    _sync(syncCount, uids, finish) {
        let subUids = uids.slice(syncCount, syncCount + this.taskConf.writeLimit);
        if (subUids.length === 0) {
            logger.info('redis数据同步到mysql成功');
            utils.invokeCallback(finish, null);
            return;
        }

        let self = this;
        let synced = syncCount + this.taskConf.writeLimit;
        async.mapSeries(subUids, function (uid, cb) {
            dbUtils.redisAccountSync.getAccount(uid, function (err, account) {
                //TODO:linyng test
                // account.gold = 10;
                // account.commit();
                //TODO:linyng test end
                cb(err, account)
            });
        }, function (err, accounts) {
            if (err) {
                logger.error('获取account信息失败');
            }

            let account_filter = dbUtils.redisAccountSync.Util.filterInvalidAccount(accounts);
            if (account_filter.length > 0) {
                dbUtils.mysqlAccountSync.setAccount(account_filter, function (err, results) {
                    if (err) {
                        logger.error('redis数据同步到mysql存在异常，请注意检查数据', err);
                    }

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
        // dbUtils.redisAccountSync.getAccount(918, function (err, account) {
        //     account.gold = 1000;
        //     account.commit();
        // });
        logger.info('---玩家数据同步开始');
        console.time('accountSync');
        let self = this;
        dbUtils.redisAccountSync.getSetValueLimit(REDISKEY.UPDATED_UIDS, 0, this.taskConf.readLimit, (res, next) => {
            if (!!res && res.length > 0) {
                // deletePlatform();
                // return;
                let uids = dbUtils.redisAccountSync.Util.parseHashKey(res);
                dbUtils.redisAccountSync.remSetValues(REDISKEY.UPDATED_UIDS, uids, function (err, results) {
                    //TODO:by linyng
                    uids = uids.filter(function(uid){
                        return checkTestUids(uid)
                    });

                    logger.error('--------------uids', uids);

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




