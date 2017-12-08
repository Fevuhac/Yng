//==============================================================================
// import
//==============================================================================
var CryptoJS = require("crypto-js");
var StringUtil = require("../../utils/StringUtil");
var RedisUtil = require("../../utils/RedisUtil");
var ObjUtil = require("../ObjUtil");
var TimeQueue = ObjUtil.TimeQueue;
var Broadcast = ObjUtil.Broadcast;

var AccountCommon = require("../../dao/account/common");
var CacheOperation = require("../../buzz/cache/CacheOperation");
var CacheAccount = require("../../buzz/cache/CacheAccount");

//==============================================================================
// CST
//==============================================================================
const REDIS_KEYS = require("../../buzz/cst/buzz_cst_redis_keys").REDIS_KEYS,
    CHANNEL = REDIS_KEYS.CHANNEL,
    GLOBAL_SWITCH = REDIS_KEYS.GLOBAL.SWITCH;


//==============================================================================
// DEBUG
//==============================================================================
var DEBUG = 0;
var ERROR = 1;

var TAG = "【buzz_cst_game】";

/**
 * 游戏常量(加密key, 服务器版本)
 */
var _game = {
    key: "THIS_IS_A_TEST_KEY1029384756",
    version: "0.0.1",
};

var BROADCAST_TYPE = {
    SERVER:         1,
    GAME_EVENT:     2,
    FAMOUS_ONLINE:  3,
    DRAW:           4,
};

var GAME_EVENT_TYPE = {
    BOSS_KILL:      1,
    WEAPON_UPGRADE: 2,
    SKIN_GOT:       3,
    TOOL_GOT:       4,
    GOLDFISH_DRAW:  5,
    GODDESS_UNLOCK: 6,
    GODDESS_UPGRADE:7,
    GODDESS_CHALLENGE:8,
    DRAW_REWARD:9,
    VICTORS:10,
    REWARD_PEOPLE:  11,
};

var FAMOUS_ONLINE_TYPE = {
    GOLD: 1,
    ACHIEVE: 2,
    COMPETITION: 3,
    CHARM:4   //万人迷
};

var PLATFORM = {
    ANDROID: 1,
    IOS: 2,
};

//==============================================================================
// variable
//==============================================================================
var broadcast_server = null;// 初始化的服务器公告为空
// android和ios分离
var broadcast_gameevent_android = new TimeQueue(5000, 60000, 10, 500);
var broadcast_famousonline_android = new TimeQueue(5000, 60000, 3, 10);
var broadcast_draw_android = new TimeQueue(5000, 100000000, 20, 100);
var broadcast_rewardpeople_android = new TimeQueue(5000,6000,1,100);

var broadcast_gameevent_ios = new TimeQueue(5000, 60000, 10, 500);
var broadcast_famousonline_ios = new TimeQueue(5000, 60000, 3, 10);
var broadcast_draw_ios = new TimeQueue(5000, 100000000, 20, 100);
var broadcast_rewardpeople_ios = new TimeQueue(5000,6000,1,100);


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getDataObj = getDataObj;
exports.getResData = getResData;
exports.game = _game;
exports.GAME_EVENT_TYPE = GAME_EVENT_TYPE;
exports.FAMOUS_ONLINE_TYPE = FAMOUS_ONLINE_TYPE;
exports.PLATFORM = PLATFORM;

exports.getBroadcast = getBroadcast;
exports.setBroadcast = setBroadcast;
exports.addBroadcastGameEvent = addBroadcastGameEvent;
exports.addBroadcastFamousOnline = addBroadcastFamousOnline;
exports.addBroadcastDraw = addBroadcastDraw;
exports.addBroadcastRewardPeople = addBroadcastRewardPeople;

exports.redisNotifyBroadcast = redisNotifyBroadcast;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 返回三种公告对象
 */
function getBroadcast(dataObj, cb) {
    const FUNC = TAG + "getBroadcast() --- ";

    var lServer = _getBroadcastServer(dataObj.server);
    var lGameEvent = _getBroadcastGameEvent(dataObj.gameevent, dataObj.platform);
    var lFamousOnline = _getBroadcastFamousOnline(dataObj.famousonline, dataObj.platform);
    var lDraw = _getBroadcastDraw(dataObj.draw, dataObj.platform);
    var lRewardPeople = _getBroadcastRewardPeople(dataObj.rewardpeople, dataObj.platform);

    var token = dataObj.token;
    var cik_on = 0;
    if (token != null) {
        var uid = token.split('_')[0];
        CacheAccount.getAccountById(uid, function (err, account) {
            RedisUtil.get(GLOBAL_SWITCH.CIK, function(err, res) {
                if (err) return cb && cb(err);
                if (null == res) {
                    res = 1;
                }
                var switch_cik = parseInt(res);
                if (account != null) {
                    var account_cik_on = account.cik_on;
                    if (DEBUG) console.log(FUNC + "switch_cik:", switch_cik);
                    if (DEBUG) console.log(FUNC + "account_cik_on:", account_cik_on);
                    cik_on = switch_cik && account_cik_on;
    
                    cb && cb(null, {
                        server: lServer,
                        gameevent: lGameEvent,
                        famousonline: lFamousOnline,
                        draw: lDraw,
                        cik_on: cik_on,
                        rewardpeople:lRewardPeople
                    });
    
                }
            });
        });

    }


}

function setBroadcast(dataObj, req) {
    const FUNC = TAG + "setBroadcast() --- ";

    var token = dataObj.token;
    var broadcastType = dataObj.type;
    if (DEBUG) console.log(FUNC + 'broadcastType: ', broadcastType);
    if (DEBUG) console.log(FUNC + 'content: ', dataObj.content);
    if (DEBUG) console.log(FUNC + '1-platform: ', dataObj.platform);
    if (DEBUG) console.log(FUNC + 'content_type: ', dataObj.content.type);

    // broadcastType为空(默认为系统公告), 或为SERVER
    if (BROADCAST_TYPE.SERVER == broadcastType || !broadcastType) {
        _setBroadcastServer(dataObj.content);
    }
    else if (BROADCAST_TYPE.GAME_EVENT == broadcastType
        && dataObj.content
        && GAME_EVENT_TYPE.VICTORS == dataObj.content.type) {
        console.log(FUNC + "连胜公告, 直接由房间服务器发送, 无需token");
        _setBroadcastGameEvent(dataObj.content);
    }
    else {
        // TODO: 验证token
        req.dao.getAccountByToken(token, function (err, results) {
            if (err) {
                if (ERROR) console.error("buzz_cst_game.setBroadcast(): 使用token查询账户出现数据库错误");
                //cb();
                return;
            }
            if (results.length == 0) {
                if (ERROR) console.error("buzz_cst_game.setBroadcast(): 使用token查询账户不存在");
                //cb();
                return;
            }
            var result = results[0];

            // 公告需要在Android和iOS分离
            // var platform = result.platform;
            dataObj.content.platform = result.platform;
            
            if (DEBUG) console.log(FUNC + '2-platform: ', result.platform);
            if (DEBUG) console.log('账户' + result.id + '发出了广播消息');

            if (BROADCAST_TYPE.GAME_EVENT == broadcastType) {
                _setBroadcastGameEvent(dataObj.content);
            }
            else if (BROADCAST_TYPE.FAMOUS_ONLINE == broadcastType) {
                _setBroadcastFamousOnline(dataObj.content);
            }
            else if (BROADCAST_TYPE.DRAW == broadcastType) {
                _setBroadcastDraw(dataObj.content);
            }
        });
    }
}

function addBroadcastGameEvent(content) {
    _setBroadcastGameEvent(content);
}

function addBroadcastFamousOnline(content) {
    _setBroadcastFamousOnline(content);
}

function addBroadcastDraw(content) {
    _setBroadcastDraw(content);
}

function addBroadcastRewardPeople(content) {
    _setBroadcastRewardPeople(content);
}

//==============================================================================
// 以下的aes为布尔型变量，表示是否对数据进行加密
// 是否加密由客户端决定, 上传数据选择了加密则返回数据也会是加密形式
//==============================================================================

//----------------------------------------------------------
// 公告系统
//----------------------------------------------------------
// GET
// DONE: 只取客户端时间戳之后的数据
function _getBroadcastServer(timestamp) {
    // 服务器公告本身不为空的时候才进行下面的逻辑
    if (broadcast_server) {
        if (!timestamp || timestamp < broadcast_server.timestamp) {
            return broadcast_server;
        }
    }
    return null;
}

function _getBroadcastGameEvent(timestamp, platform) {
    switch(platform) {
        case PLATFORM.IOS:
            return broadcast_gameevent_ios.getRecent(timestamp);
        default:
            return broadcast_gameevent_android.getRecent(timestamp);
    }
}

function _getBroadcastFamousOnline(timestamp, platform) {
    switch(platform) {
        case PLATFORM.IOS:
            return broadcast_famousonline_ios.getRecent(timestamp);
        default:
            return broadcast_famousonline_android.getRecent(timestamp);
    }
}

function _getBroadcastDraw(timestamp, platform) {
    switch(platform) {
        case PLATFORM.IOS:
            return broadcast_draw_ios.getRecent(timestamp);
        default:
            return broadcast_draw_android.getRecent(timestamp);
    }
}

function _getBroadcastRewardPeople(timestamp, platform) {
    switch(platform) {
        case PLATFORM.IOS:
            return broadcast_rewardpeople_ios.getRecent(timestamp);
        default:
            return broadcast_rewardpeople_android.getRecent(timestamp);
    }
}

/**
 * Redis收到公告后通知到对应的变量
 */
function redisNotifyBroadcast(channel, message) {
    const FUNC = TAG + "redisNotifyBroadcast() --- ";

    message = JSON.parse(message);
    switch(channel) {
        case CHANNEL.BROADCAST_SERVER:
            broadcast_server = message;
            break;

        case CHANNEL.BROADCAST_GAME_EVENT:
        case CHANNEL.BROADCAST_FAMOUS_ONLINE:
        case CHANNEL.BROADCAST_DRAW:
        case CHANNEL.BROADCAST_REWARD_PEOPLE:
            var broadcast = new Broadcast(message.timestamp, message.content);
            var platform = message.content.platform;
            var broadcastQueue = getBroadcastQueue(channel, platform);
            broadcastQueue && broadcastQueue.push(broadcast);
            if (!broadcastQueue) {
                if (ERROR) console.error(FUNC + "channel:", channel);
                if (ERROR) console.error(FUNC + "platform:", platform);
            }
            break;
    }
}

function getBroadcastQueue(channel, platform) {
    if (CHANNEL.BROADCAST_GAME_EVENT == channel)
    switch (platform) {
        case PLATFORM.IOS:
            return broadcast_gameevent_ios;
        default:
            return broadcast_gameevent_android;
    }

    if (CHANNEL.BROADCAST_FAMOUS_ONLINE == channel)
    switch (platform) {
        case PLATFORM.IOS:
            return broadcast_famousonline_ios;
        default:
            return broadcast_famousonline_android;
    }

    if (CHANNEL.BROADCAST_DRAW == channel)
    switch (platform) {
        case PLATFORM.IOS:
            return broadcast_draw_ios;
        default:
            return broadcast_draw_android;
    }

    if (CHANNEL.BROADCAST_REWARD_PEOPLE == channel)
        switch (platform) {
            case PLATFORM.IOS:
                return broadcast_rewardpeople_ios;
            default:
                return broadcast_rewardpeople_android;
        }
}


// SET
function _setBroadcastServer(new_broadcast) {
    const FUNC = TAG + "_setBroadcastServer() --- ";
    if (DEBUG) console.info(FUNC + "CALL...");

    new_broadcast.times = parseInt(new_broadcast.times);

    var value = {
        content: new_broadcast,
        timestamp: _timestamp(),
    };
    var message = JSON.stringify(value);

    RedisUtil.publish(CHANNEL.BROADCAST_SERVER, message);
}

function _setBroadcastGameEvent(new_broadcast) {
    const FUNC = TAG + "_setBroadcastGameEvent() --- ";
    if (DEBUG) console.info(FUNC + "CALL...");
    if (DEBUG) console.info(FUNC + "platform:", new_broadcast.platform);

    // new_broadcast: {platform:?...}
    var value = {
        content: new_broadcast,
        timestamp: _timestamp(),
    };
    var message = JSON.stringify(value);

    RedisUtil.publish(CHANNEL.BROADCAST_GAME_EVENT, message);

}

function _setBroadcastFamousOnline(new_broadcast) {
    const FUNC = TAG + "_setBroadcastFamousOnline() --- ";
    if (DEBUG) console.info(FUNC + "CALL...");
    if (DEBUG) console.info(FUNC + "platform:", new_broadcast.platform);

    // new_broadcast: {platform:?...}
    var value = {
        content: new_broadcast,
        timestamp: _timestamp(),
    };
    var message = JSON.stringify(value);

    RedisUtil.publish(CHANNEL.BROADCAST_FAMOUS_ONLINE, message);
}

function _setBroadcastDraw(new_broadcast) {
    const FUNC = TAG + "_setBroadcastDraw() --- ";
    if (DEBUG) console.info(FUNC + "CALL...");
    if (DEBUG) console.info(FUNC + "platform:", new_broadcast.platform);

    var value = {
        content: new_broadcast,
        timestamp: _timestamp(),
    };
    var message = JSON.stringify(value);

    RedisUtil.publish(CHANNEL.BROADCAST_DRAW, message);
}

function _setBroadcastRewardPeople(new_broadcast) {
    const FUNC = TAG + "_setBroadcastRewardPeople() --- ";
    if (DEBUG) console.info(FUNC + "CALL...");
    if (DEBUG) console.info(FUNC + "platform:", new_broadcast.platform);
    var value = {
        content: new_broadcast,
        timestamp: _timestamp(),
    };
    var message = JSON.stringify(value);

    RedisUtil.publish(CHANNEL.BROADCAST_REWARD_PEOPLE, message);
}


function _timestamp() {
    //return Date.parse(new Date());// 毫秒改成000显示
    return (new Date()).valueOf();
    //return new Date().getTime();
}
//----------------------------------------------------------

/**
 * 从客户端上传数据(经过加密的字符串)获取数据对象(json格式).
 * @throw err SyntaxError: Unexpected end of input
 */
function getDataObj(str_data, aes) {
    if (DEBUG) console.log("原始数据: " + str_data);
    var dataObj = {};
    if (aes == true || aes == "true") {
        var bytes = CryptoJS.AES.decrypt(str_data, _game.key);
        var str_data = bytes.toString(CryptoJS.enc.Utf8);
        if (DEBUG) console.log("decode aes: " + str_data);
    }
    try {
        if(typeof str_data == 'object'){
            dataObj = str_data;
        }else{
            dataObj = JSON.parse(str_data);
        }

    }
    catch (err) {
        throw err;
    }
    return dataObj;
}

/**
 * 将返回对象转换为字符串后进行加密处理返回给客户端.
 */
function getResData(json_data, aes) {
    if (DEBUG) console.log("aes: " + aes);
    if (aes == true || aes == "true") {
        if (DEBUG) console.log("加密");
        return CryptoJS.AES.encrypt(JSON.stringify(json_data), _game.key).toString();
    }
    else {
        if (DEBUG) console.log("不加密");
        return json_data;
    }
}