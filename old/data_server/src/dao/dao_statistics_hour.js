
////////////////////////////////////////////////////////////
// Statistics Related (Every Hour)
////////////////////////////////////////////////////////////
var utils = require('../buzz/utils');
var cfg = require('../buzz/cfg');
var StringUtil = require('../utils/StringUtil');
var DaoUtil = require('./dao_utils');

// var SQL_LAST_HOUR = "BETWEEN DATE_SUB(DATE_FORMAT(NOW(),'%Y-%m-%d %H:00:00'),INTERVAL 1 HOUR) AND DATE_FORMAT(NOW(),'%Y-%m-%d %H:00:00')";
// var SQL_THIS_HOUR = "BETWEEN DATE_FORMAT(NOW(),'%Y-%m-%d %H:00:00') AND DATE_ADD(DATE_FORMAT(NOW(),'%Y-%m-%d %H:00:00'),INTERVAL 1 HOUR)";


//==============================================================================
// var
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
var TAG = "【dao_statistics_hour】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.sumUpLastHour = sumUpLastHour;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 每小时产生统计数据(上一小时的数据)
 */
function sumUpLastHour(pool, data, cb) {
    const FUNC = TAG + "sumUpLastHour() --- ";

    // 统计前一小时的注册账户数
    _getSqlNewAccount(pool, data, function (err1, new_account) {
        _getSqlLoginCount(pool, data, function (err2, login_count) {
            _getSqlAccountCount(pool, data, function (err2, account_count) {
                if (DEBUG) console.log(FUNC + 'new_account:', new_account);
                if (DEBUG) console.log(FUNC + 'login_count:', login_count);
                if (DEBUG) console.log(FUNC + 'account_count:', account_count);
                _insertData(pool, data, new_account, login_count, account_count, function (err3, result) {
                    //cb(null, result);
                });
            });
        });
    });
};

//==============================================================================
// private
//==============================================================================
/**
 * 插入每小时的统计数据.
 * @param new_account 上一小时新增账户数.
 * @param login_count 上一小时登录次数.
 * @param account_count 上一小时登录用户数.
 */
function _insertData(pool, data, new_account, login_count, account_count, cb) {
    const FUNC = TAG + "_insertData() --- ";

    var start_time = data.start_time;

    var sql = "";
    sql += "INSERT INTO tbl_stat_hour ";
    sql += "(created_at, new_account, login_count, account_count) ";
    sql += "VALUES ('" + start_time + "',?,?,?) ";
    
    var sql_data = [new_account, login_count, account_count];
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            if (ERROR) console.log(FUNC + "err:\n", err);
            if (ERROR) console.log(FUNC + "sql:\n", sql);
            if (ERROR) console.log(FUNC + "sql_data:\n", sql_data);
            cb(err);
        } else {
            cb(null, result);
        }
    });
}

/**
 * 获取上一小时的新增用户数.
SELECT COUNT(id) new_account 
FROM tbl_account 
WHERE created_at>='2017-09-05 18:00:00' AND created_at<'2017-09-05 19:00:00'
 */
function _getSqlNewAccount(pool, data, cb) {
    const FUNC = TAG + "_getSqlNewAccount() --- ";

    var start_time = data.start_time;
    var end_time = data.end_time;

    var sql = "";
    sql += "SELECT COUNT(id) new_account ";
    sql += "FROM tbl_account ";
    // sql += "WHERE created_at ";
    // sql += SQL_THIS_HOUR;
    sql += "WHERE created_at>='" + start_time + "' ";
    sql += "AND created_at<'" + end_time + "' ";
    
    var sql_data = [];
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            if (ERROR) console.log(FUNC + "err:\n", err);
            if (ERROR) console.log(FUNC + "sql:\n", sql);
            if (ERROR) console.log(FUNC + "sql_data:\n", sql_data);
            cb(err);
        } else {
            cb(null, result[0].new_account);
        }
    });
}

/**
 * 获取上一小时的登录操作次数.
SELECT COUNT(account_id) AS login_count 
FROM tbl_login_log 
WHERE log_at>='2017-09-05 18:00:00' AND log_at<'2017-09-05 19:00:00'
 */
function _getSqlLoginCount(pool, data, cb) {
    const FUNC = TAG + "_getSqlLoginCount() --- ";

    var start_time = data.start_time;
    var end_time = data.end_time;

    var sql = "";
    sql += "SELECT COUNT(account_id) AS login_count ";
    sql += "FROM tbl_login_log ";
    // sql += "WHERE log_at ";
    // sql += SQL_THIS_HOUR;
    sql += "WHERE log_at>='" + start_time + "' ";
    sql += "AND log_at<'" + end_time + "' ";
    
    var sql_data = [];
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            if (ERROR) console.log(FUNC + "err:\n", err);
            if (ERROR) console.log(FUNC + "sql:\n", sql);
            if (ERROR) console.log(FUNC + "sql_data:\n", sql_data);
            cb(err);
        } else {
            cb(null, result[0].login_count);
        }
    });
}

/**
 * 获取上一小时的登录用户数.
SELECT COUNT(DISTINCT account_id) AS account_count 
FROM tbl_login_log 
WHERE log_at>='2017-09-05 18:00:00' AND log_at<'2017-09-05 19:00:00'
 */
function _getSqlAccountCount(pool, data, cb) {
    const FUNC = TAG + "_getSqlAccountCount() --- ";

    var start_time = data.start_time;
    var end_time = data.end_time;

    var sql = "";
    sql += "SELECT COUNT(DISTINCT account_id) AS account_count ";
    sql += "FROM tbl_login_log ";
    // sql += "WHERE log_at ";
    // sql += SQL_THIS_HOUR;
    sql += "WHERE log_at>='" + start_time + "' ";
    sql += "AND log_at<'" + end_time + "' ";
    
    var sql_data = [];
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            if (ERROR) console.log(FUNC + "err:\n", err);
            if (ERROR) console.log(FUNC + "sql:\n", sql);
            if (ERROR) console.log(FUNC + "sql_data:\n", sql_data);
            cb(err);
        } else {
            cb(null, result[0].account_count);
        }
    });
}
