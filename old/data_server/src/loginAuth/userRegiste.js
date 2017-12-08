const RedisUtil = require('../utils/RedisUtil');
const REDIS_KEYS = require('../buzz/cst/buzz_cst_redis_keys').REDIS_KEYS,
    PAIR = REDIS_KEYS.PAIR;
const account_def = require('../dao/account/account_def');
const ObjUtil = require('../buzz/ObjUtil');
const DateUtil = require('../utils/DateUtil');
const async = require('async');
const redisSync = require('../buzz/redisSync');
const common = require('../dao/account/common');

class UserRegiste {
    constructor() {

    }

    /**
     * 产生一个新玩家，并及时写入redis
     */
    _genAccount(id, data, cb) {

        let AccountDefault = account_def.AccountDef;
        let OtherDef = account_def.OtherDef;

        let newAccount = {};
        for (let k in AccountDefault) {
            newAccount[k] = ObjUtil.clone(AccountDefault[k].def);
        }
        for (let k in OtherDef) {
            newAccount[k] = ObjUtil.clone(OtherDef[k].def);
        }

        let timeNow = (new Date()).format("yyyy-MM-dd hh:mm:ss");
        newAccount.created_at = timeNow;
        newAccount.updated_at = timeNow;
        newAccount.last_online_time = timeNow;
        var daysInMonth = DateUtil.getDaysOfThisMonth();
        for (var i = 0; i < daysInMonth; i++) {
            newAccount.month_sign[i] = 0;
        }
        newAccount.id = id;
        newAccount.platform = data.device;
        newAccount.channel_account_id = data.openid;
        newAccount.nickname = data.nickname;
        newAccount.figure_url = data.figure_url;
        newAccount.channel = data.platformType.toString();
        newAccount.city = data.city;
        async.waterfall([function (cb) {
                RedisUtil.hset(PAIR.OPENID_UID, data.openid, id, cb);
            }, function (ret, cb) {
                redisSync.setAccountById(id, newAccount, cb);
            }], function (err, result) {
                cb && cb(err, result);
            }
        )
    };

    isRegiste(openid) {
        let promise = new Promise(function (resolve, reject) {
            RedisUtil.hget(PAIR.OPENID_UID, openid, function (err, uid) {
                if (err) {
                    reject(err);
                    return;
                }

                if (!uid) {

                    let sql = "SELECT id FROM `tbl_account` WHERE `channel_account_id`=? ";
                    let sql_data = [openid];

                    mysqlPool.query(sql, sql_data, function (err, rows) {
                        if (err) {
                            reject(err);
                            return;
                        }

                        let uid = rows && rows[0];
                        if(uid){
                            async.waterfall([function (cb) {
                                common.getAccountById(mysqlPool, uid, cb);
                            },function (result, cb) {
                                RedisUtil.hset(PAIR.OPENID_UID, openid, uid, cb);
                            }], function (err, result) {
                                if(err){
                                    reject(err);
                                }
                                else {
                                    resolve(result.id);
                                }
                            })
                        }else {
                            resolve(null);
                        }

                    });

                }
                else {
                    resolve(uid);
                }

            });
        });

        return promise;

    }

    registe(userInfo) {
        let self = this;
        let promise = new Promise(function (resolve, reject) {
            RedisUtil.generateNewId(function (id) {
                self._genAccount(id, userInfo, function (err, account) {
                    if(err){
                        reject(err);
                    }else {
                        resolve(id);
                    }
                });
            });
        });
        return promise;
    }
}

module.exports = new UserRegiste();