const redisKey = require('./consts/redisKey');
const RedisUtil = require('../utils/RedisUtil');
class Cache{
    constructor(){
        this._data = new Map();
    }

    async loadData(){
        let cmds = [];
        cmds.push(['GET', redisKey.PLATFORM_DATA.BONUSPOOL]);
        cmds.push(['GET', redisKey.PLATFORM_DATA.PUMPPOOL]);
        RedisUtil.getClient().multi(cmds).exec(function (err, values) {
            if(err){
                console.error('奖池数据异常', err);
            }else{
                this.set(redisKey.PLATFORM_DATA.BONUSPOOL, parseFloat(values[0] || 0));
                this.set(redisKey.PLATFORM_DATA.PUMPPOOL, parseFloat(values[1] || 0));
            }
        }.bind(this));
    }

    get(key){
        return this._data.get(key);
    }

    set(key, value){
        this._data.set(key, value);
    }

}

module.exports = new Cache();