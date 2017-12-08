const pomelo = require('pomelo');
const EventEmitter = require('events').EventEmitter;
const SERVER_PERIOD = require('../../consts/constDef').SERVER_PERIOD;
const eventType = require('../../consts/eventType');
const redisKey = require('../../utils/import_def').REDISKEY;
const redisClient = require('../../utils/import_db').redisClient;
const mysqlClient = require('../../utils/import_db').mysqlClient;
const common_log_const_cfg = require('../../utils/import_cfg').GAME_CFGS.common_log_const_cfg;
const common_mathadjust_const_cfg = require('../../utils/import_cfg').GAME_CFGS.common_mathadjust_const_cfg;

class Pumpwater extends EventEmitter {
    constructor() {
        super();
        this.weight_time1 = common_mathadjust_const_cfg.time1 * 1000;
        this.weight_time2 = common_mathadjust_const_cfg.time2 * 1000;
        this.weight_time3 = common_mathadjust_const_cfg.time3 * 1000;
        this.cur_extract = common_mathadjust_const_cfg.extract;

        this._serverPeriodState = SERVER_PERIOD.GENERAL; //服务器周期状态
        this.period_start_time = Date.now(); //周期开始时间
        this.period_duration = this.weight_time1;
        this._pumpWater = 1;
    }

    start() {
        // 开始后一周期后进行第一次抽水计算
        setTimeout(function () {
            this._recursiveMathWater(this.weight_time1, this.weight_time2, this.weight_time3, this.cur_extract, common_mathadjust_const_cfg.addvalue, common_mathadjust_const_cfg.reducevalue);
        }.bind(this), this.weight_time1);
    }

    set pumpWater(value) {
        this.period_start_time = Date.now(); //周期开始时间
        this._pumpWater = value;
        let perioid_info = {
            server_period: this._serverPeriodState,
            pumpWater: this._pumpWater,
            start_time: this.period_start_time,
            duration: this.period_duration
        }

        logger.error('------------------pumpWater', perioid_info);

        redisClient.cmd.set(redisKey.PLATFORM_DATA.PUMPWATER, JSON.stringify(perioid_info));
        this.emit(eventType.PLATFORM_DATA_CHANGE, redisKey.PLATFORM_DATA.PUMPWATER, perioid_info);
    }

    /**
     * 递归计算抽水值...
     */
    _recursiveMathWater(time1, time2, time3, x, addvalue, reducevalue) {
        let random = utils.random_int(1, 10);
        this.weight_time1 = time1 * random;
        this.weight_time2 = time2 * random;
        this.weight_time3 = time3 * random;

        this._mathWater(function (err, extract) {
            this.cur_extract = extract;
            if (extract > x) {
                //进入出分周期
                this._serverPeriodState = SERVER_PERIOD.OUT_SCORE;
                this._countDown(addvalue, this.weight_time2);
            } else {
                //进入吃分周期
                this._serverPeriodState = SERVER_PERIOD.EATE_SCORE;
                this._countDown(reducevalue, this.weight_time3);
            }
        }.bind(this));

        setTimeout(function () {
            this._recursiveMathWater(time1, time2, time3, x, addvalue, reducevalue);
        }.bind(this), this.weight_time1);
    }

    /**
     * 计算"玩家捕鱼总消耗/玩家捕鱼总收入"
     */
    _mathWater(cb) {
        var oneday = new Date().getTime();
        oneday = Date.getTimeFromTimestamp(oneday - 1000 * 60 * 60 * 24);

        let sql = `SELECT (1 - SUM(gain)/SUM(cost)) AS extract FROM 
        tbl_gold_log WHERE level > 15 AND log_at > ? AND scene IN (
            ${common_log_const_cfg.GAME_FIGHTING},
            ${common_log_const_cfg.GOLDFISH_GAIN},
            ${common_log_const_cfg.NUCLER_LASER},
            ${common_log_const_cfg.NUCLER_DROP},
            ${common_log_const_cfg.ACTIVE_DRAW},
            ${common_log_const_cfg.NUCLER_COST},
            ${common_log_const_cfg.ACTIVE_COST})`;

        mysqlClient.query(sql, [oneday], function (err, result) {
            if (result == null || result.length == 0) {
                cb(err, 1);
                return;
            }

            logger.error('------------------_mathWater', result);
            let extract = result[0].extract || 0;
            cb(err, result[0].extract);
        });

    }

    _countDown(target_pump_water, timeout) {
        this.period_duration = timeout;
        this.pumpWater = target_pump_water;
        setTimeout(function () {
            this.period_duration = this.weight_time1 - timeout;
            this._serverPeriodState = SERVER_PERIOD.GENERAL; //服务器周期状态
            this.pumpWater = 1;
        }, timeout);
    }
}

module.exports = new Pumpwater();