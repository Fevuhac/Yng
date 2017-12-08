
////////////////////////////////////////////////////////////
// Get real time data with selected day and prev day
////////////////////////////////////////////////////////////
var utils = require('../buzz/utils');
var cfg = require('../buzz/cfg');
var StringUtil = require('../utils/StringUtil');
var DateUtil = require('../utils/DateUtil');
var DaoUtil = require('./dao_utils');

//==============================================================================
// var
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
var TAG = "【dao_admin_realtime】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getRealtimeData = _getRealtimeData;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 获取指定日期及前一天的新账户注册数据，账户登录数据.
 * SQL语句如下
SELECT created_at, new_account, login_count FROM tbl_stat_hour 
WHERE created_at 
BETWEEN DATE_SUB(STR_TO_DATE('2016-10-9','%Y-%m-%d'), INTERVAL 1 DAY) 
AND DATE_ADD(STR_TO_DATE('2016-10-9','%Y-%m-%d'), INTERVAL 1 DAY) 
 */
function _getRealtimeData(pool, data, cb) {
    const FUNC = TAG + "_getRealtimeData() --- ";

    var date = data.date;
    var prev_date = data.date;
    var sql = "";
    sql += "SELECT created_at, new_account, login_count, account_count FROM tbl_stat_hour  ";
    sql += "WHERE created_at ";
    sql += "BETWEEN DATE_SUB(STR_TO_DATE('" + date + "','%Y-%m-%d'), INTERVAL 1 DAY) ";
    sql += "AND DATE_ADD(STR_TO_DATE('" + date + "','%Y-%m-%d'), INTERVAL 1 DAY)";
    
    var sql_data = [];
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            if (ERROR) console.log(FUNC + "err:\n", err);
            if (ERROR) console.log(FUNC + "sql:\n", sql);
            if (ERROR) console.log(FUNC + "sql_data:\n", sql_data);
            cb(err);
        } else {
            // TODO: 格式化日期数据
            for (var i = 0; i < result.length; i++) {
                var from_date = result[i]['created_at'];
                //var to_date = from_date.pattern('yyyy-MM-dd HH');
                var to_date = DateUtil.pattern(from_date, 'yyyy-MM-dd HH');
                result[i]['created_at'] = to_date;
            }
            cb(null, result);
        }
    });
}