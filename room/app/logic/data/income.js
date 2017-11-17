const pomelo = require('pomelo');
const EventEmitter = require('events').EventEmitter;
const common_mathadjust_const_cfg = GAMECFG.common_mathadjust_const_cfg;
const eventType = require('../../consts/eventType')

class Income extends EventEmitter{
    constructor() {
        super();
        this._pumpWater = 1;
        this.time_reset = new Date().getTime();
        this.time_special = new Date().getTime();
        this.weight_time1 = common_mathadjust_const_cfg.time1 * 1000;
        this.weight_time2 = common_mathadjust_const_cfg.time2 * 1000;
        this.weight_time3 = common_mathadjust_const_cfg.time3 * 1000;
        this.cur_extract = common_mathadjust_const_cfg.extract;
    }

    start(){
        this.pumpBegin(this.weight_time1, this.weight_time2, this.weight_time3,this.cur_extract,
            common_mathadjust_const_cfg.addvalue,
            common_mathadjust_const_cfg.reducevalue);
    }

    /**
     * 获取当前服务器的抽水值.
     */
    get pumpWater() {
        return this._pumpWater;
    }

    set pumpWater(value){
        this._pumpWater = value;
        this.emit(eventType.PUMPWATER, this._pumpWater);
    }
    /**
     * 服务器进入抽水周期.
     */
    pumpBegin(time1, time2, time3, x, addvalue, reducevalue) {
        // 开始后一周期后进行第一次抽水计算
        this.pumpWater = 1;
        this.time_reset = new Date().getTime();
        setTimeout(function() {
            this._recursiveMathWater(time1, time2, time3, x, addvalue, reducevalue);
        }.bind(this), time1);
    }

    /**
     * 递归计算抽水值...
     */
    _recursiveMathWater(time1, time2, time3, x, addvalue, reducevalue) {
        let random = utils.random_int(1, 10);
        this.weight_time1 = time1 * random;
        this.weight_time2 = time2 * random;
        this.weight_time3 = time3 * random;

        this._mathWater(function(err, extract) {
            this.cur_extract = extract;
            if (extract > x) {
                //进入出分周期
                this._countDown(addvalue, this.weight_time2);
            }
            else {
                //进入吃分周期
                this._countDown(reducevalue, this.weight_time3);
            }
        }.bind(this));

        this.time_reset = new Date().getTime();
        setTimeout(function() {
            this._recursiveMathWater(time1, time2, time3, x, addvalue, reducevalue);
        }.bind(this), this.weight_time1);
    }

    /**
     * 计算"玩家捕鱼总消耗/玩家捕鱼总收入"
     */
    _mathWater(cb) {
        var oneday = new Date().getTime();
        oneday = Date.getTimeFromTimestamp(oneday - 1000 * 60 * 60 * 24);

        let sql = 'SELECT (1 - SUM(gain)/SUM(cost)) AS extract FROM tbl_gold_log WHERE level > 15 AND log_at > ? AND scene IN (3,103,203,29,129,229,5,11)';
        mysqlClient.query(sql, [oneday], function (err, result) {
            if (result == null || result.length == 0) {
                cb(err, 1);
                return;
            }

            let extract = result[0].extract || 0;
            cb(err, result[0].extract);
        });

    }

    _countDown(target_pump_water, timeout) {
        this.pumpWater = target_pump_water;

        this.time_special = new Date().getTime();
        setTimeout(function() {
            //进入普通周期
            this.pumpWater = 1;
        }, timeout);
    }
}

module.exports = Income;

