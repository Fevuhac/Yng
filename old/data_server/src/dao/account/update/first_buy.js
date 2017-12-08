////////////////////////////////////////////////////////////////////////////////
// Account Update First Buy
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
var TAG = "【update/first_buy】";


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
    if (DEBUG) console.log("CALL first_buy.update()");
    
    var account_id = my_account['id'];
    var token = my_account['token'];
    
    var first_buy_old = my_account['first_buy'];
    var first_buy_new = data['first_buy'] || first_buy_old;
    if (DEBUG) console.log("first_buy_old: ", first_buy_old);
    if (DEBUG) console.log("first_buy_new: ", first_buy_new);
        
    var json_first_buy_old = {};
    var json_first_buy_new = {};
    try {
        json_first_buy_old = ObjUtil.str2Data(first_buy_old);
        if (DEBUG) console.log("parse first_buy_old success");
        json_first_buy_new = ObjUtil.str2Data(first_buy_new);
        if (DEBUG) console.log("parse first_buy_new success");
    }
    catch (err_parse) {
        if (DEBUG) console.log(err_parse);
    }
        
    // DONE: 验证首充数据
    if (!(first_buy_old == null || first_buy_old == "{}")) {
        if (DEBUG) console.log("需要验证数据有效性");
        for (var key in json_first_buy_new) {
            if (DEBUG) console.log("key:" + key);
            var old_value = json_first_buy_old[key];// 获取旧值
            var new_value = json_first_buy_new[key];// 获取新值
            if (old_value == null) {
                break;
            }
                
            if (old_value > new_value) {
                cb(new Error("首充次数只能增加不能减少(关卡:" + key + ",旧数据:" + old_value + ",新数据:" + new_value + ")"));
                return;
            }
        }
    }
    
    //--------------------------------------------------------------------------
    // 更新缓存中的数据(重要:数据库操作将会被删除)
    //--------------------------------------------------------------------------
    CacheAccount.setFirstBuy(account_id, json_first_buy_new);
    //--------------------------------------------------------------------------
        
    // 更新数据库中此账户的exp字段
    var sql = '';
    sql += 'UPDATE `tbl_account` ';
    sql += 'SET `first_buy`=? ';
    sql += 'WHERE `id`=? AND `token`=?';
        
    var sql_data = [first_buy_new, account_id, token];
        
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
