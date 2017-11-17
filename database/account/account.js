const utils = require('../../base/utils/utils');
const AccountCommit = require('./accountCommit');
const accountConf = require('./accountConf');
const REDISKEY = require('../consts').REDISKEY;
const accountParser = require('./accountParser');

class Account extends AccountCommit{
    constructor(id) {
        super(id);
    }

    /**
     * 序列化数据为Account对象
     * @param uid
     * @param data
     * @returns {Account}
     */
    static parse(uid, data){
        let account = new Account(uid);
        for(let key in data){
            account.appendValue(key, data[key]);
        }
        return account;
    }

    /**
     * 添加属性到Account对象
     * @param key
     * @param data
     */
    appendValue(key, data){
        this[`_${key}`] = accountParser.parseValue(key, data[key]);
    }

    toJSON() {
        let jsonData = {};
        for (let key in this) {
            if (typeof this[key] !== 'function' && key.indexOf('__') !== 0) {
                jsonData[key.replace(/_/, '')] = this[key];
            }
        }
        return jsonData;
    }

    static getCmd(key) {
        let typeInfo = accountConf.getFieldDef(key);
        let cmd = 'HSET';
        if (typeInfo.inc === true) {
            cmd = 'HINCRBY'
        }
        return cmd;
    }

    commit(cb) {
        let fields = this.__update;

        if (fields.length === 0) return;

        let cmds = [];

        fields.forEach(function (key) {
            cmds.push([Account.getCmd(key[0]), REDISKEY.getKey(key[0]), this.id, accountParser.serializeValue(key[0], key[1])]);
        }.bind(this));

        this.__update = [];

        redisConnector.cmd.multi(cmds).exec(function (err, result) {
            if (!!err) {
                utils.invokeCallback(cb, err);
                return;
            }

            redisConnector.cmd.sadd(REDISKEY.UPDATED_UIDS, this.id);

            utils.invokeCallback(cb, null, result);
        }.bind(this));
    }
}

module.exports = Account;