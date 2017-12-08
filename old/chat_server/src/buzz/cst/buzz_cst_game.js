//==============================================================================
// import
//==============================================================================
var CryptoJS = require("crypto-js");
var StringUtil = require("../../utils/StringUtil");
var RedisUtil = require("../../utils/RedisUtil");
var ObjUtil = require("../ObjUtil");
var TimeQueue = ObjUtil.TimeQueue;
var Broadcast = ObjUtil.Broadcast;

//==============================================================================
// CST
//==============================================================================
var REDIS_KEYS = require("../../buzz/cst/buzz_cst_redis_keys").REDIS_KEYS;
var CHANNEL = REDIS_KEYS.CHANNEL;


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

/**
 * 场景常量
 */
var _scene = {
    LOGIN:          1,  //登录界面
    MODE_SELECTING: 2,  //模式选择界面
    GAME_FIGHTING:  3,  //游戏战斗场景
    STORE:          4,  //商城
    MINI_GAME:      5,  //小游戏
    BROKE_GAIN:     6,  //破产领取
    ALL:            7,   //所有场景
    WEAPON_UNLOCK:  8,  //武器解锁
    SKILL_BUY:      9,  //技能购买
    CHAPTER_BUY:    10, //奖金领取
    BONUS:          11, //奖金领取
    GOLDFISH_GAIN:  11, //奖金领取
    DAILY_GAIN :    12, //--日常任务领取 
    ACHIEVE_GAIN :  13, //--成就任务领取 
    PIRATE_GAIN :   14, //--海盗任务领取 
    FIGHT_DROP :    15, //--捕鱼掉落 
    VIPGIFT_BUY :   16, //--VIP礼包购买 
    TIMEGIFT_BUY :  17, //--商城限时礼包 
    GOLD_BUY :      18, //--商城金币购买 
    WEAPON_SKIN_BUY:19, //武器皮肤购买
    SKIN_BUY :      19, //武器皮肤购买
    CIK :           20, //实物兑换获取
    OPEN_BOX :      21, //排位赛开宝箱获取
    DROP :          22, //掉落获取
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
};

var PLATFORM = {
    ANDROID: 1,
    IOS: 2,
};

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getDataObj = getDataObj;
exports.getResData = getResData;
exports.game = _game;
exports.scene = _scene;
exports.GAME_EVENT_TYPE = GAME_EVENT_TYPE;
exports.FAMOUS_ONLINE_TYPE = FAMOUS_ONLINE_TYPE;
exports.PLATFORM = PLATFORM;

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
        dataObj = JSON.parse(str_data);
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