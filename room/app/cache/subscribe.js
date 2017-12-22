const redisClient = require('../utils/import_db').redisClient;
const eventType = require('../consts/eventType');
const cache = require('./cache');
const redisKey = require('../utils/import_def').REDISKEY;
const ACCOUNTKEY = require('../utils/import_def').ACCOUNTKEY;
const platform_data_conf = global.sysConfig.PLATFORM_DATA_CONF;
const playerChangeEvent = require('./playerChangeEvent');

class Subscribe {
    constructor() {}

    listen() {
        redisClient.sub(eventType.PLATFORM_DATA_CHANGE, this.platform_data_change.bind(this));
    }

    platform_data_change(msg) {
        let type = msg.type;
        let value = msg.value;

        // logger.error('--------cache-------platform_data_change', type, value)

        switch (type) {
            case redisKey.PLATFORM_DATA.PUMPWATER:
                logger.error('---------------platform_data_change:', value);
                let pump_water = value.pumpWater;
                let range_pump = platform_data_conf.PUMPWATER.RANGE;
                if (pump_water >= range_pump[0] && pump_water <= range_pump[1]) {
                    cache.set(type, pump_water);
                } else {
                    logger.error('非法平台抽水系数设置，请及时检查平台安全性');
                }

                break;
            case redisKey.PLATFORM_DATA.PLATFORM_CATCHRATE:
                let range_pcatch = platform_data_conf.PLATFORM_CATCHRATE.RANGE;
                if (value >= range_pcatch[0] && value <= range_pcatch[1]) {
                    cache.set(type, value);
                } else {
                    logger.error('非法平台捕获率设置，请及时检查平台安全性');
                }
                break;
            case redisKey.PLATFORM_DATA.BONUS_POOL:
                //logger.error('同步奖池值---value=:', value);
                //cache.set(type, value);
                break;
            case redisKey.PLATFORM_DATA.PUMP_POOL:
                //cache.set(type, value);
                break;
            case redisKey.PLAYER_CATCH_RATE:
                let catchRate = value.value;
                let range_player = platform_data_conf.PLAYER_CATCH_RATE.RANGE;
                if (catchRate >= range_player[0] && catchRate <= range_player[1]) {
                    //TODO::
                    playerChangeEvent.emit(value.uid, ACCOUNTKEY.PLAYER_CATCH_RATE, catchRate);
                } else {
                    logger.error('玩家捕获率设置非法值，请及时检查平台安全性');
                }
                break;
            case redisKey.GAIN_LOSS_LIMIT:
                playerChangeEvent.emit(value.uid, ACCOUNTKEY.GAIN_LOSS_LIMIT, value.value);
                break;
            default:
                break;
        }
    }
}

module.exports = new Subscribe();