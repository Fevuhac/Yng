const ACCOUNT_EVENT_TYPE = require('../consts/consts').ACCOUNT_EVENT_TYPE;
const common_const_cfg = require('../../cfgs/common_const_cfg');
const player_users_cfg = require('../../cfgs/player_users_cfg');
const ACCOUNTKEY = require('../consts').ACCOUNTKEY;
const REDISKEY = require('../consts').REDISKEY;


class EventHandler {
    constructor() {
        this.events = {};
        this.gainLossKeys = new Map([
            [ACCOUNTKEY.RECHARGE, 1],
            [ACCOUNTKEY.CASH, 1],
            [ACCOUNTKEY.COST, 1],
            [ACCOUNTKEY.GOLD, 1]
        ])
    }

    addEvent(type, account) {
        switch (type) {
            case ACCOUNT_EVENT_TYPE.GAIN_LOST:

                if (!this.events[type]) {
                    this.events[type] = this.genGainLossFunc(account);
                }
                break;
            case ACCOUNT_EVENT_TYPE.DATA_SYNC:
                if (!this.events[type]) {
                    this.events[type] = this.genSyncFunc(account);
                }
                break;
            default:
                break;
        }
    }

    listenKey(keys, account) {
        keys.forEach(function (key) {
            if (this.gainLossKeys.has(key[0])) {
                this.addEvent(ACCOUNT_EVENT_TYPE.GAIN_LOST, account);
            }
        }.bind(this));
    }

    //计算盈亏系数
    _calcGainLoss(account) {
        if(isNaN(account.cash) || isNaN(account.gold) || isNaN(account.cost) || isNaN(account.recharge)){
            console.error('_calcGainLoss--- 参数异常');
            return null;
        }

        return (account.cash * common_const_cfg.CHANGE_CASH_4 + account.gold + account.cost) - (account.recharge * common_const_cfg.CHANGE_CASH_3 + player_users_cfg[0].gold);
    }

    genGainLossFunc(account) {
        let self = this;
        return function () {
            let v = self._calcGainLoss(account);
            if(v){
                let tmpV = account.gain_loss;
                account.gain_loss = v;
                if(account.gain_loss_limit != 0 && account.gain_loss_snapshot == 0){
                    account.gain_loss_snapshot = account.gain_loss; 
                }
                else if(account.gain_loss_limit == 0 && account.gain_loss_snapshot != 0){
                    account.gain_loss_snapshot = 0;
                }
                if(tmpV != v){
                    redisConnector.cmd.zadd('rank:gain', v, account.id);
                    redisConnector.cmd.zadd('rank:loss', v, account.id);
                    account.commit();
                }
            }
        }
    }

    genSyncFunc(account) {
        return function () {
            redisConnector.cmd.sadd(REDISKEY.UPDATED_UIDS, account.id);
        }
    }

    exec() {
        for (let key in this.events) {
            this.events[key]();
        }
    }
}

module.exports = EventHandler;