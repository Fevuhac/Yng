const RedisUtil = require('../utils/RedisUtil');
const REDIS_KEYS = require('../buzz/cst/buzz_cst_redis_keys').REDIS_KEYS,
    PAIR = REDIS_KEYS.PAIR;
const account_def = require('../dao/account/account_def');
const async = require('async');
const redisSync = require('../buzz/redisSync');
const common = require('../dao/account/common');

const ObjUtil = require('../buzz/ObjUtil');
const DateUtil = require('../utils/DateUtil');
const utils = require('../buzz/utils');
const CharmUtil = require('../utils/CharmUtil');
const vip_vip_cfg = require('../../cfgs/vip_vip_cfg');

class User {
    constructor() {

    }

    isRegiste(data) {
        return new Promise(function (resolve, reject) {
            RedisUtil.hget(PAIR.OPENID_UID, data.openid, function (err, uid) {
                if (err) {
                    reject(err);
                    return;
                }

                if (!uid) {
                    let sql = "SELECT id FROM `tbl_account` WHERE `channel_account_id`=? ";
                    let sql_data = [data.openid];

                    mysqlPool.query(sql, sql_data, function (err, rows) {
                        if (err) {
                            reject(err);
                            return;
                        }

                        let uid = rows && rows[0];
                        if (uid) {
                            async.waterfall([function (cb) {
                                common.getAccountById(mysqlPool, uid, cb);
                            }, function (result, cb) {
                                RedisUtil.hset(PAIR.OPENID_UID, data.openid, uid, cb);
                            }], function (err, result) {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(result.id);
                                }
                            })
                        } else {
                            resolve(null);
                        }

                    });

                } else {
                    resolve(uid);
                }

            });
        });

    }

    registe(userInfo) {
        let self = this;
        return new Promise(function (resolve, reject) {
            RedisUtil.generateNewId(function (id) {
                self._genAccount(id, userInfo, function (err, account) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(id);
                    }
                });
            });
        });
    }

    login(data) {
        let self = this;
        return new Promise(function (resolve, reject) {
            redisSync.getAccountById(data.uid, function (err, account) {
                if (err) {
                    reject(err);
                    return;
                }

                logLogin.push({
                    account_id: account.id,
                    log_at: new Date(),
                });

                self._someOptAfterLogin(account, function (err, account) {
                    resolve(account);
                });

            });

        });
    }

    loginStatus(token) {}

    getUserInfo(data) {}

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

        if (data.saltPassword) {
            newAccount.password = data.saltPassword
        }
        if(data.phone){
            newAccount.phone = data.phone 
        }

        async.waterfall([function (cb) {
            RedisUtil.hset(PAIR.OPENID_UID, data.openid, id, cb);
        }, function (ret, cb) {
            redisSync.setAccountById(id, newAccount, cb);
        }, function(res, cb){
            redisSync.getAccountById(id, cb);
        }], function (err, account) {
            account.nickname = account.nickname;
            account.commit();
            cb && cb(err, account.id);
        })
    };

    /**
     * 当前月卡是否有效
     * @param card_type 月卡类型，取值为normal
     */
    _isCardValid(buyDate) {
        if (buyDate) {
            let curDate = DateUtil.format(new Date(), "yyyy-MM-dd");
            let offDate = DateUtil.dateDiff(curDate, buyDate);
            return offDate < 30;
        }
        return true;
    }

    /**
     * 登录后相关数据操作
     */
    _someOptAfterLogin(account, cb) {
        let id = account.id;
        let token = utils.generateSessionToken(id);
        let timeNow = (new Date()).format("yyyy-MM-dd hh:mm:ss");
        account.token = token;
        account.updated_at = timeNow;
        account.last_online_time = timeNow;

        //月卡是否过期、魅力值变化
        let card = account.card;
        let oldCard = ObjUtil.clone(card);
        let cp = account.charm_point;
        if (card.normal && !this._isCardValid(card.normal.start_date)) {
            delete card.normal;
        }
        if (card.senior && !this._isCardValid(card.senior.start_date)) {
            delete card.senior;
        }
        account.card = card;

        //补足vip
        let vip = account.vip;
        if (vip > 0 && account.vip_daily_fill == 1) {
            var vip_info = null;
            for (let i in vip_vip_cfg) {
                if (vip_vip_cfg[i].vip_level == vip) {
                    vip_info = vip_vip_cfg[i];
                    break;
                }
            }
            if (vip_info && account.first_login === 1) {
                let gold = Math.max(account.gold, vip_info.vip_dailyGold);
                if (gold - account.gold > 0) {
                    account.gold = gold - account.gold;
                }
                account.pearl = Math.max(account.pearl, vip_info.vip_dailyDiamond);
            }
        }

        //登录次数
        account.login_count = account.login_count + 1;

        //
        common.addFamousOnlineBroadcast(account, account.platform);
        //重设魅力值
        CharmUtil.getCurrentCharmPoint(account, function (charmPoint) {
            if (charmPoint) {
                account.charm_point = charmPoint;
            }

            if (account.first_login === 1) {
                account.first_login = 0;
            }
            // 下面的代码执行后效果等同于account.commit().
            redisSync.setAccountById(account.id, account.toJSON());

            cb && cb(null, account);
        });
    }
}

module.exports = User;