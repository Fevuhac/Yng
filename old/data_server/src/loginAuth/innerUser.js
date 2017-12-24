const User = require('./user');
const async = require('async');
const buzz_cst_error = require('../buzz/cst/buzz_cst_error');
const account_def = require('../dao/account/account_def');
const crypto = require('crypto');
const redisSync = require('../buzz/redisSync');
const RedisUtil = require('../utils/RedisUtil');
const phoneVerification = require('./phoneVerification');
const common = require('../dao/account/common');
const REDIS_KEYS = require('../buzz/cst/buzz_cst_redis_keys').REDIS_KEYS,
    PAIR = REDIS_KEYS.PAIR;

function createSalt(pwd) {
    const hash = crypto.createHash('sha1');
    hash.update(pwd);
    return hash.digest('hex');
}

class InnerUser extends User {
    constructor(config) {
        super();
    }

    loginStatus(token) {}

    getUserInfo(data) {
        return data;
    }

    async isRegiste(data) {
        return await this._checkUserExist(data);
    }

    async registe(data) {
        let regData = data;
        regData.openid = data.username;
        regData.figure_url = data.figure_url || account_def.OtherDef.figure_url.def;
        regData.city = data.city || account_def.AccountDef.city.def;
        regData.saltPassword = createSalt(data.username + data.password);

        return await super.registe(regData);

    }

    async login(data) {
        let self = this;
        return new Promise(async function (resolve, reject) {
            let uid = await self.getUID(data.username);
            if (!uid) {
                reject(buzz_cst_error.ERROR_OBJ.USER_NOT_EXIST.msg);
            }
            redisSync.getAccountById(uid, function (err, account) {
                if (err) {
                    reject(err);
                    return;
                }

                if (account) {
                    let saltPassword = createSalt(account.channel_account_id + data.password);
                    if (saltPassword !== account.password) {
                        reject(buzz_cst_error.ERROR_OBJ.USERNAME_PASSWORD_ERROR.msg);
                        return;
                    }

                    logLogin.push({
                        account_id: account.id,
                        log_at: new Date(),
                    });

                    self._someOptAfterLogin(account, function (err, account) {
                        resolve(account);
                    });
                } else {
                    reject(buzz_cst_error.ERROR_OBJ.USER_NOT_EXIST.msg);
                }
            });

        });
    }

    async bindPhone(data){
        let self = this;
        return new Promise(async function (resolve, reject) {
            let uid = await self.getUID(data.phone);
            if (uid) {
                reject(buzz_cst_error.ERROR_OBJ.PHONE_EXIST.msg);
            }

            redisSync.getAccountById(data.uid, async function (err, account) {
                if (err) {
                    reject(err);
                    return;
                }

                if (account) {
                    if(account.phone){
                        reject(buzz_cst_error.ERROR_OBJ.USER_NOT_EXIST.msg);
                    }
                    else{
                        account.phone = data.phone;
                        account.commit();
                        resolve(null); 
                    }
                } else {
                    reject(buzz_cst_error.ERROR_OBJ.USER_NOT_EXIST.msg);
                }
            });

        }); 
    }

    async modifyPassword(data) {
        let self = this;
        return new Promise(async function (resolve, reject) {
            let uid = await self.getUID(data.phone || data.username);
            if (!uid) {
                reject(buzz_cst_error.ERROR_OBJ.USER_NOT_EXIST.msg);
            }
            redisSync.getAccountById(uid, async function (err, account) {
                if (err) {
                    reject(err);
                    return;
                }

                if (account) {
                    let saltPassword = createSalt(account.channel_account_id + data.newPassword);
                    account.password = saltPassword;

                    logLogin.push({
                        account_id: account.id,
                        log_at: new Date(),
                    });
                    account.commit();
                    resolve(null);

                } else {
                    console.log('modifyPassword -3333-- ', data);
                    reject(buzz_cst_error.ERROR_OBJ.USER_NOT_EXIST.msg);
                }
            });

        });
    }

    async _chekcUsername(username) {
        return new Promise(function (resolve, reject) {
            let sql = `SELECT id FROM tbl_account WHERE channel_account_id=?`;
            let sqlData = [username];
            mysqlPool.query(sql, sqlData, function (err, result) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result && result[0] && result[0].id || null);
            });
        });
    }

    async _chekcPhone(phone) {
        return new Promise(function (resolve, reject) {
            let sql = `SELECT id FROM tbl_account WHERE phone=?`;
            let sqlData = [phone];
            mysqlPool.query(sql, sqlData, function (err, result) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result && result[0] && result[0].id || null);
            });
        });
    }

    _checkUserExist(data) {
        let self = this;
        return new Promise(function (resolve, reject) {
            RedisUtil.hget(PAIR.OPENID_UID, data.username, async function (err, uid) {
                if (err) {
                    reject(err);
                    return;
                }

                if (uid) {
                    resolve(buzz_cst_error.ERROR_OBJ.USERNAME_EXIST.msg);
                    return;
                }

                if (!uid) {     
                    uid = await self._chekcUsername(data.username);
                    if (uid) {
                        reject(buzz_cst_error.ERROR_OBJ.USERNAME_EXIST.msg);
                        return;
                    }
                }

                resolve(false);
            });
        })
    }

    getUID(username) {
        let self = this;
        return new Promise(function (resolve, reject) {
            RedisUtil.hget(PAIR.OPENID_UID, username, async function (err, uid) {
                if (err) {
                    reject(err);
                    return;
                }
                if (!uid) {
                    uid = await self._chekcUsername(username);
                    if (!uid) {
                        resolve(null);
                    } else {
                        async.waterfall([function (cb) {
                            common.getAccountById(mysqlPool, uid, cb);
                        }, function (result, cb) {
                            RedisUtil.hset(PAIR.OPENID_UID, username, uid, cb);
                        }], function (err, result) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(result.id);
                            }
                        })
                    }
                } else {
                    resolve(uid);
                }
            });
        })
    }


}

module.exports = InnerUser;