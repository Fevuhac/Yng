const utils = require('../../base/utils/utils');
const Account = require('../account/account');
const keyTypeDef = require('../consts/keyTypeDef');
const accountConf = require('../account/accountConf');
const accountParser = require('../account/accountParser');
accountConf.addDataDef(keyTypeDef.AccountDef);
accountConf.addDataDef(keyTypeDef.OtherDef);
const REDISKEY = require('../consts').REDISKEY;

class Util {
    constructor(){
    }

    parseHashKey(res){
        let uids = [];
        for (let i = 0; i < res.length; i+=2) {
            let uid = Number(res[i]);
            if(!isNaN(uid)){
                uids.push(uid);
            }
        }
        return uids;
    }

    parseHashValue(key, res){
        let values = [];
        for (let i = 0; i < res.length; i+=2) {
            values.push(accountParser.parseValue(key, res[i+1]));
        }
        return values;
    }

    convertValue(key, datas){
        let values = [];
        for (let i = 0; i < datas.length; i++) {
            values.push(accountParser.parseValue(key, datas[i]));
        }
        return values;
    }

    filterInvalidAccount(accounts){
        let account_filter = accounts.filter(function (item) {
            return item !== null && item !== undefined;
        });

        return account_filter;
    }
};

/**
 * 判断用户是否存在于redis中
 * @param uid
 * @param cb
 * @private
 */
function _exist(uid, cb) {
    redisConnector.cmd.hget(REDISKEY.PLATFORM, uid, function (err, result) {
        if (!!err) {
            utils.invokeCallback(cb, 500);
            return;
        }

        if (!result) {
            utils.invokeCallback(cb, 404);
            return;
        }

        utils.invokeCallback(cb, null, result);
    });
}

/**
 * 设置用户信息到redis
 * @param id
 * @param data 支持[{key:value},{key:value}]和{key1:value1,key2:value2}两种数据格式
 * @param cb
 */
function _setAccount(id, data, cb) {

    if (!id || !data) {
        utils.invokeCallback(cb, '参数错误');
        return;
    }

    let fields = [];
    if (data instanceof Array) {
        fields = data;
    }
    else {
        for (let key in data) {
            let item = {};
            item[key] = data[key];
            fields.push(item);
        }
    }

    if(fields.length === 0){
        utils.invokeCallback(cb, null);
        return;
    }

    let cmds = [];
    fields.forEach(function (item) {
        for (let key in item) {
            cmds.push([Account.getCmd(key), REDISKEY.getKey(key), id, Account.buildValue(key, item[key])])
        }
    });

    redisConnector.cmd.multi(cmds).exec(function (err, result) {
        if (!!err) {
            utils.invokeCallback(cb, err);
            return;
        }

        redisConnector.cmd.sadd(REDISKEY.UPDATED_UIDS, id);

        utils.invokeCallback(cb, null, result);
    });
}

function _setAccountAsync(id, data) {
    let promise = new Promise(function (resolve, reject) {
        _setAccount(id, data, function (err, result) {
            if(err){
                reject(err);
            }
            else {
                resolve(result);
            }
        })
    });

    return promise;
}

/**
 * 从redis缓存中获取用户数据
 * @param id
 * @param fields
 * @param cb
 */
function _getAccount(uid, fields, cb) {
    if (!uid) {
        utils.invokeCallback(cb, '参数错误');
        return;
    }

    var all = false;
    if (typeof(fields) === 'function') {
        cb = fields;
        all = true;
    }

    _exist(uid, function (err) {

        if (err) {
            utils.invokeCallback(cb, null);
            return;
        }

        if (all || !!fields && fields.length > 1) {
            let cmds = [];
            let _fileds = null;
            if (all) {
                _fileds = Array.from(accountConf.cacheFields);
            }
            else {
                _fileds = fields;
            }

            _fileds.forEach(function (item) {
                cmds.push(['hget', REDISKEY.getKey(item), uid])
            });

            redisConnector.cmd.multi(cmds).exec(function (err, docs) {
                if (!!err) {
                    utils.invokeCallback(cb, err);
                    return;
                }

                let account = new Account(uid);
                for (var i = 0; i < _fileds.length; ++i) {
                    account.appendValue(_fileds[i], docs[i]);
                }

                utils.invokeCallback(cb, null, account);
            });
        }
        else {
            redisConnector.cmd.hget(REDISKEY.getKey(fields[0]), uid, function (err, doc) {
                if (!!err) {
                    utils.invokeCallback(cb, err);
                    return;
                }

                let account = new Account(uid);
                account.appendValue(fields[0], doc);
                utils.invokeCallback(cb, null, account);
            });
        }

    });

}

function _getAccountAsync(uid, fields) {
    let promise = new Promise(function (resolve, reject) {
        _getAccount(uid, fields, function (err, result) {
            if(err){
                reject(err);
            }
            else {
                resolve(result);
            }
        })
    });

    return promise;
}

/**
 * 嵌套执行hscan操作, 直到将hash表中所有玩家遍历完.
 * redisKey.getKey(redisKey.PLATFORM)
 */
function _getHashValueLimit(redisKey, skip, limit, op, finish) {
    redisConnector.cmd.hscan(redisKey, skip,'COUNT', limit, function(err, res) {
        if(err){
            utils.invokeCallback(op, err);
            return;
        }
        let cursor = res[0];
        utils.invokeCallback(op, res[1], function nextCursor() {
            if (0 == cursor) {
                utils.invokeCallback(finish, null);
            }else {
                _getHashValueLimit(redisKey, cursor, limit, op, finish);
            }

        });
    });
}

/**
 * 嵌套执行hscan操作, 直到将hash表中所有玩家遍历完.
 * redisKey.getKey(redisKey.PLATFORM)
 */
function _getSetValueLimit(redisKey, skip, limit, op, finish) {
    redisConnector.cmd.sscan(redisKey, skip,'COUNT', limit, function(err, res) {
        if(err){
            utils.invokeCallback(op, err);
            return;
        }
        let cursor = res[0];
        utils.invokeCallback(op, res[1], function nextCursor() {
            if (0 == cursor) {
                utils.invokeCallback(finish, null);
            }else {
                _getSetValueLimit(redisKey, cursor, limit, op, finish);
            }
        });
    });
}


function _remSetValues(redisKey, members, cb) {
    let cmds = [];
    members.forEach(function (member) {
        cmds.push(['srem', redisKey, member])
    });

    let promise = new Promise(function (resolve, reject) {
        redisConnector.cmd.multi(cmds).exec(function (err, results) {
            if (!!err) {
                utils.invokeCallback(cb, err);
                resolve(results);
                return;
            }

            utils.invokeCallback(cb, null, results);
            resolve(results);
        });
    });

    return promise;
}


/**
 * 删除用户所有的缓存数据
 * @param uid
 * @param cb
 */
function _delAccount(uids, cb) {
    let cmds = [];
    uids.forEach(function (uid) {
        accountConf.cacheFields.forEach(function (item) {
            cmds.push(['hdel', REDISKEY.getKey(item), uid])
        });
    });

    redisConnector.cmd.multi(cmds).exec(function (err, result) {
        if (!!err) {
            utils.invokeCallback(cb, err);
            return;
        }
        utils.invokeCallback(cb, null, result);
    });
}


function _genAccount(uid, data) {
    return Account.parse(uid, data);
}

function _multiAsync(cmds) {
    let promise = new Promise(function (resolve, reject) {
        redisConnector.cmd.multi(cmds).exec(function (err, results) {
            if(err){
                logger.error(`${this.taskId}执行_execRedisMulti玩家数据异常`, err);
                reject(err);
            }
            resolve(results);
        }.bind(this));
    });

    return promise;
}




module.exports.Util = new Util();
module.exports.getAccount = _getAccount;
module.exports.getAccountAsync = _getAccountAsync;
module.exports.setAccount = _setAccount;
module.exports.setAccountAsync = _setAccountAsync;
module.exports.genAccount = _genAccount;
module.exports.delAccount = _delAccount;
module.exports.accountCheck = _exist;
module.exports.getHashValueLimit = _getHashValueLimit;
module.exports.remSetValues = _remSetValues;
module.exports.getSetValueLimit = _getSetValueLimit;
module.exports.multiAsync = _multiAsync;