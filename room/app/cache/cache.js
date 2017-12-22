const redisKey = require('../utils/import_def').REDISKEY;
const redisAccountSync = require('../utils/import_utils').redisAccountSync;
const platform_data_conf = global.sysConfig.PLATFORM_DATA_CONF;

class Cache{
    constructor(){
        this._data = new Map();
    }

    async loadData(){

        let cmds = [];
        cmds.push(['GET', redisKey.PLATFORM_DATA.PUMPWATER]);
        cmds.push(['GET', redisKey.PLATFORM_DATA.PLATFORM_CATCHRATE]);
        cmds.push(['GET', redisKey.PLATFORM_DATA.BONUS_POOL]);
        cmds.push(['GET', redisKey.PLATFORM_DATA.PUMP_POOL]);

        try{
            let values = await redisAccountSync.multiAsync(cmds);

            if(values[0] == undefined || values[0] == null){
                this.set(redisKey.PLATFORM_DATA.PUMPWATER, 1);
            }
            else {
                let range = platform_data_conf.PUMPWATER.RANGE;
                let pumpWater_info = JSON.parse(values[0]); 
                let pump = pumpWater_info.pumpWater;
                if(pump >= range[0] && pump <= range[1]){
                    this.set(redisKey.PLATFORM_DATA.PUMPWATER, pump);
                }else {
                    logger.error('平台抽水系数异常, 请检查数据配置');
                }
            }


            if(values[1] == undefined || values[1] == null){
                this.set(redisKey.PLATFORM_DATA.PLATFORM_CATCHRATE, 1);
            }
            else {
                let range = platform_data_conf.PLATFORM_CATCHRATE.RANGE;
                if(values[1] >= range[0] && values[1] <= range[1]){
                    this.set(redisKey.PLATFORM_DATA.PLATFORM_CATCHRATE, values[1]);
                }else {
                    logger.error('平台捕获率异常, 请检查数据配置');
                }
            }


            this.set(redisKey.PLATFORM_DATA.BONUS_POOL, values[2] || 0);
            this.set(redisKey.PLATFORM_DATA.PUMP_POOL, values[3] || 0);

        }catch (err){
            logger.error('加载平台初始数据失败', err);
        }

    }

    get(key){
        return this._data.get(key);
    }

    set(key, value){
        this._data.set(key, value);
    }

}

module.exports = new Cache();