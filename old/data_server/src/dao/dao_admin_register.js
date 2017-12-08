
////////////////////////////////////////////////////////////
// Get register data with selected start_date and end_date
////////////////////////////////////////////////////////////
var utils = require('../buzz/utils');
var cfg = require('../buzz/cfg');
var StringUtil = require('../utils/StringUtil');
var DateUtil = require('../utils/DateUtil');
var DaoUtil = require('./dao_utils');

/**
 * 获取指定开始日期（含）到指定结束日期（含）的注册和绑定数据.
 * SQL语句如下
SELECT * FROM tbl_stat_day
WHERE log_date 
BETWEEN STR_TO_DATE('2016-10-08','%Y-%m-%d') 
AND STR_TO_DATE('2016-10-14','%Y-%m-%d')
 */
function _getRegisterData(pool, data, cb) {
    var start_date = data.start_date;
    var end_date = data.end_date;

    var sql = "";
    sql += "SELECT log_date, new_temp_account, new_nickname_account, new_bind_account FROM tbl_stat_day  ";
    sql += "WHERE log_date ";
    sql += "BETWEEN STR_TO_DATE('" + start_date + "','%Y-%m-%d') ";
    sql += "AND STR_TO_DATE('" + end_date + "','%Y-%m-%d')";
    console.log('sql: ', sql);
    
    var sql_data = [];
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log(JSON.stringify(err));
            cb(err);
        } else {
            if (result == null) {
                console.log('查询结果为空');
            }
            if (result.length == 0) {
                console.log('查询结果长度为0');
            }
            console.log("result: ", result);
            // 格式化日期数据
            for (var i = 0; i < result.length; i++) {
                var log_date = result[i]['log_date'];
                result[i]['log_date'] = DateUtil.pattern(log_date, 'yyyy-MM-dd');
            }
            cb(null, result);
        }
    });
}
exports.getRegisterData = _getRegisterData;