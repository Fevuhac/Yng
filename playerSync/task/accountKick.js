const Task = require('../../base/task/task');
const async = require('async');
const dbUtils = require('../../database/').dbUtils;
const REDISKEY = require('../../database/consts').REDISKEY;
const utils = require('../../base/utils/utils');

/**
 * 踢出redis缓存中不活跃玩家数据
 */
class AccountKick extends Task {
    constructor(conf) {
        super(conf);
    }

    /**
     * 踢出非活跃玩家
     * @param kicked 已经提出的非活跃玩家
     * @param uids
     * @private
     */
    _kickAccount(kicked, kickUids, finish) {
        let subUids = kickUids.slice(kicked, kicked + this.taskConf.writeLimit);
        if (subUids.length === 0) {
            console.log('redis数据同步到mysql成功');
            utils.invokeCallback(finish, null);
            return;
        }

        let self = this;
        let next_kick = kicked + this.taskConf.writeLimit;
        async.mapSeries(subUids, function (uid, cb) {
            dbUtils.redisAccountSync.getAccount(uid, function (err, account) {
                cb(null, account)
            });
        }, function (err, accounts) {
            if (err) {
                console.log('获取account信息失败');
            }

            let account_filter = dbUtils.redisAccountSync.Util.filterInvalidAccount(accounts);
            if (account_filter.length > 0) {
                dbUtils.mysqlAccountSync.setAccount(account_filter, function (err, results) {
                    if (err) {
                        console.log('踢出非活跃玩家,同步玩家信息到mysql异常', err);
                        self._kickAccount(next_kick, kickUids, finish);
                    }
                    else {
                        dbUtils.redisAccountSync.delAccount(subUids, function (err, result) {
                            if (err) {
                                console.log('踢出非活跃玩家,清除redis缓存数据异常', err);
                                return;
                            }
                            self._kickAccount(next_kick, kickUids, finish);
                        });
                    }
                });
            } else {
                self._kickAccount(next_kick, kickUids, finish);
            }

        });
    }

    /**
     * 执行定时任务
     * @private
     */
    _exeTask(cb) {
        dbUtils.redisAccountSync.getHashValueLimit(REDISKEY.LAST_ONLINE_TIME, 0, this.taskConf.readLimit, (err, res, next) => {
            if (!!res && res.length > 0) {
                let kickUids = [];
                let now = Date.now();
                for (let i = 0; i < res.length; i += 2) {
                    let uid = res[i];
                    let active_time = res[i + 1];
                    if (active_time === '') {
                        kickUids.push(uid);
                        continue;
                    }
                    if (now - parseInt(active_time) >= this.taskConf.active_timeout) {
                        kickUids.push(uid);
                    }
                }
                this._kickAccount(0, kickUids, function () {
                    next();
                });
            }
            else {
                next();
            }
        }, function (err) {
            utils.invokeCallback(cb, err);
        });
    }
}

module.exports = AccountKick;