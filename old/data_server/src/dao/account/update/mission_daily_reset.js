////////////////////////////////////////////////////////////////////////////////
// Account Update Level Mission Function
// 账户数据更新(每日任务完成度，此字段会在每日凌晨重置)
// update
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var ObjUtil = require('../../../buzz/ObjUtil');
var AccountCommon = require('../common');
var CacheAccount = require('../../../buzz/cache/CacheAccount');

var DEBUG = 0;


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.update = _update;
exports.checkMissionDailyReset = checkMissionDailyReset;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 账户数据更新(每日任务完成度).
 */
function _update(pool, data, cb, my_account) {
    if (DEBUG) console.log("CALL mission_daily_reset.update()");
    
    var uid = my_account['id'];
    var token = my_account['token'];
    var json_mission_daily_reset_new = checkMissionDailyReset(my_account, data);
    var mission_daily_reset_new = ObjUtil.data2String(json_mission_daily_reset_new);
    
    
    //--------------------------------------------------------------------------
    // 更新缓存中的数据(重要:数据库操作将会被删除)
    //--------------------------------------------------------------------------
    CacheAccount.setMissionDailyReset(uid, json_mission_daily_reset_new);
    //--------------------------------------------------------------------------
    cb(null, "success");
}

function checkMissionDailyReset(my_account, data) {
    var mission_daily_reset_old = my_account['mission_daily_reset'];
    var mission_daily_reset_new = data['mission_daily_reset'] || mission_daily_reset_old;
    if (DEBUG) console.log("mission_daily_reset_old: ", mission_daily_reset_old);
    if (DEBUG) console.log("mission_daily_reset_new: ", mission_daily_reset_new);
        
    var json_mission_daily_reset_old = {};
    var json_mission_daily_reset_new = {};
    try {
        json_mission_daily_reset_old = ObjUtil.str2Data(mission_daily_reset_old);
        if (DEBUG) console.log("parse mission_daily_reset_old success");
        json_mission_daily_reset_new = ObjUtil.str2Data(mission_daily_reset_new);
        if (DEBUG) console.log("parse mission_daily_reset_new success");
    }
    catch (err_parse) {
        if (DEBUG) console.log(err_parse);
    }
        
    // DONE: 验证每日重置任务数据
    if (!(mission_daily_reset_old == null || mission_daily_reset_old == "{}")) {
        if (DEBUG) console.log("需要验证数据有效性");
        for (var key in json_mission_daily_reset_new) {
            if (DEBUG) console.log("key:" + key);
            var old_value = json_mission_daily_reset_old[key];// 获取旧值
            var new_value = json_mission_daily_reset_new[key];// 获取新值
            if (old_value == null) {
                break;
            }
                
            if (old_value > new_value) {
                // cb(new Error("每日任务的完成度只能增加不能减少(任务ID:" + key + ",旧数据:" + old_value + ",新数据:" + new_value + ")"));
                // return;
                console.error("每日任务的完成度只能增加不能减少(任务ID:" + key + ",旧数据:" + old_value + ",新数据:" + new_value + ")");
                json_mission_daily_reset_new[key] = old_value;
            }
            // 已经全部完成的任务, 不能再被客户端重置
            if (old_value == -1) {
                json_mission_daily_reset_new[key] = -1;
            }
        }
    }
    return json_mission_daily_reset_new;
}


//==============================================================================
// private
//==============================================================================
