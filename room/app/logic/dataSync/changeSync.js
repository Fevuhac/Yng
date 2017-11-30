const redisClient = require('../../utils/import_db').redisClient;
const redisKey = require('../../utils/import_def').REDISKEY;
const EventEmitter = require('events').EventEmitter;
const eventType = require('../../consts/eventType');

class ChangeSync extends EventEmitter{
    constructor(){
        super();
    }

    start(){
        redisClient.sub(redisKey.DATA_EVENT_SYNC.PLATFORM_CATCHRATE, this.platform_catchrate.bind(this));
        redisClient.sub(redisKey.DATA_EVENT_SYNC.PLAYER_CATCHRATE, this.player_catchrate.bind(this));
    }

    platform_catchrate(value){
        this.pub_value(redisKey.PLATFORM_DATA.PLATFORM_CATCHRATE, value);
    }

    player_catchrate(value){
        this.pub_value(redisKey.PLAYER_CATCHRATE, value);
    }

    pub_value(type, value){
        this.emit(eventType.PLATFORM_DATA_CHANGE, type, value);
    }
}

module.exports = new ChangeSync();