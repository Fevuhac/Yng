////////////////////////////////////////////////////////////
// Account Related
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------
var CstError = require('./cst/buzz_cst_error');
var ERROR_OBJ = CstError.ERROR_OBJ;
var ObjUtil = require('./ObjUtil');
var ArrayUtil = require('../utils/ArrayUtil');
var DateUtil = require('../utils/DateUtil');
var BuzzUtil = require('../utils/BuzzUtil');
var RedisUtil = require('../utils/RedisUtil');
var REDIS_KEYS = require('./cst/buzz_cst_redis_keys').REDIS_KEYS,
    PAIR = REDIS_KEYS.PAIR;
//------------------------------------------------------------------------------
// 业务
//------------------------------------------------------------------------------
var buzz_initdata = require('./buzz_initdata');

//------------------------------------------------------------------------------
// DAO
//------------------------------------------------------------------------------
// var dao_reward = require('../dao/dao_reward');
var DaoCommon = require('../dao/dao_common');
var dao_gold = require('../dao/dao_gold');

//------------------------------------------------------------------------------
// 缓存
//------------------------------------------------------------------------------
var CacheAccount = require('./cache/CacheAccount');
var CacheMail = require('./cache/CacheMail');
var CacheLogMailReward = require('./cache/CacheLogMailReward');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var daily_dailypast_cfg = require('../../cfgs/daily_dailypast_cfg');
var common_const_cfg = require('../../cfgs/common_const_cfg');
var common_log_const_cfg = require('../../cfgs/common_log_const_cfg');
var newweapon_upgrade_cfg = require('../../cfgs/newweapon_upgrade_cfg');
var player_level_cfg = require('../../cfgs/player_level_cfg');

/** 每次补签需要扣除的钻石数量 */
const MISS_SIGN = common_const_cfg.MISS_SIGN;

//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;

var TAG = "【buzz_reward】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getReward = getReward;
exports.cost = cost;
exports.getMonthSignInit = getMonthSignInit;
exports.monthSign = monthSign;
exports.getDayReward = getDayReward;
exports.resetMonthSign = resetMonthSign;

exports.guideReward = guideReward;
exports.dailyReward = dailyReward;
exports.achieveReward = achieveReward;
exports.missionReward = missionReward;
exports.activeReward = activeReward;
exports.onekeyReward = onekeyReward;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 验证用户有效性
 */
function getReward(req, account, reward, cb) {

    // 制作一个data数据.
    var data = {
        account: account,
        reward: reward
    };
    
    req.dao.getCommonReward(data, cb);
}

/**
 * 验证用户有效性
 */
function cost(req, account, reward, cb) {

    // 制作一个data数据.
    var data = {
        account: account,
        reward: reward
    };
    
    req.dao.rewardCost(data, cb);
}

/**
 * 获取月签初始值.
 */
function getMonthSignInit() {
    var ret = "";
    var n = DateUtil.getDaysOfThisMonth();
    for (var i = 0; i < n; i++) {
        if (i > 0) ret += ",";
        ret += "0";
    }
    return ret;
}

/**
 * 查询本月的可签到状态
 */
function monthSign(req, dataObj, cb) {
    const FUNC = TAG + "monthSign() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "month_sign");

    _monthSign(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token'], "buzz_reward", cb);
    }
}

/**
 * 领取每日奖励
 */
function getDayReward(req, dataObj, cb) {
    const FUNC = TAG + "getDayReward() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "get_day_reward");

    _getDayReward(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'day'], "buzz_reward", cb);
    }
}

/**
 * 每月一日重置月签数据
 */
function resetMonthSign(pool) {
    const FUNC = TAG + "resetMonthSign() --- ";
    //----------------------------------

    var monthSignInitStr = getMonthSignInit();

    // 更新数据库数据
    dao_resetMonthSign(pool, monthSignInitStr, function() {
        // 更新所有缓存数据
        let monthSignInitStrRedis="["+monthSignInitStr+"]";
        CacheAccount.monthlyReset(monthSignInitStrRedis);
    });
}

/**
 * 每月一日重置月签数据
 */
function dao_resetMonthSign(pool, monthSignInitStr, cb) {
    const FUNC = TAG + "dao_resetMonthSign() --- ";

    var sql = "";
    sql += "UPDATE `tbl_account_sign` ";
    sql += "SET month_sign=? ";

    var sql_data = [monthSignInitStr];

    pool.query(sql, sql_data, function(err, result) {
        if (ERROR) console.error(FUNC + "err:", err);
        if (DEBUG) console.log(FUNC + "result:", result);
        cb();
    });
}

function guideReward(req, dataObj, cb) {
    const FUNC = TAG + "guideReward() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "guide_reward");

    _didGuideReward(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token'], "buzz_reward", cb);
    }
}

function dailyReward(req, dataObj, cb) {
    const FUNC = TAG + "dailyReward() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "daily_reward");

    _didDailyReward(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'quest_id'], "buzz_reward", cb);
    }
}

function achieveReward(req, dataObj, cb) {
    const FUNC = TAG + "achieveReward() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "achieve_reward");

    _didAchieveReward(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'quest_id'], "buzz_reward", cb);
    }
}

function missionReward(req, dataObj, cb) {
    const FUNC = TAG + "missionReward() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "mission_reward");

    _missionReward(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'quest_id'], "buzz_reward", cb);
    }
}

function activeReward(req, dataObj, cb) {
    const FUNC = TAG + "activeReward() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "active_reward");

    _didActiveReward(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'idx'], "buzz_reward", cb);
    }
}

function onekeyReward(req, dataObj, cb) {
    const FUNC = TAG + "onekeyReward() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "onekey_reward");

    _onekeyReward(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'type'], "buzz_reward", cb);
    }
}

//==============================================================================
// private
//==============================================================================

/**
 * 查询本月的可签到状态
 * @return
 * {days:?, today:?} 
 */
function _monthSign(req, dataObj, cb) {
    const FUNC = TAG + "_monthSign() --- ";
    var uid = dataObj.uid;
    var token = dataObj.token;
    var pool = req.pool;

    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {

        // 从0开始, 即0为1号
        var today = new Date().getDate() - 1;
        // TODO: 玩家签到数据异常判定(可能是回档到上月)
        var new_month_sign = ArrayUtil.getIntArr(buzz_initdata.initMonthSign());

        for (var i = 0; i <= today; i++) {
            if (account.month_sign.length <= i) {
                break;
            }
            new_month_sign[i] = account.month_sign[i];
        }
        account.month_sign = new_month_sign;

        var ret = {
            days: account.month_sign,
            today: today,
        }

        account.commit();

        cb(null, ret);

    }
}

/**
 * 领取每日奖励(签到奖励)
 * @return
 * {day:?,day_state:?}
 */
function _getDayReward(req, dataObj, cb) {
    const FUNC = TAG + "_monthSign() --- ";
    var uid = dataObj.uid;
    var token = dataObj.token;
    var day = dataObj.day;
    var today = new Date().getDate() - 1;
    var pool = req.pool;

    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }

        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {
        if (!_checkGetDayReward(account, day, today, cb)) return;

        var dailypast = _getMonthDailypast(day);
        var reward = dailypast.reward;
        var viplevel = dailypast.viplevel;
        var times = 1;
        // 目前满足VIP等级的只有双倍奖励.
        if (viplevel > 0 && account.vip >= viplevel) {
            times = 2;
        }

        var gain_item_list = [
            {
                item_id: reward[0],
                item_num: reward[1] * times,
            },
        ];
        var cost_item_list = [
            {
                item_id: "i002",
                item_num: MISS_SIGN,
            },
        ];

        BuzzUtil.putIntoPack(req, account, gain_item_list, function(reward_info) {
            var reward_change = BuzzUtil.getChange(account, reward_info);
            var ret = {
                day: day,
                day_state: 1,
                item_list: gain_item_list,
            };
            // 设置month_sign
            // account.month_sign[day] = 1;

            let month_sign = account.month_sign;
            month_sign[day] = 1;
            account.month_sign = month_sign;
            account.commit();
            // CacheAccount.signMonth(uid, day);
            // 补签扣钻石
            if (day < today) {
                BuzzUtil.removeFromPack(req, account, cost_item_list, function(cost_info) {
                    var cost_change = BuzzUtil.getChange(account, cost_info);
                    var change = ObjUtil.merge(reward_change, cost_change);
                    ret.change = change;
                    cb(null, ret);
                    addGameLog();
                });
            }
            else {
                ret.change = reward_change;
                cb(null, ret);
                addGameLog();
            }

            function addGameLog() {
                var gain = 0;
                var cost = 0;
                // yDONE: 金币数据记录
                for (var i = 0; i < gain_item_list.length; i++) {
                    var item = gain_item_list[i];
                    var item_id = item.item_id;
                    var item_num = item.item_num;
                    if ('i001' == item_id) {
                        gain += item_num;
                    }
                }
                if (gain > 0) {
                    var data = {
                        account_id: uid,
                        token: token,
                        total: account.gold,
                        duration: 0,
                        group: [{
                            "gain": gain,
                            "cost": cost,
                            "scene": common_log_const_cfg.MONTH_SIGN_REWARD,
                        }],
                    };
                    console.log(FUNC + "签到领取到金币:", data);
                    dao_gold.addGoldLogCache(pool, data, function(err, res) {
                        if (err) return console.error(FUNC + "err:", err);
                    });
                }


                // yDONE: 钻石数据记录
                var diamondGain = 0;
                var diamondCost = 0;
                for (var i = 0; i < gain_item_list.length; i++) {
                    var item = gain_item_list[i];
                    var item_id = item.item_id;
                    var item_num = item.item_num;
                    if ('i002' == item_id) {
                        diamondGain += item_num;
                    }
                }
                for (var i = 0; i < cost_item_list.length; i++) {
                    var item = cost_item_list[i];
                    var item_id = item.item_id;
                    var item_num = item.item_num;
                    if ('i002' == item_id) {
                        diamondCost += item_num;
                    }
                }
                if (diamondGain > 0 || diamondCost > 0) {
                    console.log(FUNC + uid + "签到领取到钻石:", diamondGain);
                    console.log(FUNC + uid + "补签消耗钻石:", diamondCost);
                    logDiamond.push({
                        account_id: uid,
                        log_at: new Date(),
                        gain: diamondGain,
                        cost: diamondCost,
                        total: account.pearl,
                        scene: common_log_const_cfg.MONTH_SIGN_REWARD,
                        nickname: 0,
                    });
                }

            }
        });
    }
}

function _checkGetDayReward(account, day, today, cb) {
    const FUNC  = TAG + "_checkGetDayReward() ...";
    var month_sign = account.month_sign;

    if (day >= month_sign.length || day < 0) {
        cb(ERROR_OBJ.SIGN_DAY_OUT_OF_RANGE);
        return false;
    }
    if (month_sign[day] == 1) {
        cb(ERROR_OBJ.SIGN_REPEAT);
        return false;
    }
    if (month_sign[day] == 2) {
        cb(ERROR_OBJ.SIGN_FORBIDDEN1);
        return false;
    }
    if (today < day) {
        cb(ERROR_OBJ.SIGN_FORBIDDEN2);
        return false;
    }
    if (day < today && account.pearl < MISS_SIGN) {
        cb(ERROR_OBJ.SIGN_DIAMOND_NOT_ENOUGH);
        return false;
    }

    return true;
}

function _getMonthDailypast(day) {
    for (var idx in daily_dailypast_cfg) {
        var dailypast = daily_dailypast_cfg[idx];
        if (dailypast.type == 1 && dailypast.id == day + 1) {
            return dailypast;
        }
    }
    return null;
}


//----------------------------------------------------------
// 领奖

/**
 * 强制引导结束后领奖.
 */
function _didGuideReward(req, dataObj, cb) {
    const FUNC = TAG + "_didGuideReward() --- ";
    var uid = dataObj.uid;
    var token = dataObj.token;
    var pool = req.pool;

    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {
        //新手完成，获得100万兑换券("i200")，30级可用
        let item_list = [];
        item_list.push({
            item_id: "i200",
            item_num: 1,
        });
        let needpower = 3000;
        let weapon_level_next = 5;
        if (newweapon_upgrade_cfg[weapon_level_next]
            && newweapon_upgrade_cfg[weapon_level_next].needpower) {
            needpower = newweapon_upgrade_cfg[weapon_level_next].needpower;
        }
        let gold = 1000;
        if (player_level_cfg && player_level_cfg.length > 0 && player_level_cfg[0]) {
            gold = player_level_cfg[0].newcomergold;
        }
        CacheAccount.setGold(account.id, gold);
        let wpEng = {'1': 0};
        wpEng[weapon_level_next] = needpower;
        CacheAccount.setWeaponEnergy(uid, wpEng);
        BuzzUtil.putIntoPack(req, account, item_list, function(reward) {
            var change = BuzzUtil.getChange(account, reward);
            var ret = {};
            ret.item_list = item_list;
            ret.change = {};
            ret.change.package = account.package;
            ret.change.weapon = weapon_level_next;
            ret.change.weapon_energy = wpEng;
            ret.change.gold = gold;
            cb(null, ret);
        });
    }
}

/**
 * desperated
 */
function _didDailyReward(req, dataObj, cb) {
    const FUNC = TAG + "_didDailyReward() --- ";
    var uid = dataObj.uid;
    var token = dataObj.token;
    var pool = req.pool;

    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {
    }
}

/**
 * desperated
 */
function _didAchieveReward(req, dataObj, cb) {
    const FUNC = TAG + "_didAchieveReward() --- ";
    var uid = dataObj.uid;
    var token = dataObj.token;
    var pool = req.pool;

    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {
    }
}

//----------------------------------------------------------
// 任务领奖

/** 任务类型 */
const QUEST_TYPE = {
    /** 每日重置任务 */
    DAILY_RESET: 0,
    /** 成就任务, 只能达成一次 */
    ACHIEVE_ONCE: 1,
};

/**
 * 任务领奖(每日任务, 成就任务)
 */
function _missionReward(req, dataObj, cb) {
    const FUNC = TAG + "_missionReward() --- ";
    var uid = dataObj.uid;
    var token = dataObj.token;
    var qid = dataObj.quest_id;
    var qcv = dataObj.quest_cur_value;// 可选
    
    var pool = req.pool;

    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {

        var quest = BuzzUtil.getQuestById(qid);
        if (!_checkMissionReward1()) return;

        var quest_type = quest.type;
        var quest_condition = quest.condition;
        var quest_value1 = quest.value1;
        var quest_value2 = quest.value2;
        var quest_precondition = quest.precondition;
        var mission = _getMissionRecordByType(account, quest_type);
        if (!_checkMissionReward2()) return;
        // 更新任务当前值
        if (qcv != undefined) {
            mission["" + qid] = qcv;
        }
        if (!_checkMissionReward3()) return;

        var quest_reward = quest.reward;
        var item_list = BuzzUtil.getItemList(quest_reward);

        // 需要将成就点进行更新
        BuzzUtil.putIntoPack(req, account, item_list, function(reward) {
            var change = BuzzUtil.getChange(account, reward);

            if (0 != quest_precondition) {
                mission["" + quest_precondition] = qcv;
                delete mission["" + qid];
            }
            else {
                qcv = -1;
                mission["" + qid] = -1;
            }


            _setMissionRecordByType(account, quest_type, mission);


            account.commit(function (err, result) {
                console.log('------------------------------------ account.commit', result);
            });


            var ret = {
                item_list: item_list,
                change: change,
                quest_id: qid,
                precondition: quest_precondition,
                quest_cur_value: qcv,
                mission_only_once: account.mission_only_once,
                mission_daily_reset: account.mission_daily_reset,
            };

            cb(null, ret);

            let scene = common_log_const_cfg.DAILY_GAIN;
            if (QUEST_TYPE.ACHIEVE_ONCE == quest_type) {
                scene = common_log_const_cfg.ACHIEVE_GAIN;
            }

            // yDONE: 金币数据记录
            var gain = 0;
            for (var i = 0; i < item_list.length; i++) {
                var item = item_list[i];
                var item_id = item.item_id;
                var item_num = item.item_num;
                if ('i001' == item_id) {
                    gain += item_num;
                }
            }
            if (gain > 0) {
                console.log(FUNC + uid + ":在任务中获得金币");
                var data = {
                    account_id: uid,
                    token: token,
                    total: account.gold,
                    duration: 0,
                    group: [{
                        "gain": gain,
                        "cost": 0,
                        "scene": scene,
                    }],
                };
                dao_gold.addGoldLogCache(pool, data, function(err, res) {
                    if (err) return console.error(FUNC + "err:", err);
                });
            }

            // yDONE: 钻石数据记录
            var diamondGain = 0;
            for (var i = 0; i < item_list.length; i++) {
                var item = item_list[i];
                var item_id = item.item_id;
                var item_num = item.item_num;
                if ('i002' == item_id) {
                    diamondGain += item_num;
                }
            }
            if (diamondGain > 0) {
                console.log(FUNC + uid + ":在任务中获得钻石");
                logDiamond.push({
                    account_id: uid,
                    log_at: new Date(),
                    gain: diamondGain,
                    cost: 0,
                    total: account.pearl,
                    scene: scene,
                    nickname: 0,
                });
            }
        });

        // 校验方法1
        function _checkMissionReward1() {
            if (null == quest) {
                cb(ERROR_OBJ.MISSION_WRONG_QUEST_ID);
                return false;
            }

            return true;
        }

        // 校验方法2
        function _checkMissionReward2() {
            if (null == mission) {
                cb(ERROR_OBJ.MISSION_NULL);
                return false;
            }

            var quest_list = BuzzUtil.getQuestListByConditionAndValue1(quest_condition, quest_value1);
            for (var i = 0; i < quest_list.length; i++) {
                var check_quest_id = quest_list[i];
                if (mission["" + check_quest_id] != undefined) {
                    if (check_quest_id > qid) {
                        cb(ERROR_OBJ.MISSION_GOTTON);
                        return false;
                    }
                    if (check_quest_id < qid) {
                        cb(ERROR_OBJ.MISSION_DISATISFY);
                        return false;
                    }
                }
            }

            return true;
        }

        // 校验方法3
        function _checkMissionReward3() {
            if (undefined == mission["" + qid]) {
                cb(ERROR_OBJ.MISSION_NULL_RECORD);
                return false;
            }

            var quest_cur_value = mission["" + qid];
            if (quest_cur_value < quest_value2) {
                cb(ERROR_OBJ.MISSION_DISATISFY);
                return false;
            }

            return true;
        }
    }
}

function _getMissionRecordByType(account, quest_type) {
    switch(quest_type) {
        case QUEST_TYPE.DAILY_RESET:
            return account.mission_daily_reset;
        case QUEST_TYPE.ACHIEVE_ONCE:
            return account.mission_only_once;
    }
    return null;
}

function _setMissionRecordByType(account, quest_type, mession) {
    switch(quest_type) {
        case QUEST_TYPE.DAILY_RESET:
            account.mission_daily_reset = mession;
            console.log('------------------------------------mission_daily_reset:',mession);
            break;
        case QUEST_TYPE.ACHIEVE_ONCE:
            account.mission_only_once = mession;
            console.log('------------------------------------mission_only_once:',mession);
            break;
    }
}

//----------------------------------------------------------
// 活跃领奖

/**
 * 活跃领奖
 */
function _didActiveReward(req, dataObj, cb) {
    const FUNC = TAG + "_didActiveReward() --- ";
    var uid = dataObj.uid;
    var token = dataObj.token;
    var idx = dataObj.idx;
    var pool = req.pool;

    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {

        var vitality = BuzzUtil.getVitalityByIdx(idx);
        if (!_checkActiveReward1()) return;

        var item_list = BuzzUtil.getItemList(vitality.reward);

        // 需要将成就点进行更新
        BuzzUtil.putIntoPack(req, account, item_list, function(reward) {
            var change = BuzzUtil.getChange(account, reward);
            var ret = {
                item_list: item_list,
                change: change,
                idx: idx,
            };

            account.mission_daily_reset["box" + idx] = 1;

            cb(null, ret);
        });

        // 校验方法1
        function _checkActiveReward1() {
            if (null == vitality) {
                cb(ERROR_OBJ.MISSION_WRONG_ACTIVE_IDX);
                return false;
            }

            var dailyTotal = account.mission_daily_reset.dailyTotal;
            if (vitality.value > dailyTotal) {
                cb(ERROR_OBJ.MISSION_ACTIVE_DISATISFY);
                return false;
            }

            var box = account.mission_daily_reset["box" + idx];
            if (box > 0) {
                cb(ERROR_OBJ.MISSION_GOTTON);
                return false;
            }

            return true;
        }
    }
}

//----------------------------------------------------------
// 一键领取

const ONE_KEY_REWARD_TYPE = {
    ACHIEVE: 0,
    DAILY: 1,
    MAIL: 2,
};

/**
 * 一键领取
 */
function _onekeyReward(req, dataObj, cb) {
    const FUNC = TAG + "_onekeyReward() --- ";
    var uid = dataObj.uid;
    var token = dataObj.token;
    var type = dataObj.type;
    var pool = req.pool;

    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {

        if (!_checOnekeyReward1()) return;

        var item_list = [];
        // TODO: 一键领取逻辑
        // 分不同类型
        switch(type) {
            case ONE_KEY_REWARD_TYPE.ACHIEVE:
                rewardAllAchieve(item_list, function(item_list) {
                    handleResult(item_list);
                });
            break;
            case ONE_KEY_REWARD_TYPE.DAILY:
                rewardAllDaily(item_list, function(item_list) {
                    handleResult(item_list);
                });
            break;
            case ONE_KEY_REWARD_TYPE.MAIL:
                rewardAllMail(item_list, function(item_list) {
                    handleResult(item_list);
                });
            break;
        }

        function handleResult(item_list) {
            if (DEBUG) console.log(FUNC + "item_list:\n", item_list);
            BuzzUtil.putIntoPack(req, account, item_list, function(reward_info) {
                var change = BuzzUtil.getChange(account, reward_info);
                account.mission_only_once.achievePoint = account.achieve_point;
                if (DEBUG) console.log(FUNC + "mission_daily_reset:", account.mission_daily_reset);
                var ret = {
                    item_list: item_list,
                    change: change,
                };
                switch(type) {
                    case ONE_KEY_REWARD_TYPE.ACHIEVE:
                    case ONE_KEY_REWARD_TYPE.DAILY:
                        ret.mission_only_once = account.mission_only_once;
                        ret.mission_daily_reset = account.mission_daily_reset;
                        if (DEBUG) console.log(FUNC + "mission_only_once:", ret.mission_only_once);
                    break;
                    case ONE_KEY_REWARD_TYPE.MAIL:
                        ret.mail_box = account.mail_box;
                        // TODO:改是否有邮件的值
                    break;
                }
                if (DEBUG) console.log(FUNC + "ret:", ret);
                cb(null, ret);
                addGameLogForOneKeyReward(item_list, account, type);
            });
        }

        function addGameLogForOneKeyReward(item_list, account, type) {
            let scene = common_log_const_cfg.MAIL;
            switch(type) {
                case ONE_KEY_REWARD_TYPE.ACHIEVE:
                    scene = common_log_const_cfg.ACHIEVE_GAIN;
                break;

                case ONE_KEY_REWARD_TYPE.DAILY:
                    scene = common_log_const_cfg.DAILY_GAIN;
                break;
            }

            console.log(FUNC + "000mailReward:", item_list);
            let goldGain = 0;
            let diamondGain = 0;
            let huafeiGain = 0;
            for (let i = 0; i < item_list.length; i++) {
                let item = item_list[i];
                let item_id = item.item_id;
                let item_num = item.item_num;
                if ('i001' == item_id) {
                    goldGain += item_num;
                }
                if ('i002' == item_id) {
                    diamondGain += item_num;
                }
                if ('i003' == item_id) {
                    huafeiGain += item_num;
                }
            }
            let uid = account.id;
            if (goldGain > 0) {
                // yDONE: 金币记录日志
                console.log(FUNC + uid + "领取邮件发放的金币");
                logGold.push({
                    account_id: uid,
                    log_at: new Date(),
                    gain: goldGain,
                    cost: 0,
                    duration: 0,
                    total: account.gold,
                    scene: scene,
                    nickname: 0,
                    level: account.level,
                });
            }
            if (diamondGain > 0) {
                // yDONE: 钻石记录日志
                console.log(FUNC + uid + "领取邮件发放的钻石");
                logDiamond.push({
                    account_id: uid,
                    log_at: new Date(),
                    gain: diamondGain,
                    cost: 0,
                    total: account.pearl,
                    scene: scene,
                    nickname: 0,
                });
            }
            if (huafeiGain > 0) {
                // yDONE: 话费券记录日志
                console.log(FUNC + uid + "领取邮件发放的话费券");
                let total = account.package['9']['i003'];
                logHuafei.push({
                    uid: uid,
                    gain: huafeiGain,
                    cost: 0,
                    total: total,
                    scene: scene,
                    comment: "'邮件发放话费券'",
                    time: new Date(),
                });
            }
        }

        // 校验方法1
        function _checOnekeyReward1() {
            if (ONE_KEY_REWARD_TYPE.ACHIEVE != type
                && ONE_KEY_REWARD_TYPE.DAILY != type
                && ONE_KEY_REWARD_TYPE.MAIL != type) {
                cb(ERROR_OBJ.MISSION_WRONG_TYPE);
                return false;
            }

            return true;
        }

        /**
    mission_only_once: {
        "1001": 0,
        "201400": 9,
        "achievePoint": 0
    }
        */
        function rewardAllAchieve(item_list, cb) {
            const FUNC = TAG + "rewardAllAchieve() --- ";
            var has_more = false;
            for (var idx in account.mission_only_once) {
                if ("achievePoint" != idx) {
                    var cur_value = account.mission_only_once[idx];
                    var quest = BuzzUtil.getQuestById(idx);
                    if (null != quest && cur_value >= quest.value2) {
                        var temp_item_list = BuzzUtil.getItemList(quest.reward);
                        var gold_acc = BuzzUtil.getGoldRewardFromItemList(temp_item_list);
                        var achieve_acc = BuzzUtil.getAchieveRewardFromItemList(temp_item_list);
                        item_list = ObjUtil.mergeItemList(item_list, temp_item_list);
                        if (DEBUG)console.log(FUNC + "quest_id:", idx);
                        if (DEBUG)console.log(FUNC + "temp_item_list:\n", temp_item_list);
                        has_more = true;
                        var precondition = quest.precondition;
                        if (0 != precondition) {
                            account.mission_only_once['' + precondition] = cur_value;
                            delete account.mission_only_once[idx];
                        }
                        else {
                            account.mission_only_once[idx] = -1;
                        }
                        if (gold_acc > 0) {
                            var gold_quest_id = BuzzUtil.getGoldQuestIdByMission(account.mission_only_once);
                            if (gold_quest_id != null) {
                                account.mission_only_once[gold_quest_id] += gold_acc;
                            }
                        }
                        if (DEBUG)console.log(FUNC + "achieve_acc:", achieve_acc);
                        if (achieve_acc > 0) {
                            var achieve_quest_id = BuzzUtil.getAchieveQuestIdByMission(account.mission_only_once);
                            if (DEBUG)console.log(FUNC + "achieve_quest_id:", achieve_quest_id);
                            if (achieve_quest_id != null) {
                                account.mission_only_once[achieve_quest_id] += achieve_acc;
                                if (DEBUG)console.log(FUNC + "achieve_quest_step:", account.mission_only_once[achieve_quest_id]);
                            }
                        }
                    }
                }
            }
            if (has_more) {
                rewardAllAchieve(item_list, cb);
            }
            else {
                cb(item_list);
            }
        }

        /**
    mission_daily_reset: {
    '101000': 56,
    '102000': 1,
    '107000': 4,
    '111000': 100001,
    '119000': 2,
    dailyTotal: 30,
    box0: 0,
    box1: 0,
    box2: 0,
    box3: 0 
    }
        */
        function rewardAllDaily(item_list, cb) {
            const FUNC = TAG + "rewardAllDaily() --- ";
            var mission_daily_reset = account.mission_daily_reset;
            if (DEBUG) console.log(FUNC + "mission_daily_reset:", JSON.stringify(mission_daily_reset));
            for (var idx in mission_daily_reset) {
                var mission = mission_daily_reset[idx];
                var cur_value = mission_daily_reset[idx];
                var quest = BuzzUtil.getQuestById(idx);
                if (DEBUG) console.log(FUNC + "queat idx:", idx);
                if (DEBUG) console.log(FUNC + "当前值:", cur_value);
                if (quest) console.log(FUNC + "目标值:", quest.value2);
                if (quest && cur_value >= quest.value2) {
                    var temp_item_list = BuzzUtil.getItemList(quest.reward);
                    item_list = ObjUtil.mergeItemList(item_list, temp_item_list);
                    var precondition = quest.precondition;
                    if (0 != precondition) {
                        delete account.mission_daily_reset[idx];
                    }
                    else {
                        account.mission_daily_reset[idx] = -1;
                    }
                }
            }
            cb(item_list);
        }

        function rewardAllMail(item_list, cb) {
            var mail_box = account.mail_box;
            _getMailsDetail(mail_box, function (err, mails) {
                if(err || !mails){
                    cb && cb('邮件列表为空');
                    return;
                }

                mail_box.forEach(function (id) {
                    let mail = mails[id];
                    if (mail.reward != null) {
                        if (DEBUG) console.log(FUNC + "字符串 reward:", mail.reward);
                        var reward = ObjUtil.str2Data(mail.reward);
                        if (DEBUG) console.log(FUNC + "对象 reward:", reward);
                        var temp_item_list = BuzzUtil.getItemList(reward);
                        item_list = ObjUtil.mergeItemList(item_list, temp_item_list);

                        // yDONE: 增加一条玩家领取邮件奖励的记录
                        console.log(FUNC + "增加一条玩家领取邮件奖励的记录");
                        let mailReward = {
                            uid: uid,
                            mid: id,
                            reward: ObjUtil.data2String(mail.reward),
                            log_at: DateUtil.format(new Date(), "yyyy-MM-dd hh:mm:ss"),
                        };
                        CacheLogMailReward.push(mailReward);
                    }
                });

                account.mail_box = [];
                account.commit();

                if (DEBUG) console.log(FUNC + "item_list:", item_list);
                cb(item_list);
            });
        }

        function _getMailsDetail(mids, cb){

            let sp = '';
            for(let i = 1; i <= mids.length; ++i){
                sp += '?';
                if(i!= mids.length){
                    sp += ',';
                }
            }

            let sql = `SELECT * FROM tbl_mail WHERE id IN(${sp})`;
            mysqlPool.query(sql, mids, function (err, results) {
                if(err){
                    cb(err);
                    return;
                }

                let objs = {};

                if(results && results.length){
                    for(let i = 0; i< results.length; ++i){
                        objs[results[i].id] = results[i];
                    }
                }

                cb(err, objs);
            })

        }
    }
}
