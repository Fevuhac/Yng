
////////////////////////////////////////////////////////////
// Get real time data with selected day and prev day
////////////////////////////////////////////////////////////
var utils = require('../buzz/utils');
var cfg = require('../buzz/cfg');
var StringUtil = require('../utils/StringUtil');
var DateUtil = require('../utils/DateUtil');
var DaoUtil = require('./dao_utils');
var DaoCommon = require('./dao_common');

var TAG = "【dao_admin_fill_data】";

exports.fillDayData = fillDayData;

/**
 * 填充指定日期的数据，这样查询每日数据可以直接从tbl_stat_day中读取.
 * SQL语句如下
INSERT INTO tbl_stat_day
(log_date, new_temp_account, new_nickname_account, new_bind_account)
VALUES
('2016-10-12', 1, 1, 1)
,('2016-10-13', 1, 1, 1)
,('2016-10-14', 1, 1, 1)
 */
function fillDayData(pool, data, cb) {
    var start_date = data.start_date;
    var end_date = data.end_date;
    
    _getDayData(pool, data, function (err_r, results) {
        if (err_r) {
            console.log(JSON.stringify(err_r));
            cb(err_r);
            return;
        }
        //cb(null, results);
        
        var insert_table = "(";
        insert_table += "log_date ";
        insert_table += ", new_temp_account ";
        insert_table += ", new_nickname_account ";
        insert_table += ", new_bind_account ";
        insert_table += ", nickname_login ";
        insert_table += ", temp_login ";
        insert_table += ", nickname_count ";
        insert_table += ", temp_count ";
        insert_table += ", drr ";
        insert_table += ", wrr ";
        insert_table += ", mrr ";
        insert_table += ", shop_time_count ";
        insert_table += ", shop_account_count ";
        insert_table += ", shop_tpa ";
        insert_table += ", shop_pafft ";
        insert_table += ", shop_paffd ";
        insert_table += ", shop_pta ";
        insert_table += ", shop_arpu ";
        insert_table += ", shop_arrpu ";
        insert_table += ") ";
        
        var sql = "";
        sql += "REPLACE INTO tbl_stat_day  ";// 使用REPLACE这样已有的数据就会做替换而没有的数据则插入
        sql += insert_table;
        sql += "VALUES ";
        for (var i = 0; i < results.length; i++) {
            if (i > 0) {
                sql += ", ";
            }
            sql += "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        }
        console.log('sql: ', sql);
        
        var sql_data = [];
        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            sql_data.push(result.log_date);
            sql_data.push(result.new_temp_account);
            sql_data.push(result.new_nickname_account);
            sql_data.push(result.new_bind_account);
            sql_data.push(result.nickname_login);
            sql_data.push(result.temp_login);
            sql_data.push(result.nickname_count);
            sql_data.push(result.temp_count);
            sql_data.push(result.drr);
            sql_data.push(result.wrr);
            sql_data.push(result.mrr);
            sql_data.push(result.shop_time_count);
            sql_data.push(result.shop_account_count);
            sql_data.push(result.shop_tpa);
            sql_data.push(result.shop_pafft);
            sql_data.push(result.shop_paffd);
            sql_data.push(result.shop_pta);
            sql_data.push(result.shop_arpu);
            sql_data.push(result.shop_arrpu);
        }
        
        pool.query(sql, sql_data, function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                cb(err);
            } else {
                // myDao.sumUpLastDay参数中的cb没有第二个参数造成异常
                cb(null, rows);
            }
        });
    });
}

function _getDayData(pool, data, cb) {
    const FUNC = TAG + "_getDayData() --- ";

    console.log(FUNC + "data:", data);

    var start_date = data.start_date;
    var end_date = data.end_date;
    
    // 获取时间段内有多少天(包含起始日期需要+1)
    var day_count = DateUtil.dateDiff(start_date, end_date) + 1;
    var results = _fillDefaultData(day_count, start_date);

    _getNewTempAccount(pool, data, function (err_t, results_t) {
        if (DaoCommon.handleError(err_t, cb)) return;
        _fillNewTempAccount(results, results_t);

        _getNewNicknameAccount(pool, data, function (err_n, results_n) {
            if (DaoCommon.handleError(err_n, cb)) return;
            _fillNewNicknameAccount(results, results_n);
            
            _getBindData(pool, data, function (err_b, results_b) {
                if (DaoCommon.handleError(err_b, cb)) return;
                _fillNewBindAccount(results, results_b);
                
                _getActiveData(pool, data, function (err_l, results_l) {
                    if (DaoCommon.handleError(err_l, cb)) return;
                    _fillLoginData(results, results_l);

                    _getRetentionData(pool, data, function (results_r) {
                        _fillRetentionData(results, results_r);
                        
                        _getShopData(pool, data, function (err_s, results_s) {
                            if (DaoCommon.handleError(err_s, cb)) return;
                            _fillShopData(results, results_s);
                            
                            cb(null, results);
                        });
                    })
                });
            });
        });
    });
}

//==============================================================================
// Fill data
//==============================================================================

function _fillDefaultData(day_count, start_date) {
    console.log("day_count: " + day_count);
    var results = [];
    for (var i = 0; i < day_count; i++) {
        // DONE: 计算插入的日期数据
        var insert_date = DateUtil.getDateOffset(i, new Date(start_date));
        var result = {
            log_date: insert_date,
            new_temp_account: 0,
            new_nickname_account: 0,
            new_bind_account: 0,
            nickname_login: 0,
            temp_login: 0,
            nickname_count: 0,
            temp_count: 0,
            drr: 0,
            wrr: 0,
            mrr: 0,
            shop_time_count: 0,
            shop_account_count: 0,
            shop_tpa: 0,
            shop_pafft: 0,
            shop_paffd: 0,
            shop_pta: 0,
            shop_arpu: 0,
            shop_arrpu: 0
        };
        results[i] = result;
    }
    return results;
}

function _fillNewTempAccount(results, results_t) {
    //console.log("results_t: ", results_t);
    for (var i = 0; i < results_t.length; i++) {
        var result_t = results_t[i];
        var patternDate = DateUtil.pattern(result_t.regist_date, "yyyy-MM-dd");
        console.log(i + ")patternDate: ", patternDate);
        for (var j = 0; j < results.length; j++) {
            var result = results[j];
            if (result.log_date == patternDate) {
                results[j].new_temp_account = result_t.new_temp_account;
                break;
            }
        }
    }
}

function _fillNewNicknameAccount(results, results_n) {
    //console.log("results_n: ", results_n);
    for (var i = 0; i < results_n.length; i++) {
        var result_n = results_n[i];
        var patternDate = DateUtil.pattern(result_n.regist_date, "yyyy-MM-dd");
        console.log(i + ")patternDate: ", patternDate);
        for (var j = 0; j < results.length; j++) {
            var result = results[j];
            if (result.log_date == patternDate) {
                results[j].new_nickname_account = result_n.new_nickname_account;
                break;
            }
        }
    }
}

function _fillNewBindAccount(results, results_b) {
    //console.log("results_b: ", results_b);
    for (var i = 0; i < results_b.length; i++) {
        var result_b = results_b[i];
        var patternDate = DateUtil.pattern(result_b.log_date, "yyyy-MM-dd");
        console.log(i + ")patternDate: ", patternDate);
        for (var j = 0; j < results.length; j++) {
            var result = results[j];
            if (result.log_date == patternDate) {
                results[j].new_bind_account = result_b.new_bind_account;
                break;
            }
        }
    }
}

function _fillLoginData(results, results_l) {
    //console.log("results_l: ", results_l);
    for (var i = 0; i < results_l.length; i++) {
        var result_l = results_l[i];
        var patternDate = DateUtil.pattern(result_l.log_date, "yyyy-MM-dd");
        console.log(i + ")patternDate: ", patternDate);
        for (var j = 0; j < results.length; j++) {
            var result = results[j];
            if (result.log_date == patternDate) {
                results[j].nickname_login = result_l.nickname_login;
                results[j].temp_login = result_l.temp_login;
                results[j].nickname_count = result_l.nickname_count;
                results[j].temp_count = result_l.temp_count;
                break;
            }
        }
    }
}

function _fillRetentionData(results, results_r) {
    // 完成次日留存数据的填充
    console.log("results_r: ", results_r);
    for (var i = 0; i < results_r.length; i++) {
        var result_r = results_r[i];
        if (result_r != null && result_r.log_date != null) {
            //var patternDate = DateUtil.pattern(result_r.log_date, "yyyy-MM-dd");
            var patternDate = result_r.log_date;
            console.log(i + ")patternDate: ", patternDate);
            for (var j = 0; j < results.length; j++) {
                var result = results[j];
                if (result.log_date == patternDate) {
                    results[j].drr = result_r.drr;
                    results[j].wrr = result_r.wrr;
                    results[j].mrr = result_r.mrr;
                    break;
                }
            }
        }
    }
}

function _fillShopData(results, results_s) {
    // 完成每日商城数据的填充
    console.log("results_s: ", results_s);
    for (var i = 0; i < results_s.length; i++) {
        var result_s = results_s[i];
        if (result_s != null && result_s.count_date != null) {
            //var patternDate = DateUtil.pattern(result_r.log_date, "yyyy-MM-dd");
            var patternDate = DateUtil.pattern(result_s.count_date, "yyyy-MM-dd");
            console.log(i + ")patternDate: ", patternDate);
            for (var j = 0; j < results.length; j++) {
                var result = results[j];
                if (result.log_date == patternDate) {
                    results[j].shop_time_count = result_s.shop_time_count;
                    results[j].shop_account_count = result_s.shop_account_count;
                    results[j].shop_tpa = result_s.shop_tpa;
                    results[j].shop_pafft = result_s.shop_pafft;
                    results[j].shop_paffd = result_s.shop_paffd;
                    break;
                }
            }
        }
    }
}

//==============================================================================
// Get data
//==============================================================================

function _getNewTempAccount(pool, data, cb) {
    _getRegistData(pool, data, true, function (err, results) {
        cb(err, results);
    });
}

function _getNewNicknameAccount(pool, data, cb) {
    _getRegistData(pool, data, false, function (err, results) {
        cb(err, results);
    });
}

/**
 * 获取指定日期的注册数据.
 * SQL查询如下，其中[NOT]的有无决定了账户是否为临时账户.
SELECT COUNT(created_at) AS regist_count, DATE(created_at) AS regist_date
FROM tbl_account
WHERE
`password` IS [NOT] NULL AND
created_at
BETWEEN STR_TO_DATE('2016-10-08','%Y-%m-%d') 
AND STR_TO_DATE('2016-10-15','%Y-%m-%d')
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) ASC;
 */
function _getRegistData(pool, data, isTemp, cb) {
    var start_date = data.start_date;
    var end_date = data.end_date;
    
    // 直接查询不会包含end_date, 需要对数据进行处理
    end_date = DateUtil.getDateOffset(1, new Date(end_date));
    
    var regist_type = isTemp ? 'new_temp_account' : 'new_nickname_account ';
    var temp_str = isTemp ? '' : 'NOT ';
    
    var sql = "";
    sql += "SELECT COUNT(created_at) AS " + regist_type + ", DATE(created_at) AS regist_date ";
    sql += "FROM tbl_account ";
    sql += "WHERE ";
    sql += "`password` IS " + temp_str + "NULL AND ";
    sql += "created_at ";
    sql += "BETWEEN STR_TO_DATE('" + start_date + "','%Y-%m-%d') ";
    sql += "AND STR_TO_DATE('" + end_date + "','%Y-%m-%d') ";
    sql += "GROUP BY DATE(created_at) ";
    sql += "ORDER BY DATE(created_at) ASC";
    console.log('sql: ', sql);
    
    var sql_data = [];
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log(JSON.stringify(err));
            cb(err);
        } else {
            cb(null, result);
        }
    });
}

function _getBindData(pool, data, cb) {
    var start_date = data.start_date;
    var end_date = data.end_date;
    
    // 直接查询不会包含end_date, 需要对数据进行处理
    end_date = DateUtil.getDateOffset(1, new Date(end_date));
    
    var sql = "";
    sql += "SELECT COUNT(log_at) AS new_bind_account, DATE(log_at) AS log_date ";
    sql += "FROM tbl_bind_log ";
    sql += "WHERE ";
    sql += "log_at ";
    sql += "BETWEEN STR_TO_DATE('" + start_date + "','%Y-%m-%d') ";
    sql += "AND STR_TO_DATE('" + end_date + "','%Y-%m-%d') ";
    sql += "GROUP BY DATE(log_at) ";
    sql += "ORDER BY DATE(log_at) ASC";
    console.log('sql: ', sql);
    
    var sql_data = [];
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log(JSON.stringify(err));
            cb(err);
        } else {
            cb(null, result);
        }
    });

}

function _getActiveData(pool, data, cb) {
    var start_date = data.start_date;
    var end_date = data.end_date;
    
    // 直接查询不会包含end_date, 需要对数据进行处理
    end_date = DateUtil.getDateOffset(1, new Date(end_date));
    
    var query_table = "";
    query_table += "SUM(IF(nickname, 1, 0)) AS nickname_login";//SUM(nickname) AS nickname_login,
    query_table += " , ";
    query_table += "SUM(IF(nickname, 0, 1)) AS temp_login";//SUM(NOT(nickname)) AS temp_login,
    query_table += " , ";
    query_table += "COUNT(DISTINCT CASE WHEN nickname=1 THEN account_id END) AS nickname_count";
    query_table += " , ";
    query_table += "COUNT(DISTINCT CASE WHEN nickname=0 THEN account_id END) AS temp_count";
    query_table += " , ";
    query_table += "DATE(log_at) AS log_date ";
    
    var sql = "";
    sql += "SELECT " + query_table;
    sql += "FROM tbl_login_log ";
    sql += "WHERE ";
    sql += "log_at ";
    sql += "BETWEEN STR_TO_DATE('" + start_date + "','%Y-%m-%d') ";
    sql += "AND STR_TO_DATE('" + end_date + "','%Y-%m-%d') ";
    sql += "GROUP BY DATE(log_at) ";
    sql += "ORDER BY DATE(log_at) ASC";
    console.log('sql: ', sql);
    
    var sql_data = [];
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log(JSON.stringify(err));
            cb(err);
        } else {
            cb(null, result);
        }
    });

}

function _getRetentionData(pool, data, cb) {
    var start_date = data.start_date;
    var end_date = data.end_date;

    var day_count = DateUtil.dateDiff(start_date, end_date) + 1;
    var results = _fillDefaultData(day_count, start_date);

    _getRetentionDrr(pool, data, function (err_drr, results_drr) {
        if (DaoCommon.handleError(err_drr, cb)) return;
        _fillRetention(results, results_drr, "drr");

        _getRetentionWrr(pool, data, function (err_wrr, results_wrr) {
            if (DaoCommon.handleError(err_wrr, cb)) return;
            _fillRetention(results, results_wrr, "wrr");

            _getRetentionMrr(pool, data, function (err_mrr, results_mrr) {
                if (DaoCommon.handleError(err_mrr, cb)) return;
                _fillRetention(results, results_mrr, "mrr");

                cb(results);
            });
        });
    });
}

function _fillDefaultRetention(day_count, start_date) {
    var results = [];
    for (var i = 0; i < day_count; i++) {
        // DONE: 计算插入的日期数据
        var insert_date = DateUtil.getDateOffset(i, new Date(start_date));
        var result = {
            log_date: insert_date,
            drr: 0,
            wrr: 0,
            mrr: 0
        };
        results[i] = result;
    }
    return results;
}

function _fillRetention(results, results_t, field) {
    //console.log("results_t: ", results_t);
    for (var i = 0; i < results_t.length; i++) {
        var result_t = results_t[i];
        var patternDate = DateUtil.pattern(result_t.count_date, "yyyy-MM-dd");
        console.log(i + ")patternDate: ", patternDate);
        for (var j = 0; j < results.length; j++) {
            var result = results[j];
            if (result.log_date == patternDate) {
                results[j][field] = result_t.rate;
                break;
            }
        }
    }
}

function _getRetentionDrr(pool, data, cb) {
    _getRetention(pool, data, 1, function (err, results) {
        //console.log("DRR: ", results);
        cb(err, results);
    });
}

function _getRetentionWrr(pool, data, cb) {
    _getRetention(pool, data, 7, function (err, results) {
        //console.log("WRR: ", results);
        cb(err, results);
    });
}

function _getRetentionMrr(pool, data, cb) {
    _getRetention(pool, data, 30, function (err, results) {
        //console.log("MRR: ", results);
        cb(err, results);
    });
}

function _getRetention(pool, data, day_count, cb) {
    var start_date = data.start_date;
    var end_date = data.end_date;
    var start_date = DateUtil.getDateOffset(-1, new Date(start_date));
    var end_date = DateUtil.getDateOffset(0, new Date(end_date));
    // 往后延迟day_count就是查看玩家是否登录的日期
    var login_check_start_date = DateUtil.getDateOffset(day_count, new Date(start_date));
    var login_check_end_date = DateUtil.getDateOffset(day_count, new Date(end_date));

    var sql = "";
    sql += "SELECT ";
    sql += "login_tbl.login_count / regist_tbl.regist_count AS rate, ";
    sql += "regist_tbl.count_date AS count_date, ";
    sql += "login_tbl.login_count, ";
    sql += "regist_tbl.regist_count ";
    sql += "FROM ";
    sql += "( ";
    sql += "    SELECT COUNT(id) AS regist_count, DATE(created_at) AS count_date ";
    sql += "    FROM tbl_account ";
    sql += "    WHERE created_at ";
    sql += "    BETWEEN STR_TO_DATE('" + start_date + "', '%Y-%m-%d') ";
    sql += "    AND STR_TO_DATE('" + end_date + "', '%Y-%m-%d') ";
    sql += "    GROUP BY count_date ";
    sql += ") regist_tbl, ";
    sql += "( ";
    sql += "	SELECT COUNT(DISTINCT register.id) AS login_count, DATE(register.regist_date) AS count_date FROM  ";
    sql += "	( ";
    sql += "		SELECT id, DATE(created_at) AS regist_date  ";
    sql += "		FROM tbl_account ";
    sql += "		WHERE created_at ";
    sql += "		BETWEEN STR_TO_DATE('" + start_date + "','%Y-%m-%d') ";
    sql += "		AND STR_TO_DATE('" + end_date + "','%Y-%m-%d') ";
    sql += "    ) register,  ";
    sql += "    ( ";
    sql += "        SELECT account_id, DATE(log_at) AS login_date ";
    sql += "        FROM tbl_login_log ";
    sql += "        WHERE log_at  ";
    sql += "        BETWEEN STR_TO_DATE('" + login_check_start_date + "','%Y-%m-%d')  ";
    sql += "        AND STR_TO_DATE('" + login_check_end_date + "','%Y-%m-%d')  ";
    sql += "    ) login  ";
    sql += "    WHERE register.id = login.account_id  ";
    sql += "    AND TO_DAYS(register.regist_date) + ? = TO_DAYS(login.login_date)  ";
    sql += "    GROUP BY count_date ";
    sql += ") login_tbl ";
    sql += "WHERE login_tbl.count_date = regist_tbl.count_date  ";

    console.log('-----------------------------------------------------------');
    console.log('start_date: ', start_date);
    console.log('end_date: ', end_date);
    console.log('end_date: ', login_check_start_date);
    console.log('end_date: ', login_check_end_date);
    console.log('sql: ', sql);
    console.log('-----------------------------------------------------------');
    
    var sql_data = [day_count];
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log(JSON.stringify(err));
            cb(err);
        } else {
            console.log('sql: ', result);
            cb(null, result);
        }
    });

}

/**
 * 获取每日商城购买次数(shop_time_count)和每日商城购买用户数(shop_account_count). 从订单表获取数据
SELECT COUNT(game_account_id) AS shop_time_count, 
COUNT(DISTINCT game_account_id) AS shop_account_count, 
SUM(money*10) AS shop_tpa, 
DATE(created_at) AS count_date 
FROM tbl_order 
WHERE created_at 
BETWEEN STR_TO_DATE('2017-05-15','%Y-%m-%d') 
AND STR_TO_DATE('2017-06-08','%Y-%m-%d') 
AND status=0 
GROUP BY count_date
 */
function _getShopData(pool, data, cb) {
    var start_date = data.start_date;
    var end_date = data.end_date;
    
    var sql = "";
    sql += "SELECT ";
    // 返回值
    sql += "COUNT(game_account_id) AS shop_time_count, ";
    sql += "COUNT(DISTINCT game_account_id) AS shop_account_count, ";
    sql += "SUM(money*10) AS shop_tpa, ";
    sql += "DATE(created_at) AS count_date ";
    // 查询条件
    sql += "FROM tbl_order ";
    sql += "WHERE created_at ";
    sql += "BETWEEN STR_TO_DATE('" + start_date + "', '%Y-%m-%d') ";
    sql += "AND STR_TO_DATE('" + end_date + "', '%Y-%m-%d') ";
    sql += "AND status=0 ";
    sql += "GROUP BY count_date ";

    var sql_data = [];
    
    console.log('sql: ', sql);
    console.log('sql_data: ', sql_data);
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log(JSON.stringify(err));
            cb(err);
        } else {
            console.log('shop result1: ', result);
            
            _get_paffd(pool, data, function (err_paffd, result_paffd) {
                if (err_paffd) {
                    console.log(JSON.stringify(err_paffd));
                    cb(err_paffd);
                } else {
                    result = _fill_paffd_data(result, result_paffd);
                    console.log('shop result2: ', result);

                    _get_pafft(pool, data, function (err_pafft, result_pafft) {
                        if (err_pafft) {
                            console.log(JSON.stringify(err_pafft));
                            cb(err_pafft);
                        } else {
                            result = _fill_pafft_data(result, result_pafft);
                            console.log('shop result3: ', result);
                            
                            cb(null, result);
                        }
                    });
                }
            });
        }
    });
}

////////////////////////////////////////////////////////////////////////////////
// pafft

/**
 * 一段时间内首次付费玩家的数据. 从tbl_order表获取数据
SELECT 
COUNT(DISTINCT tbl_order.game_account_id) AS shop_pafft, 
DATE(tbl_order.created_at) AS count_date
FROM tbl_order, tbl_account
WHERE tbl_order.created_at
BETWEEN STR_TO_DATE('2017-05-15','%Y-%m-%d')
AND STR_TO_DATE('2017-06-08','%Y-%m-%d')
AND STR_TO_DATE(tbl_order.created_at,'%Y-%m-%d') = STR_TO_DATE(tbl_account.pfft_at,'%Y-%m-%d')
AND tbl_order.game_account_id = tbl_account.id
AND status=0 
GROUP BY count_date
 */
function _get_pafft(pool, data, cb) {
    var start_date = data.start_date;
    var end_date = data.end_date;
    
    var sql = "";
    sql += "SELECT ";
    // 返回值
    sql += "COUNT(DISTINCT tbl_order.game_account_id) AS shop_pafft, ";
    sql += "DATE(tbl_order.created_at) AS count_date ";
    // 查询条件
    sql += "FROM tbl_order, tbl_account ";
    sql += "WHERE tbl_order.created_at ";
    sql += "BETWEEN STR_TO_DATE('" + start_date + "', '%Y-%m-%d') ";
    sql += "AND STR_TO_DATE('" + end_date + "', '%Y-%m-%d') ";
    sql += "AND STR_TO_DATE(tbl_order.created_at, '%Y-%m-%d') = STR_TO_DATE(tbl_account.pfft_at, '%Y-%m-%d') ";
    sql += "AND tbl_order.game_account_id = tbl_account.id ";
    sql += "AND status=0 ";
    sql += "GROUP BY count_date ";

    var sql_data = [];
    
    console.log('sql: ', sql);
    console.log('sql_data: ', sql_data);
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log(JSON.stringify(err));
            cb(err);
        } else {
            cb(null, result);
        }
    });
}

function _fill_pafft_data(results, results_pafft) {
    for (var i = 0; i < results.length; i++) {
        // 初始化
        results[i]['shop_pafft'] = 0;
        var result = results[i];
        var patternDate = DateUtil.pattern(result.count_date, "yyyy-MM-dd");
        console.log(i + ")patternDate: ", patternDate);
        for (var j = 0; j < results_pafft.length; j++) {
            var result_pafft = results_pafft[j];
            var pd_pafft = DateUtil.pattern(result_pafft.count_date, "yyyy-MM-dd");
            console.log(j + ")pd_pafft: ", pd_pafft);
            if (pd_pafft == patternDate) {
                results[i]['shop_pafft'] = result_pafft.shop_pafft;
                break;
            }
        }
    }
    return results;
}

////////////////////////////////////////////////////////////////////////////////
// paffd

/**
 * 一段时间内首日付费玩家的数据(刚注册那天就付费). 从tbl_order表获取数据
SELECT 
COUNT(DISTINCT tbl_order.game_account_id) AS shop_paffd, 
DATE(tbl_order.created_at) AS count_date
FROM tbl_order, tbl_account
WHERE tbl_order.created_at
BETWEEN STR_TO_DATE('2017-05-15','%Y-%m-%d')
AND STR_TO_DATE('2017-06-08','%Y-%m-%d')
AND STR_TO_DATE(tbl_order.created_at,'%Y-%m-%d') = STR_TO_DATE(tbl_account.created_at,'%Y-%m-%d')
AND tbl_order.game_account_id = tbl_account.id
AND status=0 
GROUP BY count_date
 */
function _get_paffd(pool, data, cb) {
    var start_date = data.start_date;
    var end_date = data.end_date;
    
    var sql = "";
    sql += "SELECT ";
    // 返回值
    sql += "COUNT(DISTINCT tbl_order.game_account_id) AS shop_paffd, ";
    sql += "DATE(tbl_order.created_at) AS count_date ";
    // 查询条件
    sql += "FROM tbl_order, tbl_account ";
    sql += "WHERE tbl_order.created_at ";
    sql += "BETWEEN STR_TO_DATE('" + start_date + "', '%Y-%m-%d') ";
    sql += "AND STR_TO_DATE('" + end_date + "', '%Y-%m-%d') ";
    sql += "AND STR_TO_DATE(tbl_order.created_at, '%Y-%m-%d') = STR_TO_DATE(tbl_account.created_at, '%Y-%m-%d') ";
    sql += "AND tbl_order.game_account_id = tbl_account.id ";
    sql += "AND status=0 ";
    sql += "GROUP BY count_date ";

    var sql_data = [];
    
    console.log('sql: ', sql);
    console.log('sql_data: ', sql_data);
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log(JSON.stringify(err));
            cb(err);
        } else {
            cb(null, result);
        }
    });
}

function _fill_paffd_data(results, results_paffd) {
    for (var i = 0; i < results.length; i++) {
        // 初始化
        results[i]['shop_paffd'] = 0;
        var result = results[i];
        var patternDate = DateUtil.pattern(result.count_date, "yyyy-MM-dd");
        console.log(i + ")patternDate: ", patternDate);
        for (var j = 0; j < results_paffd.length; j++) {
            var result_paffd = results_paffd[j];
            var pd_paffd = DateUtil.pattern(result_paffd.count_date, "yyyy-MM-dd");
            console.log(j + ")pd_paffd: ", pd_paffd);
            if (pd_paffd == patternDate) {
                results[i]['shop_paffd'] = result_paffd.shop_paffd;
                break;
            }
        }
    }
    return results;
}