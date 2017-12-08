
////////////////////////////////////////////////////////////
// Get real time data with selected day and prev day
////////////////////////////////////////////////////////////
var _ = require('underscore');
var utils = require('../../buzz/utils');
var cfg = require('../../buzz/cfg');
var StringUtil = require('../../utils/StringUtil');
var DateUtil = require('../../utils/DateUtil');
var DaoUtil = require('../dao_utils');

var DEBUG = 0;
var ERROR = 0;
var TAG = "【dao/admin/online】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getOnlineStatus = getOnlineStatus;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

// /**
//  * 获取指定日期的新账户注册数据，账户登录数据.
//  * SQL语句如下
// SELECT COUNT(DISTINCT `uid`) AS link_count, 
// ROUND(UNIX_TIMESTAMP(`linked_at`) / 60) AS timekey, 
// FROM_UNIXTIME(ROUND(UNIX_TIMESTAMP(`linked_at`) / 60) * 60) AS time_minute
// FROM `tbl_link_log` 
// WHERE `linked_at` 
// BETWEEN DATE_SUB(STR_TO_DATE('2017-06-05','%Y-%m-%d'), INTERVAL 1 DAY) 
// AND DATE_ADD(STR_TO_DATE('2017-06-05','%Y-%m-%d'), INTERVAL 1 DAY)
// GROUP BY timekey
//  */
// function getOnlineStatus(pool, data, cb) {
//     var date = data.date;
//     var prev_date = data.date;
//     var sql = "";
//     sql += "SELECT ";
//     sql += "COUNT(DISTINCT `uid`) AS link_count, ";
//     sql += "FLOOR(UNIX_TIMESTAMP(`linked_at`) / 60) AS timekey, ";
//     sql += "FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(`linked_at`) / 60) * 60) AS time_minute ";
//     sql += "FROM `tbl_link_log` ";
//     sql += "WHERE `linked_at` ";
//     sql += "BETWEEN DATE_SUB(STR_TO_DATE('" + date + "','%Y-%m-%d'), INTERVAL 0 DAY) ";
//     sql += "AND DATE_ADD(STR_TO_DATE('" + date + "','%Y-%m-%d'), INTERVAL 1 DAY) ";
//     sql += "GROUP BY timekey ";
//     console.log('sql: ', sql);
    
//     var sql_data = [];
    
//     pool.query(sql, sql_data, function (err, result) {
//         if (err) {
//             console.log(JSON.stringify(err));
//             cb(err);
//         } else {
//             var link_count = _.max(result, function(link){ return link.link_count; });
//             var link_time = getLinkTime(result, link_count);
//             var max_link = {
//                 link_count: link_count,
//                 link_time: link_time,
//             };
//             cb(null, result);
//         }
//     });
// }


/**
 * 获取指定日期的账户在线数据(tbl_link_sum).
 * SQL语句如下
 */
function getOnlineStatus(pool, data, cb) {
    const FUNC = TAG + "getOnlineStatus() --- ";

    var start_time = data.start_time;
    var end_time = data.end_time;

    var sql = "";
    // sql += "SELECT * ";
    sql += "SELECT time, online_count, link_count ";
    sql += "FROM `tbl_link_sum` ";
    sql += "WHERE ";
    sql += "`time`>'" + start_time + "' ";
    sql += "AND `time`<'" + end_time + "' ";
    sql += "GROUP BY time ";
    if (DEBUG) console.log('sql: ', sql);
    
    var sql_data = [];
    
    pool.query(sql, sql_data, function (err, results) {
        if (err) {
            if (ERROR) console.error(FUNC + "err:\n", err);
            if (ERROR) console.error(FUNC + "sql:\n", sql);
            if (ERROR) console.error(FUNC + "sql_data:\n", sql_data);
            cb(err);
            return;
        }
        console.log(FUNC + "results:\n", results);

        var ret = [];
        for (var i = 0; i < results.length; i++) {

        }

        cb(null, results);
    });
}

// function getLinkTime(result, link_count) {
//     for (var idx in result) {
//         if (result[idx].link_count == link_count) {
//             return result[idx].time_minute;
//         }
//     }
// }