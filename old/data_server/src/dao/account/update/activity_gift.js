////////////////////////////////////////////////////////////////////////////////
// Account Update Activity Gift
// 账户数据更新(活动礼包)
// update
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var ObjUtil = require('../../../buzz/ObjUtil');
var AccountCommon = require('../common');
var CacheAccount = require('../../../buzz/cache/CacheAccount');

var DEBUG = 0;
var TAG = "【update/activity_gift】";


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
 * 账户数据更新(活动礼包).
 */
function _update(pool, data, cb, my_account) {
    const FUNC = TAG + "_update() --- ";
    if (DEBUG) console.log("CALL activity_gift.update()");
    
    var account_id = my_account['id'];
    var token = my_account['token'];
    
    var activity_gift_old = my_account['activity_gift'];
    var activity_gift_new = data['activity_gift'] || activity_gift_old;
    if (DEBUG) console.log("activity_gift_old: ", activity_gift_old);
    if (DEBUG) console.log("activity_gift_new: ", activity_gift_new);
        
    var json_activity_gift_old = {};
    var json_activity_gift_new = {};
    try {
        json_activity_gift_old = ObjUtil.str2Data(activity_gift_old);
        if (DEBUG) console.log("parse activity_gift_old success");
        json_activity_gift_new = ObjUtil.str2Data(activity_gift_new);
        if (DEBUG) console.log("parse activity_gift_new success");
    }
    catch (err_parse) {
        if (DEBUG) console.log(err_parse);
    }
        
    // TODO: 验证活动礼包数据
    if (!(activity_gift_old == null || activity_gift_old == "{}")) {
        if (DEBUG) console.log("需要验证数据有效性");
        for (var key in json_activity_gift_new) {
            if (DEBUG) console.log("key:" + key);
            var old_value = json_activity_gift_old[key];// 获取旧值
            var new_value = json_activity_gift_new[key];// 获取新值
            if (old_value == null) {
                break;
            }

            if (old_value['version'] > new_value['verison']) {
                cb(new Error("礼包版本只能增加不能减少(关卡:" + key + ",旧数据:" + old_value['version'] + ",新数据:" + new_value['version'] + ")"));
                return;
            }
            if (old_value['buycount'] > new_value['buycount']) {
                cb(new Error("礼包购买次数只能增加不能减少(关卡:" + key + ",旧数据:" + old_value['buycount'] + ",新数据:" + new_value['buycount'] + ")"));
                return;
            }
        }
    }
    
    //--------------------------------------------------------------------------
    // 更新缓存中的数据(重要:数据库操作将会被删除)
    //--------------------------------------------------------------------------
    CacheAccount.setActivityGift(account_id, ObjUtil.str2Data(activity_gift_new));
    //--------------------------------------------------------------------------
        
    // 更新数据库中此账户的exp字段
    var sql = '';
    sql += 'UPDATE `tbl_account` ';
    sql += 'SET `activity_gift`=? ';
    sql += 'WHERE `id`=? AND `token`=?';
        
    var sql_data = [activity_gift_new, account_id, token];
        
    if (DEBUG) console.log('sql: ', sql);
    if (DEBUG) console.log('sql_data: ', sql_data);
        
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            // if (DEBUG) console.log('[ERROR] activity_gift.update()');
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
