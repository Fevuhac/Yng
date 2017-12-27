const redisAccountSync = require('../../utils/import_utils').redisAccountSync;
const redisClient = require('../../utils/import_db').redisClient;
const mysqlClient = require('../../utils/import_db').mysqlClient;
const redisKey = require('../../utils/import_def').REDISKEY;
const EventEmitter = require('events').EventEmitter;
const eventType = require('../../consts/eventType');

class CatchRevise extends EventEmitter {
    constructor() {
        super();
        this._timer = null;

        this._sql = {
            cash: 'SELECT SUM(cost) AS cash FROM tbl_change_log WHERE status=2 AND created_at > ?',
            recharge: 'SELECT SUM(money) AS recharge FROM tbl_order WHERE status=2 AND created_at > ?'
        }
        this._catch_revise = 1; //全服捕获修正默认值
        this._base = 90000; //门槛
        this._cash_recharege_percet = 0.35; //提现比例系数
    }

    start() {
        redisClient.sub(redisKey.DATA_EVENT_SYNC.CASH_RECHAREGE_PERCET, this.cash_recharege_percet.bind(this));
        redisClient.cmd.get(redisKey.PLATFORM_DATA.CASH_RECHAREGE_PERCET, function(err, result){
            if(err){
                logger.error('读取提现比例系数失败', err);
                return;
            }

            logger.error('读取提现比例系数值', result);
            this._cash_recharege_percet = !!result && Number(result) || 0.35;
            if (!this._timer) {
                this._timer = setInterval(this.sync.bind(this), 2000);
            }
        }.bind(this))

    }

    stop() {
        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
        }
    }

    cash_recharege_percet(percet) {
         logger.error('------------提现比例系数变化通知:', percet)
        if (Number.isNaN(percet.value)) {
            logger.error('收到异常提现比例系数', percet.value);
        } else {
            this._cash_recharege_percet = Number(percet.value);
        }
    }

    /**
     * 查询最近一段时间内提现总金额
     * @param {提现时间} created_at 
     */
    _queryCash(created_at) {
        return new Promise(function (resolve, reject) {
            mysqlClient.query(this._sql.cash, [created_at], function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    // logger.error('------------_queryCash:',result)
                    resolve(result[0].cash);
                }
            });


        }.bind(this));
    }

    /**
     * 查询最近一段时间内提充值金额
     * @param {充值时间} created_at 
     */
    _queryRecharge(created_at) {
        return new Promise(function (resolve, reject) {
            mysqlClient.query(this._sql.recharge, [created_at], function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    
            // logger.error('------------_queryRecharge:',result)
                    resolve(result[0].recharge);
                }
            });
        }.bind(this));
    }

    async sync() {
        try {
            let sevenDay = Date.getTimeFromTimestamp(new Date().getTime() - 1000 * 60 * 60 * 24 * 7);
            let recharge = await this._queryRecharge(sevenDay);
            recharge = Math.min(recharge, 10000);
            let cash = await this._queryCash(sevenDay);

            // logger.error('------------sevenDay:',sevenDay)
            // logger.error('------------recharge:',recharge)
            // recharge = 337500;
            // logger.error('------------cash:',cash)
            // logger.error('------------_cash_recharege_percet:',this._cash_recharege_percet)

            let revise_value = Math.min(Math.max(1 + this._cash_recharege_percet - cash / recharge, 0.7), 1); //信用额度
            if (Number.isNaN(revise_value)) {
                logger.error('定时计算全服捕获修正系数值异常', revise_value);
                throw 'revise_value is nan';
            }

            this._catch_revise = revise_value;

        } catch (err) {
            logger.error('定时计算全服捕获修正系数异常', err);
        } finally{
            redisClient.cmd.set(redisKey.PLATFORM_DATA.PLATFORM_CATCH_REVISE, this._catch_revise);
            logger.error('------------revise_value:',this._catch_revise)
            this.pub_value(redisKey.PLATFORM_DATA.PLATFORM_CATCH_REVISE, this._catch_revise);
        }
    }

    pub_value(type, value) {
        this.emit(eventType.PLATFORM_DATA_CHANGE, type, value);
    }
}

module.exports = new CatchRevise();