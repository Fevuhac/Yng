const utils = require('../../base/utils/utils');
const AccountCommit = require('./accountCommit');
const accountConf = require('./accountConf');
const REDISKEY = require('../consts').REDISKEY;
const accountParser = require('./accountParser');
const EventHandler = require('./eventHandler');
const ACCOUNT_EVENT_TYPE = require('../consts/consts').ACCOUNT_EVENT_TYPE;
const ACCOUNT_EVENT_NAME = require('../consts/consts').ACCOUNT_EVENT_NAME;

class Account extends AccountCommit {
    constructor(id) {
        super(id);
        this.eventHandler = new EventHandler();
    }

    /**
     * 序列化数据为Account对象
     * @param uid
     * @param data
     * @returns {Account}
     */
    static parse(uid, data) {
        let account = new Account(uid);
        for (let key in data) {
            account.appendValue(key, data[key]);
        }
        return account;
    }

    /**
     * 添加属性到Account对象
     * @param key
     * @param data
     */
    appendValue(key, data) {
        this[`_${key}`] = accountParser.parseValue(key, data);
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
            if (typeInfo.type == 'float') {
                cmd = 'HINCRBYFLOAT'
            } else {
                cmd = 'HINCRBY'
            }

        }
        return cmd;
    }

    commit(cb) {
        let fields = this.__update;

        if (fields.length === 0) return;

        let cmds = [];

        this.eventHandler.listenKey(fields, this);

        fields.forEach(function (key) {
            cmds.push([Account.getCmd(key[0]), REDISKEY.getKey(key[0]), this.id, accountParser.serializeValue(key[0], key[1])]);
        }.bind(this));

        this.__update = [];

        redisConnector.cmd.multi(cmds).exec(function (err, result) {
            if (!!err) {
                utils.invokeCallback(cb, err);
                return;
            }

            this.eventHandler.addEvent(ACCOUNT_EVENT_TYPE.DATA_SYNC, this);

            this.eventHandler.exec();

            utils.invokeCallback(cb, null, result);
        }.bind(this));
    }
}

module.exports = Account;