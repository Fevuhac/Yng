////////////////////////////////////////////////////////////////////////////////
// Account Update Activity Gift
// 账户数据更新(活动任务)
// update
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var _ = require('underscore');
var StringUtil = require('../../../utils/StringUtil');
var ObjUtil = require('../../../buzz/ObjUtil');
var CacheAccount = require('../../../buzz/cache/CacheAccount');

var active_activequest_cfg = require('../../../../cfgs/active_activequest_cfg');

var dao_activity = require('../../dao_activity');


//==============================================================================
// constant
//==============================================================================
var DEBUG = 0;
var ERROR = 1;

var TAG = "【update/active】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.update = _update;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 账户数据更新(活动任务).
 * 数据格式如下(可处理多个活动任务的更新)
 {
     id:?,
     token:?,
     active:{
         id1: num,
         id2: num
     }
 }
 */
function _update(pool, data, cb, my_account) {
    const FUNC = TAG + "_update() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");

    var account_id = my_account['id'];
    var token = my_account['token'];
    var active = ObjUtil.str2Data(data['active']);

    if (DEBUG) console.log("---------------------------------------------");
    if (DEBUG) console.log(FUNC + "add active: ", active);
    if (DEBUG) console.log("---------------------------------------------");


    CacheAccount.getAccountById(account_id, function (err, account_in_cache) {
        if (account_in_cache) {
            if (DEBUG) console.log(FUNC + "缓存中有当前玩家的数据.");

            if (!account_in_cache.active) {
                account_in_cache.active = {};
            }
            // 此处仅更新cache中的活动数据(数据库依靠同步代码更新)
            if (DEBUG) console.log(FUNC + "更新前:", account_in_cache.active);

            if (DEBUG) console.log(FUNC + "更新后:", account_in_cache.active);
            var cur_active_ids = dao_activity.getCurActiveIds();
            for (var condition in account_in_cache.active) {
                for (var val1 in account_in_cache.active[condition]) {
                    var repeat = getRepeatFromActiveQuest(cur_active_ids, condition, val1);
                    if (repeat == 1) {
                        delete account_in_cache.active[condition][val1];
                    }
                }
            }
            _updateActiveInCache(account_in_cache, active);
            if (cb != null) cb(null, account_in_cache.active);
        }
    });
}


//==============================================================================
// private
//==============================================================================

function _updateActiveInCache(account_in_cache, active_new) {
    const FUNC = TAG + "_updateActiveInCache() --- ";
    const EFUNC = "<<<ERROR>>>" + TAG + "_updateActiveInCache() --- ";
    DEBUG = 0;
    //--------------------------------------------------------------------------

    var active_in_cache = account_in_cache.active;
    //console.log("active_new: ", active_new);
    for (var condition in active_new) {

        // console.log(FUNC + "condition:", condition);
        // console.log(FUNC + "type:", typeof(condition));

        var val_list = active_new[condition];
        // 检测active_inc.id是否存在于active_in_cache中
        if (!_.has(active_in_cache, condition)) {
            active_in_cache[condition] = {};
        }

        var condition_data = active_in_cache[condition];

        if (null == condition_data) {
            active_in_cache[condition] = {};
            condition_data = active_in_cache[condition];
        }

        if (DEBUG) console.log(FUNC + "进入循环val_list:", val_list);

        for (var val1 in val_list) {
            if (DEBUG) console.log(FUNC + "---------val1:", val1);

            // 充值活动进度不由客户端更新控制
            if (condition == "19") {
                // do nothing
            }
            else {
                if (DEBUG) console.log(FUNC + "进入更新");
                if (DEBUG) console.log(FUNC + "condition:", condition);
                if (DEBUG) console.log(FUNC + "val1:", val1);
                var num = val_list[val1];
                if (StringUtil.isString(num)) {
                    if (ERROR) console.error(EFUNC + "客户端传入参数是字符串, 应该传入数字!!!");
                    num = parseInt(num);
                }
                if (DEBUG) console.log(FUNC + "num:", num);
                if (_.has(condition_data, val1)) {
                    if (DEBUG) console.log(FUNC + "存在(val1):", val1);
                    condition_data[val1] = parseInt(condition_data[val1]) + num;
                }
                else {
                    if (DEBUG) console.log(FUNC + "不存在(val1):", val1);
                    if (condition_data == null) {
                        condition_data = {};
                    }
                    condition_data[val1] = num;
                }
                updateActiveDailyReset(account_in_cache, condition, val1, condition_data[val1]);

                account_in_cache.active = active_in_cache;
                // console.log("active_daily_reset------",account_in_cache.active_daily_reset);
                account_in_cache.commit();

            }
        }
    }
    DEBUG = 0;
}

/**
 * 更新需要重置的数据(account_in_cache).
 * @param account_in_cache 需要操作的玩家缓存数据.
 * @param condition 判断条件1.
 * @param val1 判断条件2.
 * @param final_num 设置的最终值(表示无需叠加).
 */
function updateActiveDailyReset(account_in_cache, condition, val1, final_num) {
    const FUNC = TAG + "updateActiveDailyReset() --- ";

    // console.log(FUNC + "condition:", condition);
    // console.log(FUNC + "type:", typeof(condition));
    if (typeof(condition) !== "string") {
        console.log(FUNC + "condition:", condition);
        console.log(FUNC + "type:", typeof(condition));
    }

    condition = condition + "";
    val1 = val1 + "";

    var cur_active_ids = dao_activity.getCurActiveIds();

    var repeat = getRepeatFromActiveQuest(cur_active_ids, condition, val1);

    if (repeat) {
        var active_daily_reset = account_in_cache.active_daily_reset;
        if (!active_daily_reset) {
            if (ERROR) console.error(FUNC + "更新每日重置任务数据时此字段为空！！！");
            active_daily_reset = {};
        }
        console.log(FUNC + "1.active_daily_reset:", active_daily_reset);
        if (!active_daily_reset[condition + ""]) {
            console.log(FUNC + "----------------------------");
            active_daily_reset[condition + ""] = {};
            console.log(FUNC + "=======================active_daily_reset:", JSON.stringify(active_daily_reset));
            console.log(FUNC + "=======================active_daily_reset[]:", JSON.stringify(active_daily_reset[condition + ""]));
            console.log(FUNC + "=======================active_daily_reset:", active_daily_reset);
        }
        console.log(FUNC + "2.active_daily_reset:", active_daily_reset);
        console.log(FUNC + "condition:", condition);
        console.log(FUNC + "val1:", val1);
        console.log(FUNC + "final_num:", final_num);
        console.log(FUNC + "active_daily_reset[condition]:", active_daily_reset[condition + ""]);
        if (active_daily_reset && active_daily_reset[condition + ""]) {
            active_daily_reset[condition + ""][val1 + ""] = final_num;
        }
        console.log(FUNC + "2.active_daily_reset:", active_daily_reset);
        account_in_cache.active_daily_reset = active_daily_reset;
    }
}

/**
 * 返回活动是否重复, 默认返回不重复.
 * @param condition 判断条件1.
 * @param val1 判断条件2.
 */
function getRepeatFromActiveQuest(cur_active_ids, condition, val1) {
    var activeid = 0;
    if (cur_active_ids && cur_active_ids.length > 0) {
        activeid = cur_active_ids[0];
    }
    for (var id in active_activequest_cfg) {
        var activequest = active_activequest_cfg[id];
        if (activequest.activeid == activeid
            && activequest.condition == condition
            && activequest.value1 == val1) {

            return activequest.repeat;
        }
    }
    return 0;// 默认返回不重复
}
