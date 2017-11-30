const redisClient = require('../utils/import_db').redisClient;
const eventType = require('../consts/eventType');
const cache = require('./cache');
const redisKey = require('../utils/import_def').REDISKEY;
const platform_data_conf = require('../config/configReader').sysConfig.PLATFORM_DATA_CONF;
const playerCatchRateEvent = require('./playerCatchRateEvent');

class Subscribe{
    constructor(){
    }

    listen(){
        redisClient.sub(eventType.PLATFORM_DATA_CHANGE, this.platform_data_change.bind(this));
    }

    platform_data_change(msg){
        let type = msg.type;
        let value = msg.value;

        // logger.error('--------cache-------platform_data_change', type, value)

        switch (type){
            case redisKey.PLATFORM_DATA.PUMPWATER:
                let range_pump = platform_data_conf.PUMPWATER.RANGE;
                if(value >= range_pump[0] && value <= range_pump[1]){
                    cache.set(type, value);
                }
                else {
                    logger.error('非法平台抽水系数设置，请及时检查平台安全性');
                }

                break;
            case redisKey.PLATFORM_DATA.PLATFORM_CATCHRATE:
                let range_pcatch = platform_data_conf.PLATFORM_CATCHRATE.RANGE;
                if(value >= range_pcatch[0] && value <= range_pcatch[1]){
                    cache.set(type, value);
                }
                else {
                    logger.error('非法平台捕获率设置，请及时检查平台安全性');
                }
                break;
            case redisKey.PLATFORM_DATA.BONUSPOOL:
            case redisKey.PLATFORM_DATA.PUMPPOOL:
                cache.set(type, Math.max(0, value));
                break;
            case redisKey.PLAYER_CATCHRATE:
                let catchRate = value.catchRate;
                let uid = value.uid;
                let range_player = platform_data_conf.PLAYER_CATCHRATE.RANGE;
                if(catchRate >= range_player[0] && catchRate <= range_player[1]){
                    //TODO::
                    playerCatchRateEvent.emit(uid, catchRate);
                }
                else {
                    logger.error('玩家捕获率设置非法值，请及时检查平台安全性');
                }
                break;
        }
    }
}

module.exports = new Subscribe();