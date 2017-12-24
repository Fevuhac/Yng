////////////////////////////////////////////////////////////
// Ai Related
////////////////////////////////////////////////////////////
var utils = require('../buzz/utils');
var StringUtil = require('../utils/StringUtil');
var ArrayUtil = require('../utils/ArrayUtil');
var CstError = require('../buzz/cst/buzz_cst_error');
var DaoUtil = require('./dao_utils');
var _ = require('underscore');

let AccountCommon = require('./account/common');

// 具体的统计方法
var fish_times = require('./ai/fish_times');
var first_fire_seconds = require('./ai/first_fire_seconds');
var hold_chance = require('./ai/hold_chance');
var target_shift_times = require('./ai/target_shift_times');
var wp_times = require('./ai/wp_times');
var no_fire_quit_chance = require('./ai/no_fire_quit_chance');

//==============================================================================
// const
//==============================================================================

const ERROR_CODE = CstError.ERROR_CODE;
const ERROR_OBJ = CstError.ERROR_OBJ;

var DEBUG = 0;
var ERROR = 1;

var TAG = "【dao_ai】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.updateAi = updateAi;
exports.makeNewAi = makeNewAi;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 更新AI数据(在ai_log中新增一条数据, 并返回上一个周期计算的AI结果(暂定为10分钟一个周期)).
 */
function updateAi(pool, data, cb) {
    const FUNC = TAG + "updateAi() --- ";
    
    var param_name_list = [
        'account_id',
        'token',
        'ai_data',
    ];
    
    if (DaoUtil.checkParams(param_name_list, data, cb)) {
        return;
    }
    
    // 新增token验证, 防止意外数据更新AI
    AccountCommon.getAccountByToken(pool, data.token, function (err, results) {
        if (err) {
            cb(err);
            return;
        }
        if (results.length == 0) {
            if (ERROR) console.error('-----------------------------------------------------');
            if (ERROR) console.error(FUNC + 'TOKEN_INVALID: dao_ai.updateAi()');
            if (ERROR) console.error('-----------------------------------------------------');
            cb(ERROR_OBJ.TOKEN_INVALID);
            return;
        }
        _didUpdateAi(pool, data, cb);
    });
}

/**
 * 用tbl_ai中最后一条数据与tbl_ai_log中最近10分钟的数据进行计算.
 */
function makeNewAi(pool, cb) {
    const FUNC = TAG + "makeNewAi() --- ";
    
    // --Step1-- 获取最后一次的AI数据
    _findLastAi(pool, function (err_1, last_ai) {
        
        var last_log_id = 0;
        if (last_ai != null) {
            last_log_id = last_ai["last_log_id"];
        }
        if (DEBUG) console.log(FUNC + "last_log_id:", last_log_id);
        
        // [TODO] --Step1.5-- 用last_log_id与tbl_ai_log最大的ID做比较, 如果一样则跳过后面操作
        _findLastAiLog(pool, function (err_3, last_ai_log) {
            
            if (DEBUG) console.log(FUNC + "last_ai_log:", last_ai_log);
            if (last_ai_log == null) {
                if (DEBUG) console.info(FUNC + "没有任何的AI记录, 不计算...");
                return;
            }
            if (last_log_id != last_ai_log) {
            //if (true) {
                // --Step2-- 获取最近10条tbl_ai_log数据数组
                _queryRecentLog(pool, function (err_2, recent_logs) {
                    
                    // --Step3-- 计算新的一条tbl_ai记录
                    _insertNewAi(pool, last_ai, recent_logs, function (err_3, results) {
                    });
                });
            }
            else {
                if (DEBUG) console.info(FUNC + "没有新的AI记录，无需重新计算...");
            }
        });
    });
}

//==============================================================================
// private
//==============================================================================

// 找到最后一次客户端上传的AI记录(log)
function _findLastAiLog(pool, cb) {
    const FUNC = TAG + "_findLastAiLog() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");
    
    var sql = "";
    sql += "SELECT max(id) AS max_id ";
    sql += "FROM tbl_ai_log";
    var sql_data = [];
    
    if (DEBUG) console.log(FUNC + "sql:\n", sql);
    if (DEBUG) console.log(FUNC + "sql_data:\n", sql_data);
    
    pool.query(sql, sql_data, function (err, results) {
        if (err) {
            if (ERROR) console.error(JSON.stringify(err));
            if (ERROR) console.error(err);
            cb(err);
        } else {
            if (DEBUG) console.log(FUNC + 'results:\n', results);
            var result = 1;
            if (results.length > 0) {
                result = results[0]['max_id'];
            }
            cb(null, result);
        }
    });
}

// 找到最后一次计算的AI
function _findLastAi(pool, cb) {
    if (DEBUG) console.log("[CALL] _findLastAi");

    var sql = "";
    sql += "SELECT * ";
    sql += "FROM tbl_ai ";
    sql += "WHERE id = (";
    sql += "SELECT max(id) from tbl_ai";
    sql += ")";
    var sql_data = [];
    
    if (DEBUG) console.log("sql: " + sql);
    if (DEBUG) console.log("sql_data: " + sql_data);
    
    pool.query(sql, sql_data, function (err, results) {
        if (err) {
            if (ERROR) console.error(JSON.stringify(err));
            if (ERROR) console.error(err);
            cb(err);
        } else {
            if (DEBUG) console.log('results: ', results);
            var result = null;
            if (results.length > 0) {
                result = results[0];
            }
            cb(null, result);
        }
    });
}

// 找到所有尚未统计的AI记录
function _queryRecentLog(pool, cb) {
    if (DEBUG) console.log("[CALL] _queryRecentLog");
    
    var sql = "";
    sql += "SELECT * ";
    sql += "FROM tbl_ai_log ";
    sql += "ORDER BY id DESC ";
    sql += "LIMIT 0, 100";
    var sql_data = [];
    
    if (DEBUG) console.log("sql: " + sql);
    if (DEBUG) console.log("sql_data: " + sql_data);
    
    pool.query(sql, sql_data, function (err, results) {
        if (err) {
            if (ERROR) console.error(JSON.stringify(err));
            if (ERROR) console.error(err);
            cb(err);
        } else {
            //if (DEBUG) console.log('results: ', results);
            cb(null, results);
        }
    });
}

// 计算并插入一条新的AI记录
function _insertNewAi(pool, last_ai, recent_logs, cb) {
    if (DEBUG) console.log("[CALL] _insertNewAi");
    
    _makeAi(pool, recent_logs);
}

function _bindAi(pool, last_ai, recent_logs) {
    if (DEBUG) console.log("[CALL] _bindAi");

}

function _makeAi(pool, recent_logs) {
    if (DEBUG) console.log("[CALL] _makeAi");

    var wpTimesP = '{}';
    var firstFireSecondsP = 0;
    var noFireQuitChanceP = 0;
    var fishTimesP = '{}';
    var sameFishAverageDtP = 0;
    var targetShiftTimesP = '{}';
    var normalStaySecondsP = 0;
    var brokenStaySecondsP = 0;
    var iceSkillTimesP = 0;
    var lockSkillChanceP = '{}';
    var callSkillTimesP = 0;
    var holdChanceP = 0;
    var holdAverageSecondsP = 0;
    var waitAverageSecondsP = 0;
    var holdingQuitChanceP = 0;
    
    var last_log_id = recent_logs[0]["id"];
    
    // 单数值平均值(去除无效值)
    firstFireSecondsP = _timesAvailable(recent_logs, "firstFireSeconds");
    sameFishAverageDtP = _timesAvailable(recent_logs, "sameFishAverageDt");
    normalStaySecondsP = _timesAvailable(recent_logs, "normalStaySeconds");
    brokenStaySecondsP = _timesAvailable(recent_logs, "brokenStaySeconds");
    holdAverageSecondsP = _timesAvailable(recent_logs, "holdAverageSeconds");
    waitAverageSecondsP = _timesAvailable(recent_logs, "waitAverageSeconds");
    
    // TODO: 以下两项待定
    iceSkillTimesP = _average(recent_logs, "iceSkillTimes");
    callSkillTimesP = _average(recent_logs, "callSkillTimes");
    
    // 对象平均值
    
    // 单数值概率(0:普通更新,1:进场更新,2:无开火退场更新)
    noFireQuitChanceP = _chanceNoFireQuit(recent_logs, "noFireQuitChance");
    
    // 直接平均
    holdChanceP = _average(recent_logs, "holdChance");
    holdingQuitChanceP = _average(recent_logs, "holdingQuitChance");
    
    // 直接对象平均
    lockSkillChanceP = _avgObj(recent_logs, "lockSkillChance");
    targetShiftTimesP = _avgObj(recent_logs, "targetShiftTimes");
    
    // 对象概率
    wpTimesP = _chanceObj(recent_logs, "wpTimes");
    
    // 对象概率加权
    fishTimesP = _chanceFishTimes(recent_logs, "fishTimes");// DONE

    var last_ai = {
        "last_log_id" : last_log_id,
        "wpTimesP" : wpTimesP,
        "firstFireSecondsP" : firstFireSecondsP,
        "noFireQuitChanceP" : noFireQuitChanceP,
        "fishTimesP" : fishTimesP,
        "sameFishAverageDtP" : sameFishAverageDtP,
        "targetShiftTimesP" : targetShiftTimesP,
        "normalStaySecondsP" : normalStaySecondsP,
        "brokenStaySecondsP" : brokenStaySecondsP,
        "iceSkillTimesP" : iceSkillTimesP,
        "lockSkillChanceP" : lockSkillChanceP,
        "callSkillTimesP" : callSkillTimesP,
        "holdChanceP" : holdChanceP,
        "holdAverageSecondsP" : holdAverageSecondsP,
        "waitAverageSecondsP" : waitAverageSecondsP,
        "holdingQuitChanceP" : holdingQuitChanceP
    };

    _insertTbleAi(pool, last_ai);
}

// 计算单个值的概率
function _chance(recent_logs, field_name) {

}

// 剔除无效值后进行平均值计算
function _timesAvailable(recent_logs, field_name) {
    return first_fire_seconds.cal(recent_logs, field_name);
}

// 计算对象中单个值的概率
function _chanceFishTimes(recent_logs, field_name) {
    return fish_times.cal(recent_logs, field_name);
}

// 计算对象中单个值的概率
function _chanceObj(recent_logs, field_name) {
    return wp_times.cal(recent_logs, field_name);
}

// 计算一组数据的平均值
function _average(recent_logs, field_name) {
    return hold_chance.cal(recent_logs, field_name);
}

// 根据记录的不同来计算
function _chanceNoFireQuit(recent_logs, field_name) {
    return no_fire_quit_chance.cal(recent_logs, field_name);
}

// 计算对象中相同字段在一个数组中的平均值
function _avgObj(recent_logs, field_name) {
    return target_shift_times.cal(recent_logs, field_name);
}

function _copyRecord(pool, last_ai) {
    if (DEBUG) console.log("[CALL] _copyRecord");

    _insertTbleAi(pool, last_ai);
}


////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////


function _insertTbleAi(pool, last_ai) {
    if (DEBUG) console.log("[CALL] _insertTbleAi");

    var last_log_id = last_ai["last_log_id"];
    var wpTimesP = last_ai["wpTimesP"];
    var firstFireSecondsP = last_ai["firstFireSecondsP"];
    var noFireQuitChanceP = last_ai["noFireQuitChanceP"];
    var fishTimesP = last_ai["fishTimesP"];
    var sameFishAverageDtP = last_ai["sameFishAverageDtP"];
    var targetShiftTimesP = last_ai["targetShiftTimesP"];
    var normalStaySecondsP = last_ai["normalStaySecondsP"];
    var brokenStaySecondsP = last_ai["brokenStaySecondsP"];
    var iceSkillTimesP = last_ai["iceSkillTimesP"];
    var lockSkillChanceP = last_ai["lockSkillChanceP"];
    var callSkillTimesP = last_ai["callSkillTimesP"];
    var holdChanceP = last_ai["holdChanceP"];
    var holdAverageSecondsP = last_ai["holdAverageSecondsP"];
    var waitAverageSecondsP = last_ai["waitAverageSecondsP"];
    var holdingQuitChanceP = last_ai["holdingQuitChanceP"];
    
    if (DEBUG) console.log('last_log_id: ' + last_log_id);
    if (DEBUG) console.log('wpTimesP: ' + wpTimesP);
    if (DEBUG) console.log('firstFireSecondsP: ' + firstFireSecondsP);
    if (DEBUG) console.log('noFireQuitChanceP: ' + noFireQuitChanceP);
    if (DEBUG) console.log('fishTimesP: ' + fishTimesP);
    if (DEBUG) console.log('sameFishAverageDtP: ' + sameFishAverageDtP);
    if (DEBUG) console.log('targetShiftTimesP: ' + targetShiftTimesP);
    if (DEBUG) console.log('normalStaySecondsP: ' + normalStaySecondsP);
    if (DEBUG) console.log('brokenStaySecondsP: ' + brokenStaySecondsP);
    if (DEBUG) console.log('iceSkillTimesP: ' + iceSkillTimesP);
    if (DEBUG) console.log('lockSkillChanceP: ' + lockSkillChanceP);
    if (DEBUG) console.log('callSkillTimesP: ' + callSkillTimesP);
    if (DEBUG) console.log('holdChanceP: ' + holdChanceP);
    if (DEBUG) console.log('holdAverageSecondsP: ' + holdAverageSecondsP);
    if (DEBUG) console.log('waitAverageSecondsP: ' + waitAverageSecondsP);
    if (DEBUG) console.log('holdingQuitChanceP: ' + holdingQuitChanceP);
    
    var sql = "";
    sql += "INSERT INTO tbl_ai ";
    sql += "(";
    sql += "last_log_id, ";
    sql += "wpTimesP, ";
    sql += "firstFireSecondsP, ";
    sql += "noFireQuitChanceP, ";
    sql += "fishTimesP, ";
    sql += "sameFishAverageDtP, ";
    sql += "targetShiftTimesP, ";
    sql += "normalStaySecondsP, ";
    sql += "brokenStaySecondsP, ";
    sql += "iceSkillTimesP, ";
    sql += "lockSkillChanceP, ";
    sql += "callSkillTimesP, ";
    sql += "holdChanceP, ";
    sql += "holdAverageSecondsP, ";
    sql += "waitAverageSecondsP, ";
    sql += "holdingQuitChanceP ";
    sql += ") ";
    sql += "VALUES (";
    sql += "?,";
    sql += "'" + wpTimesP + "',";
    sql += "" + firstFireSecondsP + ",";
    sql += "" + noFireQuitChanceP + ",";
    sql += "'" + fishTimesP + "',";
    sql += "" + sameFishAverageDtP + ",";
    sql += "'" + targetShiftTimesP + "',";
    sql += "" + normalStaySecondsP + ",";
    sql += "" + brokenStaySecondsP + ",";
    sql += "" + iceSkillTimesP + ",";
    sql += "'" + lockSkillChanceP + "',";
    sql += "" + callSkillTimesP + ",";
    sql += "" + holdChanceP + ",";
    sql += "" + holdAverageSecondsP + ",";
    sql += "" + waitAverageSecondsP + ",";
    sql += "" + holdingQuitChanceP + ")";
    
    var sql_data = [last_log_id];
    
    if (DEBUG) console.log("sql: " + sql);
    if (DEBUG) console.log("sql_data: " + sql_data);
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            if (ERROR) console.error(JSON.stringify(err));
            if (ERROR) console.error(err);
            //cb(err);
        } else {
            if (DEBUG) console.log('result: ', result);
        }
    });
}

function _didUpdateAi(pool, data, cb) {
    if (DEBUG) console.log("[CALL] _didUpdateAi");
    
    var account_id = data['account_id'];
    var token = data['token'];
    var ai_data = data['ai_data'];

    if (DEBUG) console.info("\nstr ai_data: ", ai_data);
    
    while (StringUtil.isString(ai_data)) {
        if (DEBUG) console.log("Need Parse!!!!!!!!!!!!");
        try {
            ai_data = JSON.parse(ai_data);
            if (DEBUG) console.log("Parse Success!!!!!!!!!!!!");
        }
        catch (parse_err) {
            if (DEBUG) console.log("parse_err: ", parse_err);
        }
    }
    
    if (DEBUG) console.log("\njson ai_data: ", ai_data);
    
    for (var key in ai_data) {
        if (DEBUG) console.log("key: " + key);
        if (DEBUG) console.log("value: " + ai_data[key]);
        if (DEBUG) console.log("-----------------------------------------");
    }

    var wpTimes = ai_data["wpTimes"];
    var firstFireSeconds = JSON.stringify(ai_data["firstFireSeconds"]);
    var noFireQuitChance = ai_data["noFireQuitChance"];
    var fishTimes = ai_data["fishTimes"];
    var sameFishAverageDt = JSON.stringify(ai_data["sameFishAverageDt"]);
    var targetShiftTimes = ai_data["targetShiftTimes"];
    var normalStaySeconds = JSON.stringify(ai_data["normalStaySeconds"]);
    var brokenStaySeconds = ai_data["brokenStaySeconds"];
    var iceSkillTimes = ai_data["iceSkillTimes"];
    var lockSkillChance = ai_data["lockSkillChance"];
    var callSkillTimes = JSON.stringify(ai_data["callSkillTimes"]);
    var holdChance = ai_data["holdChance"];
    var holdAverageSeconds = ai_data["holdAverageSeconds"];
    var waitAverageSeconds = ai_data["waitAverageSeconds"];
    var holdingQuitChance = ai_data["holdingQuitChance"];
    
    if (DEBUG) console.log('account_id: ' + account_id);
    if (DEBUG) console.log('wpTimes: ' + wpTimes);
    if (DEBUG) console.log('firstFireSeconds: ' + firstFireSeconds);
    if (DEBUG) console.log('noFireQuitChance: ' + noFireQuitChance);
    if (DEBUG) console.log('fishTimes: ' + fishTimes);
    if (DEBUG) console.log('sameFishAverageDt: ' + sameFishAverageDt);
    if (DEBUG) console.log('targetShiftTimes: ' + targetShiftTimes);
    if (DEBUG) console.log('normalStaySeconds: ' + normalStaySeconds);
    if (DEBUG) console.log('brokenStaySeconds: ' + brokenStaySeconds);
    if (DEBUG) console.log('iceSkillTimes: ' + iceSkillTimes);
    if (DEBUG) console.log('lockSkillChance: ' + lockSkillChance);
    if (DEBUG) console.log('callSkillTimes: ' + callSkillTimes);
    if (DEBUG) console.log('holdChance: ' + holdChance);
    if (DEBUG) console.log('holdAverageSeconds: ' + holdAverageSeconds);
    if (DEBUG) console.log('waitAverageSeconds: ' + waitAverageSeconds);
    if (DEBUG) console.log('holdingQuitChance: ' + holdingQuitChance);
    
    // 数据验证
    if (holdingQuitChance == null) {
        var err_holdingQuitChance = "holdingQuitChance字段不能为null";
        if (ERROR) console.error(JSON.stringify(err_holdingQuitChance));
        //cb(err_holdingQuitChance);
        //return;
        // 默认直接改为0, 0值不参与统计计算
        holdingQuitChance = 0;
    }

    var sql = "";
    sql += "INSERT INTO tbl_ai_log ";
    sql += "(";
    sql += "account_id, ";
    sql += "wpTimes, ";
    sql += "firstFireSeconds, ";
    sql += "noFireQuitChance, ";
    sql += "fishTimes, ";
    sql += "sameFishAverageDt, ";
    sql += "targetShiftTimes, ";
    sql += "normalStaySeconds, ";
    sql += "brokenStaySeconds, ";
    sql += "iceSkillTimes, ";
    sql += "lockSkillChance, ";
    sql += "callSkillTimes, ";
    sql += "holdChance, ";
    sql += "holdAverageSeconds, ";
    sql += "waitAverageSeconds, ";
    sql += "holdingQuitChance ";
    sql += ") ";
    sql += "VALUES (";
    sql += "?,";
    sql += "'" + wpTimes + "',";
    sql += "" + firstFireSeconds + ",";
    sql += "" + noFireQuitChance + ",";
    sql += "'" + fishTimes + "',";
    sql += "" + sameFishAverageDt + ",";
    sql += "'" + targetShiftTimes + "',";
    sql += "" + normalStaySeconds + ",";
    sql += "" + brokenStaySeconds + ",";
    sql += "" + iceSkillTimes + ",";
    sql += "'" + lockSkillChance + "',";
    sql += "" + callSkillTimes + ",";
    sql += "" + holdChance + ",";
    sql += "" + holdAverageSeconds + ",";
    sql += "" + waitAverageSeconds + ",";
    sql += "" + holdingQuitChance + ")";

    var sql_data = [account_id];
    
    if (DEBUG) console.log("sql: " + sql);
    if (DEBUG) console.log("sql_data: " + sql_data);

    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            if (ERROR) console.error(JSON.stringify(err));
            if (ERROR) console.error(err);
            cb(err);
        } else {
            if (DEBUG) console.log('result: ', result);

            _findLastAi(pool, function (err_ret, result_ret) {
                if (err_ret) {
                    cb(err_ret);
                }
                else {
                    if (result_ret != null) {
                        cb(null, result_ret);
                    }
                    else {
                        cb(null, ai_data);
                    }
                }
            });
        }
    });
}