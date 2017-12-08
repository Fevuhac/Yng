
////////////////////////////////////////////////////////////
// Get pay user data with selected start_date and end_date
////////////////////////////////////////////////////////////
var utils = require('../buzz/utils');
var cfg = require('../buzz/cfg');
var StringUtil = require('../utils/StringUtil');
var DateUtil = require('../utils/DateUtil');
var DaoUtil = require('./dao_utils');

var TAG = "【dao_admin_payuser】";


exports.getOrderList = getOrderList;
exports.getPayUserData = _getPayUserData;
exports.getPayLogData = _getPayLogData;
exports.getQueryPay = _getQueryPay;
exports.getUserPayData = getUserPayData;
exports.getCardUserList = getCardUserList;

/**
 * 根据成功订单获取支付统计数据.
 */
function getOrderList(pool, data, cb) {

}

/**
 * 获取指定开始日期（含）到指定结束日期（含）的付费账户数据.
 * SQL语句如下
SELECT log_date, (new_temp_account + new_nickname_account) AS new_account, shop_time_count, shop_account_count, shop_tpa, shop_pafft, shop_paffd, shop_pta, shop_arpu, shop_arrpu 
FROM tbl_stat_day
WHERE log_date 
BETWEEN STR_TO_DATE('2016-10-08','%Y-%m-%d') 
AND STR_TO_DATE('2016-11-18','%Y-%m-%d')
 */
function _getPayUserData(pool, data, cb) {
    var start_date = data.start_date;
    var end_date = data.end_date;
    
    var sql = "";
    sql += "SELECT ";
    // 返回值列表
    sql += "log_date, ";
    sql += "(new_temp_account + new_nickname_account) AS new_account, ";
    sql += "(nickname_count + temp_count) AS active_account, ";
    sql += "shop_time_count, ";
    sql += "shop_account_count, ";
    sql += "shop_tpa, ";
    sql += "shop_pafft, ";
    sql += "shop_paffd, ";
    sql += "shop_pta, ";
    sql += "shop_arpu, ";
    sql += "shop_arrpu ";
    // 查询约束
    sql += "FROM tbl_stat_day ";
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
            // 格式化数据
            for (var i = 0; i < result.length; i++) {
                var log_date = result[i]['log_date'];
                result[i]['log_date'] = DateUtil.pattern(log_date, 'yyyy-MM-dd');
                result[i]['shop_tpa'] = (result[i]['shop_tpa'] / 100).toFixed(2);
            }
            cb(null, result);
        }
    });
}

/**
 * 根据历史的账号来返回该账号下的成功订单总金额
SELECT 
game_account_id, 
channel_account_id, 
SUM(money) AS total_money, 
COUNT(money) AS total_count 
FROM tbl_order 
WHERE status=0 
GROUP BY channel_account_id 
ORDER BY total_money DESC
 */
function getUserPayData(pool, cb) {
    const FUNC = TAG + "getUserPayData";
    
    var sql = "";
    sql += "SELECT ";
    // 返回值列表
    sql += "o.game_account_id AS uid, ";
    sql += "o.channel_account_id AS cid, ";
    sql += "a.channel_account_name AS nickname, ";
    sql += "a.level AS level, ";
    sql += "a.rmb AS rmb, ";
    sql += "a.vip AS vip, ";
    sql += "SUM(o.money)/10 AS total_money, ";
    sql += "COUNT(o.money) AS total_count ";
    // 查询约束
    sql += "FROM tbl_account AS a, tbl_order AS o ";
    sql += "WHERE o.status=0 ";
    sql += "AND o.game_account_id=a.id ";
    sql += "GROUP BY o.channel_account_id ";
    sql += "ORDER BY total_money DESC ";
    console.log('sql: ', sql);
    
    var sql_data = [];
    
    pool.query(sql, sql_data, function (err, results) {
        if (err) {
            console.log(JSON.stringify(err));
            cb(err);
        } else {
            cb(null, results);
        }
    });
}

/**
 * 获取月卡用户的列表数据.
 */
function getCardUserList(pool, cb) {
    const FUNC = TAG + "getCardUserList";
    
    var sql = "";
    sql += "SELECT ";
    // 返回值列表
    sql += "a.id AS uid, ";
    sql += "a.channel_account_name AS nickname, ";
    sql += "a.card AS card, ";
    sql += "a.get_card AS get_card, ";
    sql += "s.sid AS sid ";
    // 查询约束
    sql += "FROM tbl_account AS a, tbl_account_server AS s ";
    sql += "WHERE a.card<>'{}' ";
    sql += "AND a.id=s.uid ";
    console.log('sql: ', sql);
    
    var sql_data = [];
    
    pool.query(sql, sql_data, function (err, results) {
        if (err) {
            console.error(FUNC + "err:\n", err);
            cb(err);
        } else {
            cb(null, results);
        }
    });
}

/**
 * 获取指定开始日期（含）到指定结束日期（含）的付费账户数据.
 * SQL语句如下
SELECT * 
FROM tbl_order
WHERE created_at 
BETWEEN STR_TO_DATE('2017-05-15','%Y-%m-%d') 
AND STR_TO_DATE('2017-05-16','%Y-%m-%d')
AND status=0
 */
function _getPayLogData(pool, data, cb) {
    var start_date = data.start_date;
    var end_date = data.end_date;

    end_date = DateUtil.getNextDay(end_date);

    var sql = "";
    sql += "SELECT * ";
    // 查询约束
    sql += "FROM tbl_order ";
    sql += "WHERE created_at ";
    sql += "BETWEEN STR_TO_DATE('" + start_date + "','%Y-%m-%d') ";
    sql += "AND STR_TO_DATE('" + end_date + "','%Y-%m-%d') ";
    sql += "AND status=0 ";
    
    var sql_data = [];

    _handleQueryTblOder(pool, sql, sql_data, cb);
}

/**
 * 获取指定开始日期（含）到指定结束日期（含）的付费账户数据.
 * SQL语句如下
SELECT * 
FROM tbl_order
WHERE created_at 
BETWEEN STR_TO_DATE('2016-10-08','%Y-%m-%d') 
AND STR_TO_DATE('2016-11-18','%Y-%m-%d')
AND status=0
 */
function _getQueryPay(pool, data, cb) {
    var game_order_id = data['game_order_id'];
    var game_account_id = data['game_account_id'];
    
    if (game_order_id != null && game_order_id != "") {
        _queryOrderId(pool, data, cb);
    }
    else if (game_account_id != null && game_account_id != "") {
        _queryAccountId(pool, data, cb);
    }
}

// 根据game_order_id查询单一订单信息
function _queryOrderId(pool, data, cb) {
    var game_order_id = data['game_order_id'];

    var sql = "";
    sql += "SELECT * ";
    // 查询约束
    sql += "FROM tbl_order ";
    sql += "WHERE game_order_id=? ";
    sql += "AND status=0 ";
    
    var sql_data = [game_order_id];

    _handleQueryTblOder(pool, sql, sql_data, cb);
}

// 根据game_account_id查询多条订单信息
function _queryAccountId(pool, data, cb) {
    var game_account_id = data['game_account_id'];

    var sql = "";
    sql += "SELECT * ";
    // 查询约束
    sql += "FROM tbl_order ";
    sql += "WHERE game_account_id=? ";
    sql += "AND status=0 ";
    
    var sql_data = [game_account_id];

    _handleQueryTblOder(pool, sql, sql_data, cb);
}

// 处理查询tbl_order表的结果
function _handleQueryTblOder(pool, sql, sql_data, cb) {
    
    console.log('sql: ', sql);
    console.log('sql_data: ', sql_data);

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
            //console.log("result: ", result);
            // 格式化数据
            for (var i = 0; i < result.length; i++) {
                var created_at = result[i]['created_at'];
                result[i]['created_at'] = DateUtil.pattern(created_at, 'yyyy-MM-dd HH:mm:ss (EEE)');
                if (result[i]['channel_cb'] != null) {
                    result[i]['channel_cb'] = JSON.parse(result[i]['channel_cb']);
                }
            }
            console.log("result: ", result);
            cb(null, result);
        }
    });
}