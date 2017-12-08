////////////////////////////////////////////////////////////
// Redis相关业务
////////////////////////////////////////////////////////////

//==========================================================
// Tool
//==========================================================
var events = require("events"),
    event = new events.EventEmitter();

var RedisUtil = require('../utils/RedisUtil');

//==========================================================
// Buzz
//==========================================================
var buzz_chat = require('./buzz_chat');

//==========================================================
// Cst
//==========================================================
var REDIS_KEYS = require('./cst/buzz_cst_redis_keys').REDIS_KEYS,
    CHANNEL = REDIS_KEYS.CHANNEL;

var EVENT = require('./cst/buzz_cst_event').EVENT;


//==============================================================================
// debug
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
var TAG = "【RedisUtil】";


event.on(EVENT.REDIS, function(data) {
    const FUNC = TAG + "eventOn() --- ";

	if (DEBUG) console.log(FUNC + EVENT.REDIS + '事件触发');
    handleChannelMessage(data);
});

var pool = null;

//==========================================================
// exports
//==========================================================
exports.addListener = addListener;
exports.setPool = setPool;


//==========================================================
// implements
//==========================================================
/**
 * 添加事件处理器到RedisUtil中.
 */
function addListener() {
    const FUNC = TAG + "addListener() --- ";

    RedisUtil.addListener(event);

    // Channel: Chat
    RedisUtil.subscribe(CHANNEL.WORLD_CHAT+":1");
    RedisUtil.subscribe(CHANNEL.WORLD_CHAT+":2");
    RedisUtil.subscribe(CHANNEL.PRIVATE_CHAT);

}

function setPool(myPool) {
    pool = myPool;
}

/**
 * 处理频道消息.
 */
function handleChannelMessage(data) {
    const FUNC = TAG + "handleChannelMessage() --- ";

	if (DEBUG) console.log(FUNC + 'data:', data);
    var channel = data.channel;
    var message = data.message;
    
    switch(channel) {

        //Channel: Chat
        case CHANNEL.WORLD_CHAT+":1":
        case CHANNEL.WORLD_CHAT+":2":
            buzz_chat.worldChat(channel,message);
            break;
        case CHANNEL.PRIVATE_CHAT:
            buzz_chat.privateChat(channel, message);
            break;

    }

}