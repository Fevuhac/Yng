const cache = require('./cache');
const redisKey = require('../utils/import_def').REDISKEY;

class CacheReader{
    constructor(){
       this._data = new Map();
    }

    //读取平台抽水系数
    get pumpwater(){
        return cache.get(redisKey.PLATFORM_DATA.PUMPWATER);
    }

    //读取平台捕获率
    get platformCatchRate(){
        return cache.get(redisKey.PLATFORM_DATA.PLATFORM_CATCHRATE);
    }

    //读取平台奖金池
    get bonuspool(){
        return cache.get(redisKey.PLATFORM_DATA.BONUSPOOL);
    }

    


}

module.exports = new CacheReader();