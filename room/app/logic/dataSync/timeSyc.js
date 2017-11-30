const redisAccountSync = require('../../utils/import_utils').redisAccountSync;
const redisClient = require('../../utils/import_db').redisClient;
const redisKey = require('../../utils/import_def').REDISKEY;
const EventEmitter = require('events').EventEmitter;
const eventType = require('../../consts/eventType');

class TimeSync extends EventEmitter {
    constructor() {
        super();
        this._timer = null;
        this.cmds = [
            ['GET', redisKey.PLATFORM_DATA.BONUSPOOL],
            ['GET', redisKey.PLATFORM_DATA.PLATFORM_CATCHRATE]
        ]
    }

    start() {
        if (!this._timer) {
            this._timer = setInterval(this.sync.bind(this), 500);
        }
    }

    stop() {
        if (this._timer) {
            clearInterval(this._timer);
        }
    }

    async sync() {
        try {
            let values = await redisAccountSync.multiAsync(this.cmds);
            // logger.error('定时获取同步数据成功', values);

            if(values[0]){
                this.pub_value(redisKey.PLATFORM_DATA.BONUSPOOL, values[0]);
            }

            if(values[1]){
                this.pub_value(redisKey.PLATFORM_DATA.PLATFORM_CATCHRATE, values[1]);
            }
        }catch (err){
            logger.error('定时获取同步数据失败', err);
        }
    }

    pub_value(type, value) {
        this.emit(eventType.PLATFORM_DATA_CHANGE, type, value);
    }
}

module.exports = new TimeSync();