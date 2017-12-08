////////////////////////////////////////////////////////////////////////////////
// Account Update Misson Only Once
// 账户数据更新(只会出现一次的任务)
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
exports.checkMissionOnlyOnce = checkMissionOnlyOnce;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 账户数据更新(一次任务).
 */
function _update(pool, data, cb, my_account) {
    if (DEBUG) console.log("CALL mission_only_once.update()");
    
    var account_id = my_account['id'];
    var token = my_account['token'];
    var json_mission_only_once_new = checkMissionOnlyOnce(my_account, data);
    var mission_only_once_new = ObjUtil.data2String(json_mission_only_once_new);
    
    //--------------------------------------------------------------------------
    // 更新缓存中的数据(重要:数据库操作将会被删除)
    //--------------------------------------------------------------------------
    CacheAccount.setMissionOnlyOnce(account_id, json_mission_only_once_new);
    //--------------------------------------------------------------------------
    cb(null, "success");
}

function checkMissionOnlyOnce(my_account, data) {
    var mission_only_once_old = my_account['mission_only_once'];
    var mission_only_once_new = data['mission_only_once'] || mission_only_once_old;
    if (DEBUG) console.log("mission_only_once_old: ", mission_only_once_old);
    if (DEBUG) console.log("mission_only_once_new: ", mission_only_once_new);
        
    var json_mission_only_once_old = {};
    var json_mission_only_once_new = {};
    try {
        json_mission_only_once_old = ObjUtil.str2Data(mission_only_once_old);
        if (DEBUG) console.log("parse mission_only_once_old success");
        json_mission_only_once_new = ObjUtil.str2Data(mission_only_once_new);
        if (DEBUG) console.log("parse mission_only_once_new success");
    }
    catch (err_parse) {
        if (DEBUG) console.log(err_parse);
    }
        
    // TODO: 验证一次任务数据
    if (!(mission_only_once_old == null || mission_only_once_old == "{}")) {
        if (DEBUG) console.log("需要验证数据有效性");
        for (var key in json_mission_only_once_new) {
            if (DEBUG) console.log("key:" + key);
            var old_value = json_mission_only_once_old[key];// 获取旧值
            var new_value = json_mission_only_once_new[key];// 获取新值
            if (old_value == null) {
                break;
            }
                
            if (old_value > new_value) {
                // cb(new Error("一次任务的完成度只能增加不能减少(任务ID:" + key + ",旧数据:" + old_value + ",新数据:" + new_value + ")"));
                // return;
                console.error("一次任务的完成度只能增加不能减少(任务ID:" + key + ",旧数据:" + old_value + ",新数据:" + new_value + ")");
                json_mission_only_once_new[key] = old_value;
            }
            // 已经全部完成的任务, 不能再被客户端重置
            if (old_value == -1) {
                json_mission_only_once_new[key] = -1;
            }
        }
    }
    return json_mission_only_once_new;
}


//==============================================================================
// private
//==============================================================================