////////////////////////////////////////////////////////////
// Redis相关业务
////////////////////////////////////////////////////////////

//==========================================================
// Tool
//==========================================================
var events = require("events"),
    event = new events.EventEmitter();

var RedisUtil = require('../utils/RedisUtil');
var StringUtil = require('../utils/StringUtil');

//==========================================================
// Buzz
//==========================================================
var buzz_cst_game = require('./cst/buzz_cst_game');
var buzz_mail = require('./buzz_mail');
var buzz_chat = require('./buzz_chat');
var buzz_charts = require('./buzz_charts');

//==========================================================
// Cst
//==========================================================
var REDIS_KEYS = require('./cst/buzz_cst_redis_keys').REDIS_KEYS,
    CHANNEL = REDIS_KEYS.CHANNEL,
    PAIR = REDIS_KEYS.PAIR;

var EVENT = require('./cst/buzz_cst_event').EVENT;


//==============================================================================
// debug
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
var TAG = "【RedisUtil】";


event.on(EVENT.REDIS, function (data) {
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
exports.resetAllRedisAccount = resetAllRedisAccount;
exports.redisRegister = redisRegister;

//==========================================================
// implements
//==========================================================
/**
 * 添加事件处理器到RedisUtil中.
 */
function addListener() {
    const FUNC = TAG + "addListener() --- ";

    RedisUtil.addListener(event);

    // Channel: Broadcast
    RedisUtil.subscribe(CHANNEL.BROADCAST_SERVER);
    RedisUtil.subscribe(CHANNEL.BROADCAST_GAME_EVENT);
    RedisUtil.subscribe(CHANNEL.BROADCAST_FAMOUS_ONLINE);
    RedisUtil.subscribe(CHANNEL.BROADCAST_DRAW);
    RedisUtil.subscribe(CHANNEL.BROADCAST_REWARD_PEOPLE);

    // Channel: Mail
    RedisUtil.subscribe(CHANNEL.MAIL_SEND);
    RedisUtil.subscribe(CHANNEL.MAIL_RANK);
    RedisUtil.subscribe(CHANNEL.MAIL_RELOAD);

    //系统预警
    RedisUtil.subscribe("platform_early_warning");

    // Channel: Chat
    /*RedisUtil.subscribe(CHANNEL.WORLD_CHAT+":1");
    RedisUtil.subscribe(CHANNEL.WORLD_CHAT+":2");
    RedisUtil.subscribe(CHANNEL.PRIVATE_CHAT);*/

    // Channel: Chart
    for (var platform = 1; platform <= 2; platform++) {
        RedisUtil.subscribe(CHANNEL.CHART_GOLD + ":" + platform);
        RedisUtil.subscribe(CHANNEL.CHART_ACHIEVE + ":" + platform);
        RedisUtil.subscribe(CHANNEL.CHART_GODDESS + ":" + platform);
        RedisUtil.subscribe(CHANNEL.CHART_MATCH + ":" + platform);
        RedisUtil.subscribe(CHANNEL.CHART_AQUARIUM + ":" + platform);
        RedisUtil.subscribe(CHANNEL.CHART_CHARM + ":" + platform);
        RedisUtil.subscribe(CHANNEL.CHART_BP + ":" + platform);
        RedisUtil.subscribe(CHANNEL.CHART_FLOWER + ":" + platform);
    }
}

function setPool(myPool) {
    pool = myPool;
}

let callbacks = {
    platform_early_warning: {
        lock: false
    },
    
};

function redisRegister(event) {
    return callbacks[event];
}

/**
 * 处理频道消息.
 */
function handleChannelMessage(data) {
    const FUNC = TAG + "handleChannelMessage() --- ";

    if (DEBUG) console.log(FUNC + 'data:', data);
    var channel = data.channel;
    var message = data.message;

    switch (channel) {
        // Channel: Broadcast
        case CHANNEL.BROADCAST_SERVER:
        case CHANNEL.BROADCAST_GAME_EVENT:
        case CHANNEL.BROADCAST_FAMOUS_ONLINE:
        case CHANNEL.BROADCAST_DRAW:
        case CHANNEL.BROADCAST_REWARD_PEOPLE:
            buzz_cst_game.redisNotifyBroadcast(channel, message);
            break;

        // Channel: Mail
        case CHANNEL.MAIL_SEND:
        case CHANNEL.MAIL_RANK:
            buzz_mail.redisNotifyMail(channel, message);
            break;
        case CHANNEL.MAIL_RELOAD:
            buzz_mail.reloadMail(pool, channel, message);
            break;

        //预警关闭服务器
        case 'platform_early_warning':
            callbacks['platform_early_warning'] = JSON.parse(message);
            break;

        //Channel: Chat
        /*case CHANNEL.WORLD_CHAT+":1":
        case CHANNEL.WORLD_CHAT+":2":
            buzz_chat.worldChat(channel,message);
            break;*/
        /*case CHANNEL.PRIVATE_CHAT:
            buzz_chat.privateChat(channel, message);
            break;*/

        //Channel: Chart
        case CHANNEL.CHART_GOLD + ":1":
        case CHANNEL.CHART_ACHIEVE + ":1":
        case CHANNEL.CHART_GODDESS + ":1":
        case CHANNEL.CHART_MATCH + ":1":
        case CHANNEL.CHART_AQUARIUM + ":1":
        case CHANNEL.CHART_CHARM + ":1":
        case CHANNEL.CHART_BP + ":1":
        case CHANNEL.CHART_FLOWER + ":1":

        case CHANNEL.CHART_GOLD + ":2":
        case CHANNEL.CHART_ACHIEVE + ":2":
        case CHANNEL.CHART_GODDESS + ":2":
        case CHANNEL.CHART_MATCH + ":2":
        case CHANNEL.CHART_AQUARIUM + ":2":
        case CHANNEL.CHART_CHARM + ":2":
        case CHANNEL.CHART_BP + ":2":
        case CHANNEL.CHART_FLOWER + ":2":
            buzz_charts.resetCharts(channel, message);
            break;
    }
}

/**
 * 每日重置玩家数据(现存在Redis中的所有玩家)
 */
function resetAllRedisAccount() {
    // 方法一:
    // 删除所有需要重置的hash表, 然后创建一个空表
    // 玩家从Redis中读取到相应的值为null时将会使用默认值
    RedisUtil.del(PAIR.UID_DAY_REWARD);//1
    RedisUtil.del(PAIR.UID_FIRST_LOGIN);//1
    RedisUtil.del(PAIR.UID_VIP_DAILY_FILL);//1
    RedisUtil.del(PAIR.UID_BROKE_TIMES);//0
    // TODO: redis: level_mission
    // RedisUtil.del(PAIR.UID_LEVEL_MISSION);//{}

    RedisUtil.del(PAIR.UID_MISSION_DAILY);//{}
    RedisUtil.del(PAIR.UID_HEARTBEAT);//1
    RedisUtil.del(PAIR.UID_HEARTBEAT_MIN_COST);//0
    RedisUtil.del(PAIR.UID_GOLD_SHOPPING);//0
    RedisUtil.del(PAIR.UID_DROP_RESET);//{}
    RedisUtil.del(PAIR.UID_COMEBACK);//{}

    RedisUtil.del(PAIR.UID_ACTIVE_DAILY);//{}
    RedisUtil.del(PAIR.UID_ACTIVE_STAT_RESET);//{}
    RedisUtil.del(PAIR.UID_DRAW_FREE);//JSON.parse(buzz_draw.getFreeDrawResetString())
    RedisUtil.del(PAIR.UID_DRAW_TOTAL);//JSON.parse(buzz_draw.getTotalDrawResetString())
    RedisUtil.del(PAIR.UID_CARD_GET);//{normal:false,senior:false}
    RedisUtil.del(PAIR.UID_GODDESS_CTIMES);//0

    // 兼容处理, 新的负载服Redis重置键
    RedisUtil.del('pair:uid:mission_daily_reset');//{}
    RedisUtil.del('pair:uid:heartbeat_min_cost');//{}
    RedisUtil.del('pair:uid:drop_reset');//{}
    RedisUtil.del('pair:uid:active_daily_reset');//{}
    RedisUtil.del('pair:uid:active_stat_reset');//{}
    RedisUtil.del('pair:uid:free_draw');//JSON.parse(buzz_draw.getFreeDrawResetString())
    RedisUtil.del('pair:uid:total_draw');//JSON.parse(buzz_draw.getTotalDrawResetString())
    RedisUtil.del('pair:uid:get_card');//{normal:false,senior:false}
    RedisUtil.del('pair:uid:goddess_ctimes');//0
    // 每日分享重置
    RedisUtil.del("pair:uid:social_share_status_1");
    // VIP每日奖励重置
    RedisUtil.del("pair:uid:vip_daily_reward");

    // 以下是条件设置(使用HSCAN)
    var count_ret = 0;
    var start_time = new Date().getTime();
    RedisUtil.repeatHscan(PAIR.UID_GODDESS_FREE, 0, 1000,
        function op(res, nextCursor) {
            var account_list = res[1];
            for (var i = 0; i < account_list.length; i += 2) {
                var uid = account_list[i];
                resetGoddess(uid);
            }
            count_ret += account_list.length / 2;
            nextCursor();
        },
        function next() {
            var past_time = (new Date().getTime() - start_time) / 1000;
            console.log("全部遍历完毕");
            console.log("遍历元素个数:", count_ret);
            console.log("遍历元素耗时:%d秒", past_time);
        }
    );

    RedisUtil.repeatHscan('pair:uid:goddess_free', 0, 1000,
        function op(res, nextCursor) {
            var account_list = res[1];
            for (var i = 0; i < account_list.length; i += 2) {
                var uid = account_list[i];
                resetGoddessNew(uid);
            }
            count_ret += account_list.length / 2;
            nextCursor();
        },
        function next() {
            var past_time = (new Date().getTime() - start_time) / 1000;
            console.log("全部遍历完毕");
            console.log("遍历元素个数:", count_ret);
            console.log("遍历元素耗时:%d秒", past_time);
        }
    );

    /**
     * 重置一个玩家的goddess_free和goddess_crossover
     */
    function resetGoddess(uid) {
        // 老的重置方法(所有玩家全部转移后去除)
        RedisUtil.hget(PAIR.UID_GODDESS_ONGOING, uid, function (err, goddess_ongoing) {
            if (goddess_ongoing == 0) {
                RedisUtil.hset(PAIR.UID_GODDESS_FREE, uid, 1);
            }
        });
        RedisUtil.hincr(PAIR.UID_GODDESS_CROSSOVER, uid);
    }

    /**
     * 重置一个玩家的goddess_free和goddess_crossover
     */
    function resetGoddessNew(uid) {
        // 新的重置方法
        RedisUtil.hget('pair:uid:goddess_ongoing', uid, function (err, goddess_ongoing) {
            if (goddess_ongoing == 0) {
                RedisUtil.hset('pair:uid:goddess_free', uid, 1);
            }
        });
        RedisUtil.hincr('pair:uid:goddess_crossover', uid);
    }
}
