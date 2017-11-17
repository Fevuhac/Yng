const dataType = require('./dataType');
const cacheKey = require('./cacheKey');

class ShareData{
    constructor(){
       this._data = new Map();
    }

    //加载初始化数据
    load(){
        redisClient.cmd.get(cacheKey.PUMPWATER, function (err, dataValue) {
            if(err){
                return;
            }
            dataValue = dataValue || 1;
            this._data.set(dataType.PUMPWATER, Number(dataValue));
        }.bind(this));
    }
    set(type, data){
        this._data.set(type, data);
    }

    get(type){
        return this._data.get(type);
    }
}

module.exports = new ShareData();