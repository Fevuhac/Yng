////////////////////////////////////////////////////////////
// Activity Related
////////////////////////////////////////////////////////////
var utils = require('../buzz/utils');
var ErrCst = require('../buzz/cst/buzz_cst_error');
var StringUtil = require('../utils/StringUtil');
var DateUtil = require('../utils/DateUtil');
var ObjUtil = require('../buzz/ObjUtil');
var buzz_draw = require('../buzz/buzz_draw');
var Reward = require('../buzz/pojo/Reward');
var BuzzUtil = require('../utils/BuzzUtil');

var DaoUtil = require('./dao_utils');
var DaoCommon = require('./dao_common');
var DaoReward = require('./dao_reward');
var dao_gold = require('./dao_gold');
var DaoAccountCommon = require('./account/common');
var AccountUpdateActive = require('./account/update/active');

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------
var CacheLink = require('../buzz/cache/CacheLink');
var CacheAccount = require('../buzz/cache/CacheAccount');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var api_map = require('../../routes/api_map');
var shop_gift_cfg = require('../../cfgs/shop_gift_cfg');
var item_item_cfg = require('../../cfgs/item_item_cfg');
var active_active_cfg = require('../../cfgs/active_active_cfg');
var active_activequest_cfg = require('../../cfgs/active_activequest_cfg');
var active_activechange_cfg = require('../../cfgs/active_activechange_cfg');
var common_log_const_cfg = require('../../cfgs/common_log_const_cfg');
let _utils = require('../utils/utils');

//==============================================================================
// const
//==============================================================================
var ERROR = 1;
var DEBUG = 0;

var ERROR_CODE = ErrCst.ERROR_CODE;
var ERROR_OBJ = ErrCst.ERROR_OBJ;

var ACTIVITY_TYPE = {
    /** 活动任务 */
    QUEST: 1,
    /** 充值回馈 */
    CHARGE: 2,
    /** 限时兑换 */
    EXCHANGE: 3,
    /** 幸运大奖 */
    DRAW: 4,
    /** 所有 */
    ALL: 9,
    EMPTY: 10,
};
exports.ACTIVITY_TYPE = ACTIVITY_TYPE;

var TaskType = {
    NONE : 0,
    CATCH_FISH : 1,          //捕获x鱼y条，如果x为0则为任意鱼
    USE_SKILL : 2,           //使用x技能y次，如果x为0则为任意技能
    UPDATE_USER_LV : 3,      //角色等级x级
    UPDATE_WEAPON_LV : 4,    //解锁炮台x倍
    USE_FISH_CATCH_FISH : 5, //利用x鱼炸死y条其他鱼
    GET_WEAPON_SKIN : 6,     //获得炮台皮肤x个
    ONE_CATCH_FISH : 7,      //单次开炮捕获鱼x条
    ONE_GET_GOLD : 8,        //单次开炮获得金币x
    GET_GOLD : 9,            //累计获得金币x           
    USE_DIAMOND : 10,        //累计消耗钻石x
    USE_GOLD : 11,           //累计消耗金币x
    SHARE_TIMES : 12,        //分享x次
    CONTINUE_LOGIN : 13,     //累计登录x天
    GET_RANK_LV : 14,        //获得排位x阶段位y次
    GET_VIP_LV : 15,         //成为VIPx
    GET_DRAGON_STAR : 16,    //达成龙宫x星y次
    GET_ACHIEVE_POINT : 17,  //获得x点成就点
    GOLD_TIMES : 18 , //金币次数
    CHARG_PEARL : 19, //充值珍珠
    DEFEND_GODDESS : 20, //保卫女神
    STOCKING_FISH : 21, //放养鱼
    GODDESS_LEVEL : 22, //女神最高闯关
    PETFISH_TOTAL_LEVEL : 23, //宠物鱼等级和
    UNLOCK_GODDESS : 24, //解锁女神
    PLAY_LITTLE_GAME : 25, //x小游戏中获得y分
    MAX : 26,//最后一个，暂时取消掉了
};
exports.TaskType = TaskType;

var TAG = "【dao_activity】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.updateGift = updateGift;
exports.addNewGift = addNewGift;
exports.showMeActivity = showMeActivity;
exports.getReward = getReward;
exports.getCurActiveIds = _getCurActiveIds;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 添加一个礼包
 */
function addNewGift(gift_tobe_insert, pool, cb) {
    const FUNC = TAG + "addNewGift() --- ";
    var sql = '';
    sql += 'INSERT INTO `tbl_activity` ';
    sql += '(`gift_id`, `description`, `name`, `icon`, `price`, `item`, `condition`, `value`, `starttime`, `endtime`, `buycount`, `version`, `revoke`, `discount`) ';
    sql += 'VALUES ';
    for (var i = 0; i < gift_tobe_insert.length; i++) {
        var gift = gift_tobe_insert[i];
        if (i > 0) {
            sql += ",";
        }
        sql += "(";
        sql += gift['id'] + ",";
        sql += "'" + gift['description'] + "',";
        sql += "'" + gift['name'] + "',";
        sql += "'" + gift['icon'] + "',";
        sql += gift['price'] + ",";
        sql += "'" + JSON.stringify(gift['item']) + "',";
        sql += gift['condition'] + ",";
        sql += gift['value'] + ",";
        sql += "'" + gift['starttime'] + "',";
        sql += "'" + gift['endtime'] + "',";
        sql += gift['buycount'] + ",";
        sql += gift['version'] + ",";
        sql += gift['revoke'] + ",";
        sql += gift['discount'];
        sql += ')';
    }
    var sql_data = [];
    
    if (DEBUG) console.log(FUNC + 'sql:', sql);
    if (DEBUG) console.log(FUNC + 'sql_data:', sql_data);
    
    pool.query(sql, sql_data, function (err, results) {
        if (err) {
            if (ERROR) console.error(FUNC + "[ERROR] err:", err);
            cb(err);
        }
        else {
            var affectedRows = results['affectedRows'];
            if (DEBUG) console.log(FUNC + "插入成功！！！共更新了" + affectedRows + "条礼包数据");
        }
    });
}

/**
 * 更新礼包数据(直接从配置表shop_gift_cfg.js中读取数据插入数据库, 无需数据传入)
 * 重启服务器时调用.
 */
function updateGift(pool, cb) {
    
    // step-1: 查询活动礼包的历史数据
    _findGiftHistory(pool, cb, function (gift_history) {
        
        // step-2: 找出所有出现更新的数据
        _findNewGift(gift_history, function (gift_tobe_insert) {
            
            // step-3: 添加新的礼包数据
            addNewGift(gift_tobe_insert, pool, cb);

        });

    });

}

/**
 * 返回当前活动数据.
 * 活动分类为(1.活动任务, 2.充值回馈， 3.限时兑换).
 */
function showMeActivity(pool, data, cb) {
    if (!_checkParams_4_ShowMeActivity(data, cb)) return;
    BuzzUtil.cacheLinkDataApi(data, "show_me_activity");

    var token = data.token;
    var type = data.type;
    var extend = data.extend;

    DaoCommon.checkAccount(pool, token, function (error, account) {
        if (error) {
            cb(error);
            return;
        }
        if (account == null) {
            cb(ERROR_OBJ.TOKEN_INVALID);
            return;
        }
        var uid = account.id;
        var cur_active_ids = _getCurActiveIds();
        
        // TODO: 如果没有当前活动则不计算剩余时间
        var endtime = 0;
        if (cur_active_ids.length > 0) {
            endtime = _getActiveEndTime(cur_active_ids[0]);
        }
        
        _updateActive(pool, account, extend, function () {
            _getActiveList(type, account, cur_active_ids, endtime, cb);
        });
    });
}

/**
 * 获取奖励.
 */
function getReward(pool, data, cb) {
    const FUNC = TAG + "getReward() --- ";

    if (!_checkParams_4_GetReward(data, cb)) return;
    BuzzUtil.cacheLinkDataApi(data, 'get_activity_reward');
    
    var token = data.token;
    var type = data.type;
    var quest_id = data.id;
    
    DaoCommon.checkAccount(pool, token, function (error, account) {
        if (error) {
            cb(error);
            return;
        }

        // 连点限制
        if (account.op && account.op['get_activity_reward']) {
            cb(ERROR_OBJ.ACTIVE_CLICK_TOO_QUICK);
            return;
        }

        CacheAccount.setOp(account, 'get_activity_reward');

        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {
        var uid = account.id;

        // 获取奖励的条件判定
        _canPlayerGetReward(type, uid, quest_id, function (err, can) {
            if (!can) return;
            // 获取奖励
            var reward = _getActiveReward(quest_id, type);
            reward = _transReward(reward);
            if (DEBUG) console.log(FUNC + "reward:", reward);

            if (type == ACTIVITY_TYPE.EXCHANGE) {
                _didExchange(pool, reward, type, quest_id, account, cb);
            }
            else {
                DaoReward.getReward(pool, account, reward, function (err, results) {
                    if (err) {
                        if (ERROR) console.error(FUNC + "err:", err);
                        cb(err);
                        return;
                    }
		            addActiveGoldLog(pool, account, type, reward, []);
                    _rewardEnd(pool, type, uid, quest_id, cb);
                });
            }
        })
    }
}

//==============================================================================
// private
//==============================================================================

/**
 * 限时兑换功能
 */
function _didExchange(pool, reward, type, quest_id, account, cb) {
    const FUNC = TAG + "_didExchange() --- ";

    var uid = account.id;
    var needitem = _needItems(quest_id);
    needitem = _transReward(needitem);
    if (DEBUG) console.log(FUNC + "needitem:", needitem);

    if (DaoReward.enough(account, needitem)) {

        var active_stat = _getActiveStat(account, quest_id);
        if (!_isExchangeOver(active_stat[quest_id], quest_id)) {
            DaoReward.getReward(pool, account, reward, function (err, results) {
                if (err) {
                    if (ERROR) console.error(FUNC + "err:", err);
                    cb && cb(err);
                    return;
                }
                if (DEBUG) console.log(FUNC + "skill:", account.skill);
                try {
                    DaoReward.cost(pool, account, needitem, function (err_cost, results_cost) {
                        addActiveGoldLog(pool, account, type, reward, needitem)
                        _rewardEnd(pool, type, uid, quest_id, cb);
                    });
                }
                catch (err_cost) {
                    // TODO: 带有错误码的返回值
                    if (ERROR) console.error(FUNC + "err_cost:\n", err_cost);
                    cb && cb(err_cost);
                }
            });
        }
        else {
            // 提示领取次数已经消耗完
            cb && cb(ERROR_OBJ.ACTIVE_EXCHANGE_OVER);
        }
        
    }
    else {
        if (ERROR) console.error(FUNC + "材料不足，无法兑换");
        cb && cb(ERROR_OBJ.CHIP_NOT_ENOUGH);
    }
}

function addActiveDiamondLog(account, type, reward_items, cost_items) {
    const FUNC = TAG + "addActiveDiamondLog() --- ";
    // yDONE: 钻石数据记录
    var gain = 0;
    var cost = 0;
    for (var i = 0; i < reward_items.length; i++) {
        var item = reward_items[i];
        var item_id = item[0];
        var item_num = item[1];
        if ('i002' == item_id) {
            gain += item_num;
        }
    }
    for (var i = 0; i < cost_items.length; i++) {
        var item = cost_items[i];
        var item_id = item[0];
        var item_num = item[1];
        if ('i002' == item_id) {
            cost += item_num;
        }
    }
    // console.log(FUNC + "gain:", gain);
    // console.log(FUNC + "cost:", cost);
    if (gain > 0 || cost > 0) {
        let scene = common_log_const_cfg.ACTIVE_QUEST;
        if (ACTIVITY_TYPE.EXCHANGE == type) {
            scene = common_log_const_cfg.ACTIVE_EXCHANGE;
        }
        else if (ACTIVITY_TYPE.CHARGE == type) {
            scene = common_log_const_cfg.ACTIVE_CHARGE;
        }

        logDiamond.push({
            account_id: account.id,
            log_at: new Date(),
            gain: gain,
            cost: cost,
            total: account.pearl,
            scene: scene,
            nickname: 0,
        });
    }
}

function addActiveGoldLog(pool, account, type, reward_items, cost_items) {
    const FUNC = TAG + "addActiveGoldLog() --- ";
    // yDONE: 金币数据记录
    var gain = 0;
    var cost = 0;
    console.log(FUNC + "-----------------reward_items:", reward_items);
    console.log(FUNC + "-----------------cost_items:", cost_items);
    for (var i = 0; i < reward_items.length; i++) {
        var item = reward_items[i];
        var item_id = item[0];
        var item_num = item[1];
        if ('i001' == item_id) {
            gain += item_num;
        }
    }
    for (var i = 0; i < cost_items.length; i++) {
        var item = cost_items[i];
        var item_id = item[0];
        var item_num = item[1];
        if ('i001' == item_id) {
            cost += item_num;
        }
    }
    console.log(FUNC + "gain:", gain);
    console.log(FUNC + "cost:", cost);
    if (gain > 0 || cost > 0) {
        let scene = common_log_const_cfg.ACTIVE_QUEST;
        if (ACTIVITY_TYPE.EXCHANGE == type) {
            scene = common_log_const_cfg.ACTIVE_EXCHANGE;
        }
        else if (ACTIVITY_TYPE.CHARGE == type) {
            scene = common_log_const_cfg.ACTIVE_CHARGE;
        }

        var data = {
            account_id: account.id,
            token: account.token,
            total: account.gold,
            duration: 0,
            group: [{
                "gain": gain,
                "cost": cost,
                "scene": scene,
            }],
        };
        console.log(FUNC + "活动插入一条金币日志:", data);
        dao_gold.addGoldLogCache(pool, data, function(err, res) {
            if (err) return console.error(FUNC + "err:", err);
        });
    }
}

function _transReward(reward) {
    // TODO
    return reward;
}

function _rewardEnd(pool, type, uid, id, cb) {
    // 更新缓存中的active
    _updateActiveInCache(type, uid, id, function (err, account) {
        cb(err, account);
        CacheAccount.clearOp(uid, 'get_activity_reward');
    });
}

function _getActiveStat(account, quest_id) {
    var active_stat_once = account.active_stat_once;
    var active_stat_reset = account.active_stat_reset;

    var active_stat = _isExchangeReset(quest_id) ? active_stat_reset : active_stat_once;

    return active_stat;
}

/**
 * 更新缓存中的活动数据.
 */
function _updateActiveInCache(type, uid, quest_id, cb) {
    const FUNC = TAG + "_updateActiveInCache() --- ";
    if (DEBUG) console.log(FUNC + "CALL...");


    CacheAccount.getAccountById(uid, function (err, account) {
        if(account){
            // var active = account.active;

            if (account.active_stat_once == null) account.active_stat_once = {};
            if (account.active_stat_reset == null) account.active_stat_reset = {};

            var active_stat_once = account.active_stat_once;
            var active_stat_reset = account.active_stat_reset;

            if (type == ACTIVITY_TYPE.EXCHANGE) {
                // 根据是否重置决定操作的active_stat变量
                var active_stat = _isExchangeReset(quest_id) ? active_stat_reset : active_stat_once;

                // 交换中的状态表示已经交换的次数
                if (active_stat[quest_id] != null) {
                    // 是否超限判断
                    if (!_isExchangeOver(active_stat[quest_id], quest_id)) {
                        active_stat[quest_id] += 1;
                    }
                    else {
                        // 提示领取次数已经消耗完
                        cb(ERROR_OBJ.ACTIVE_EXCHANGE_OVER);
                        return;
                    }
                }
                else {
                    active_stat[quest_id] = 1;
                }
            }
            else {
                var active_stat = _isQuestReset(quest_id) ? active_stat_reset : active_stat_once;
                active_stat[quest_id] = 1;// status中有对应任务id的状态
            }

            account.active_stat_once = account.active_stat_once;
            account.active_stat_reset = account.active_stat_reset;
            account.commit();

            cb(null, account);
        }
        else {
            if (ERROR) console.error(FUNC + "用户不在缓存中");
            cb(ERROR_OBJ.TOKEN_INVALID);
        }
    });
}

/**
 * 返回活动任务和充值回馈是否会在第二天凌晨重置.
 */
function _isQuestReset(id) {
    const FUNC = TAG + "_isQuestReset() --- ";
    var quest = _getQuestById(id, active_activequest_cfg);
    if (quest) {
        return quest.repeat == 1;
    }
    else {
        console.error(FUNC + "没有找到quest,id:", id);
        return false;
    }
}

/**
 * 返回限时交换是否会在第二天凌晨重置.
 */
function _isExchangeReset(id) {
    // console.log("----------------------id:", id);
    //console.log("active_activechange_cfg:", active_activechange_cfg);
    var quest = _getQuestById(id, active_activechange_cfg);
    return quest.repeat == 1;
}

function _isExchangeOver(status, quest_id) {
    var quest = _getQuestById(quest_id, active_activechange_cfg);
    var limitcount = quest.limitcount;
    //console.log("----------------------status:", status);
    //console.log("----------------------limitcount:", limitcount);
    return status >= limitcount;
}

function mergeActive(active_once, active_daily_reset) {
    var ret = {};
    for(var condition in active_once) {
        if (!ret[condition]) {
            ret[condition] = {};
        }
        for(var val1 in active_once[condition]) {
            ret[condition][val1] = active_once[condition][val1];
        }
    }
    for(var condition in active_daily_reset) {
        if (!ret[condition]) {
            ret[condition] = {};
        }
        for(var val1 in active_daily_reset[condition]) {
            ret[condition][val1] = active_daily_reset[condition][val1];
        }
    }
    return ret;
}

/**
 * 判断玩家是否能领取奖励.
 * @param type 活动类型: 活动任务, 限时兑换, 充值回馈，
 * @param quest_id 活动id, 对应active_activequest中的id值.
 */
function _canPlayerGetReward(type, uid, quest_id, cb) {

    const FUNC = TAG + "_canPlayerGetReward() --- ";
    lCheck(cb);

    function lCheck(cb) {
        CacheAccount.getAccountById(uid, function (err, account) {
            var active_once = account.active;
            var active_daily_reset = account.active_daily_reset;
            var active = mergeActive(active_once, active_daily_reset);
            var active_stat_once = account.active_stat_once;
            var active_stat_reset = account.active_stat_reset;

            // console.log("account:\n", ObjUtil.data2String(account));
            // console.log("active_stat_once:", active_stat_once);
            // console.log("active_stat_reset:", active_stat_reset);

            var quest = _findQuest(type, quest_id);
            if (quest) {
                // 交换条件
                if (type == ACTIVITY_TYPE.EXCHANGE) {
                    var active_stat = _isExchangeReset(quest_id) ? active_stat_reset : active_stat_once;
                    var cur = 0;
                    if (active_stat && active_stat["" + quest_id] != null) {
                        cur = active_stat["" + quest_id];
                    }

                    _utils.invokeCallback(cb, null, quest.limitcount > cur);
                    return;
                }
                else {
                    var active_stat = _isQuestReset(quest_id) ? active_stat_reset : active_stat_once;
                    if (active_stat != null) {
                        // console.log(FUNC + "active_stat:", active_stat);
                        // console.log(FUNC + "active_stat[" + quest_id + "]:", active_stat["" + quest_id]);
                        _utils.invokeCallback(cb, null, active_stat["" + quest_id] != 1);
                        return;
                    }
                    // console.log(FUNC + "active_stat == null");

                    var player_step = _getPlayerStep(active, quest.condition, quest.value1);
                    var condition1 = player_step >= quest.value2;
                    var condition2 = true;
                    // 充值回馈条件
                    if (type == ACTIVITY_TYPE.CHARGE) {
                        // TODO: 判断玩家是否满足领取充值回馈的条件
                        // 玩家的rmb必须大于0
                        // 玩家当日充值记录(tbl_order)中必须有相应的记录且金额达到领取条件
                        var rmb = account.rmb;
                        var quest_rmb = quest.value2 * 10;// 单位是钻石，转换为分则乘以10.
                        condition2 = rmb >= quest_rmb;
                        if (!condition2) {
                            if (ERROR) console.error(FUNC + "[ERROR] 玩家(" + uid + ")没有达成领取充值回馈的条件!!!实际充值:" + rmb + ", 目标需求:" + quest_rmb);
                        }
                    }

                    _utils.invokeCallback(cb, null, condition1 && condition2);
                    return;
                }
            }
            else {
                _utils.invokeCallback(cb, null, false);
            }
        });
    }
}

// 通过类型和ID找到任务
function _findQuest(type, quest_id) {

    var cur_active_ids = _getCurActiveIds();

    var list = [];

    switch (type) {
        case ACTIVITY_TYPE.QUEST:
            list = _getActiveQuest(cur_active_ids);
            break;

        case ACTIVITY_TYPE.CHARGE:
            list = _getActiveCharge(cur_active_ids);
            break;

        case ACTIVITY_TYPE.EXCHANGE:
            list = _getActiveExchange(cur_active_ids);
            break;
    }

    for (var idx in list) {
        var quest = list[idx];

        if (quest.id == quest_id) {
            return quest;
        }
    }
}

/**
 * 获取玩家进度.
 */
function _getPlayerStep(active, condition, value1) {
    if (active) {
        if (active[condition]) {
            if (active[condition][value1]) { // 等于0也会跳出循环返回0
                return active[condition][value1];
            }
        }
    }
    return 0;
}

/**
 * 打开活动界面时更新一次活动进度，保证活动进度是最新的.
 */
function _updateActive(pool, account, extend, cb) {
    const FUNC = TAG + "_updateActive() --- ";

    if (DEBUG) console.log(TAG + "extend:", extend);

    if (extend != null && extend.api == "/data_api/update_account" && extend.data != null) {
        // console.log(TAG + "extend:", JSON.stringify(extend));
        var data = extend.data;
        AccountUpdateActive.update(pool, data, function (err, results) {
            if (err) {
                if (ERROR) console.error(FUNC + "err:", err);
            }
            else {
                if (DEBUG) console.log(FUNC + "results:", results);
                // console.log(FUNC + "results:", results);
            }
            cb();
        }, account);
        return;
    }
    cb();
}

function _getActiveList(type, account, cur_active_ids, endtime, cb) {
    var quest = null;
    var charge = null;
    var exchange = null;
    var draw = null;
    var ret = {};
    var uid = account.id;


    switch (type) {
        case ACTIVITY_TYPE.QUEST:
            quest = _fillStep(type, account, _getActiveQuest(cur_active_ids));
            ret = {quest: quest};
            break;

        case ACTIVITY_TYPE.CHARGE:
            charge = _fillStep(type, account, _getActiveCharge(cur_active_ids));
            ret = {charge: charge};
            break;

        case ACTIVITY_TYPE.EXCHANGE:
            exchange = _fillStep(type, account, _getActiveExchange(cur_active_ids));
            ret = {exchange: exchange};
            break;

        case ACTIVITY_TYPE.DRAW:
            //console.log("获取玩家的免费抽奖次数");
            buzz_draw.getDrawCurrent(account, function (err, draw) {
                ret = {draw: draw};
                ret.endtime = endtime;
                ret.active_id = cur_active_ids[0];
                cb(null, ret);
            });
            return;

        case ACTIVITY_TYPE.ALL:
            quest = _fillStep(ACTIVITY_TYPE.QUEST, account, _getActiveQuest(cur_active_ids));
            charge = _fillStep(ACTIVITY_TYPE.CHARGE, account, _getActiveCharge(cur_active_ids));
            exchange = _fillStep(ACTIVITY_TYPE.EXCHANGE, account, _getActiveExchange(cur_active_ids));
            buzz_draw.getDrawCurrent(account, function (err, draw) {
                ret = {
                    quest: quest,
                    charge: charge,
                    exchange: exchange,
                    draw: draw
                };
                ret.endtime = endtime;
                ret.active_id = cur_active_ids[0];
                cb(null, ret);
            });
            return;
    }
    ret.endtime = endtime;
    ret.active_id = cur_active_ids[0];

    cb(null, ret);
}

// 获取活动还有多少时间结束(单位秒)
function _getActiveEndTime(active_id) {
    var active = _getActiveById(active_id);
    if (DEBUG) console.log("active:", active);
    if (DEBUG) console.log("active_id:", active_id);
    return (new Date(active.endtime).getTime() - new Date().getTime()) / 1000;
}

// 获取任务奖励
function _getActiveReward(active_id, type) {
    var cfg = active_activequest_cfg;
    if (type == ACTIVITY_TYPE.EXCHANGE) {
        cfg = active_activechange_cfg;
        //getitem不是数组(统一格式这里需要加括号进行转换)
        return [_getQuestById(active_id, cfg).getitem];
    }
    var quest = _getQuestById(active_id, cfg);
    if (quest) {
        return _getQuestById(active_id, cfg).reward;
    }
    else {
        return [];
    }
}

// 获取兑换消耗
function _needItems(active_id) {
    return _getQuestById(active_id, active_activechange_cfg).needitem;
}

// 根据ID获得活动内容
function _getQuestById(active_id, cfg) {
    for (var idx in cfg) {
        var active = cfg[idx];
        var id = active.id;
        if (active_id == id) {
            return active;
        }
    }
}

// 根据ID获得活动内容
function _getActiveById(active_id) {
    for (var idx in active_active_cfg) {
        var active = active_active_cfg[idx];
        var id = active.id;
        if (active_id == id) {
            return active;
        }
    }
}

function _fillStep(type, account, list) {
    const FUNC = TAG + "_fillStep() --- ";
    // 从缓存CacheAccount中获取玩家active字段
    var active = {};
    var active_once = {};
    var active_daily_reset = {};
    var active_stat_once = {};
    var active_stat_reset = {};

    if(account){
        active_once         = account.active;
        active_daily_reset  = account.active_daily_reset;
        active = mergeActive(active_once, active_daily_reset);
        active_stat_once = account.active_stat_once;
        active_stat_reset = account.active_stat_reset;
    }

    if (type == ACTIVITY_TYPE.EXCHANGE) {
        for (var idx in list) {
            var quest = list[idx];
            var quest_id = quest.id;
            var active_stat = _isExchangeReset(quest_id) ? active_stat_reset : active_stat_once;

            if (active_stat) {
                if (active_stat[quest_id] != null) {
                    quest.cur = active_stat[quest_id];
                }
                else {
                    quest.cur = 0;
                }
                quest.is_got = _isGotExchange(active_stat[quest_id], quest_id);
            }
            else {
                quest.cur = 0;
                quest.is_got = false;
            }
        }
    }
    else {
        for (var idx in list) {
            var quest = list[idx];
            if (quest) {
                var quest_id = quest.id;
                var condition = "" + quest.condition;
                var value1 = "" + quest.value1;
                var active_stat = _isQuestReset(quest_id) ? active_stat_reset : active_stat_once;

                if (active && active[condition]) {
                    if (active[condition][value1]) {
                        quest.cur = active[condition][value1];
                    }
                    else {
                        quest.cur = 0;
                    }
                }
                else {
                    quest.cur = 0;
                }
                quest.is_got = _isGot(active_stat, quest_id);
                // console.log(FUNC + "is_got:", quest.is_got);
            }
        }
    }
    return list;

}

function _isGotExchange(status, quest_id) {
    return _isExchangeOver(status, quest_id);
}

function _isGot(active_stat, quest_id) {
    if (active_stat == null) {
        return false;
    }
    return active_stat["" + quest_id] == 1;
}

// 获取活动任务记录
// active_activequest_cfg & showtype = QUEST
function _getActiveQuest(cur_active_ids) {
    return _getActiveQC(cur_active_ids, ACTIVITY_TYPE.QUEST);
}

// 获取充值回馈记录
// active_activequest_cfg & showtype = CHARGE
function _getActiveCharge(cur_active_ids) {
    return _getActiveQC(cur_active_ids, ACTIVITY_TYPE.CHARGE);
}


function _getActiveQC(cur_active_ids, type) {
    var ret = [];
    for (var idx in active_activequest_cfg) {
        var quest = active_activequest_cfg[idx];
        var activeid = quest.activeid;
        var showtype = quest.showtype;
        if (cur_active_ids.indexOf(activeid) != -1 && showtype == type) {
            ret.push(quest);
        }
    }
    return ret;
}

// 获取限时兑换记录
// active_activechange_cfg
function _getActiveExchange(cur_active_ids) {
    var ret = [];
    for (var idx in active_activechange_cfg) {
        var quest = active_activechange_cfg[idx];
        var activeid = quest.activeid;
        if (cur_active_ids.indexOf(activeid) != -1) {
            ret.push(quest);
        }
    }
    return ret;
}

// active_active_cfg
function _getCurActiveIds() {
    var cur_active_ids = [];

    for (var idx in active_active_cfg) {
        var active = active_active_cfg[idx];
        var starttime = new Date(active.starttime);
        var endtime = new Date(active.endtime);
        var curtime = new Date();

        if (DateUtil.between(curtime, starttime, endtime)) {
            cur_active_ids.push(active.id);
        }
    }
    return cur_active_ids;
}

function _checkParams_4_ShowMeActivity(data, cb) {
    var fnName = "_checkParams_4_ShowMeActivity()-";
    var token = data.token;
    var type = data.type;

    if (!_isParamExist(token, fnName + "接口调用请传参数token", cb)) return false;
    if (!_isParamExist(type, fnName + "接口调用请传参数type(活动类型: 1-活动任务,2-充值回馈,3-限时兑换,4-以上全部,5-仅返回活动信息)", cb)) return false;

    return true;
}

function _checkParams_4_GetReward(data, cb) {
    var fnName = "_checkParams_4_GetReward()-";
    var token = data.token;
    var type = data.type;
    var id = data.id;

    if (!_isParamExist(token, fnName + "接口调用请传参数token", cb)) return false;
    if (!_isParamExist(type, fnName + "接口调用请传参数type(活动类型: 1-活动任务,2-充值回馈,3-限时兑换,4-以上全部,5-仅返回活动信息)", cb)) return false;
    if (!_isParamExist(id, fnName + "接口调用请传参数id(任务id)", cb)) return false;

    return true;
}

function _isParamExist(param, err_info, cb) {
    if (param == null) {
        var extraErrInfo = {debug_info: "dao_activity._isParamExist()-" + err_info};
        if (ERROR) console.error('------------------------------------------------------');
        if (ERROR) console.error(extraErrInfo.debug_info);
        if (ERROR) console.error('------------------------------------------------------');
        cb(ObjUtil.merge(extraErrInfo, ERROR_OBJ.PARAM_MISSING));
        return false;
    }
    return true;
}

////////////////////////////////////////////////////////////

function _findGiftHistory(pool, cb, next) {
    var sql = '';
    sql += 'SELECT `id`, `gift_id`, `version` ';
    sql += 'FROM `tbl_activity`';
    var sql_data = [];

    console.log('sql:', sql);
    console.log('sql_data:', sql_data);

    pool.query(sql, sql_data, function (err, gift_history) {
        if (err) {
            console.log("查询数据表tbl_activity出现错误！！！");
            console.log(err);
            cb(err);
        }
        else {
            next(gift_history);
        }
    });
}

function _findNewGift(gift_history, next) {
    var gift_tobe_insert = [];
    for (var i = 0; i < shop_gift_cfg.length; i++) {
        var need_insert = true;
        var gift = shop_gift_cfg[i];
        var gift_id = gift["id"];
        var version = gift["version"];

        for (var j = 0; j < gift_history.length; j++) {
            var gift_stored = gift_history[i];
            var gift_id_stored = gift["gift_id"];
            var version_stored = gift["version"];

            if (gift_id == gift_id && version == version_stored) {
                need_insert = false;
                break;
            }
        }

        if (need_insert) {
            gift_tobe_insert.push(gift);
        }
    }

    //console.log("gift_tobe_insert", gift_tobe_insert);
    if (gift_tobe_insert != null && gift_tobe_insert.length > 0) {
        next(gift_tobe_insert);
    }
    else {
        console.log("没有新的礼包数据，无需执行插入操作");
    }
}