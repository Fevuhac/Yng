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
var TAG = "【update/level_mission】";


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
 * 账户数据更新(每日任务完成度).
 */
function _update(pool, data, cb, my_account) {
    const FUNC = TAG + "_update() --- ";
    if (DEBUG) console.log("CALL _updateLevelMission()");
    
    var account_id = my_account['id'];
    var token = my_account['token'];

    var level_mission_old = my_account['level_mission'];
    var level_mission_new = data['level_mission'] || level_mission_old;
    if (DEBUG) console.log("level_mission_old: ", level_mission_old);
    if (DEBUG) console.log("level_mission_new: ", level_mission_new);
        
    var json_level_mission_old = {};
    var json_level_mission_new = {};
    try {
        json_level_mission_old = ObjUtil.str2Data(level_mission_old);
        if (DEBUG) console.log("parse level_mission_old success");
        json_level_mission_new = ObjUtil.str2Data(level_mission_new);
        if (DEBUG) console.log("parse level_mission_new success");
    }
    catch (err_parse) {
        if (DEBUG) console.log(err_parse);
    }
        
    // TODO: 验证关卡数据
    // 关卡的每日免费次数只能减少
    // 关卡的每日可购买次数只能减少
    if (!(level_mission_old == null || level_mission_old == "{}")) {
        if (DEBUG) console.log("需要验证数据有效性");
        for (var key in json_level_mission_new) {
            if (DEBUG) console.log("key:" + key);
            var old_value = json_level_mission_old[key];// 获取旧值
            var new_value = json_level_mission_new[key];// 获取新值
            if (old_value > new_value) {
                cb(new Error("关卡攻关次数只能增加不能减少(关卡:" + key + ",旧数据:" + old_value + ",新数据:" + new_value + ")"));
                return;
            }
        }
    }
    
    
    //--------------------------------------------------------------------------
    // 更新缓存中的数据(重要:数据库操作将会被删除)
    //--------------------------------------------------------------------------
    CacheAccount.setLevelMission(account_id, level_mission_new);
    //--------------------------------------------------------------------------
        
    // 更新数据库中此账户的exp字段
    var sql = '';
    sql += 'UPDATE `tbl_account` ';
    sql += 'SET `level_mission`=? ';
    sql += 'WHERE `id`=? AND `token`=?';
        
    var sql_data = [ObjUtil.data2String(level_mission_new), account_id, token];
        
    if (DEBUG) console.log('sql: ', sql);
    if (DEBUG) console.log('sql_data: ', sql_data);
        
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.error(FUNC + "err:\n", err);
    	    console.error(FUNC + "sql:\n", sql);
    	    console.error(FUNC + "sql_data:\n", sql_data);
            cb(err);
        } else {
            cb(null, "success");
        }
    });
}


//==============================================================================
// private
//==============================================================================
