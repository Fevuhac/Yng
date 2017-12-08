////////////////////////////////////////////////////////////
// 连接记录的业务逻辑
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------
var _ = require('underscore');
var ObjUtil = require('../buzz/ObjUtil');
var ArrayUtil = require('../utils/ArrayUtil');
var buzz_cst_error = require('../buzz/cst/buzz_cst_error');

var ERROR_OBJ = buzz_cst_error.ERROR_OBJ;

//------------------------------------------------------------------------------
// 业务
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// 缓存
//------------------------------------------------------------------------------
var CacheLink = require('../buzz/cache/CacheLink');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var SERVER_CFG = require('../cfgs/server_cfg').SERVER_CFG;

//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
var TAG = "【dao_link】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.write = write;
exports.flush = flush;
exports.sumPlayer = sumPlayer;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 批量插入连接日志.
 */
function write(pool, cb) {
    const FUNC = TAG + "write() --- ";
    //----------------------------------

    var link_list = CacheLink.cache();
    _sumPlayerInCache(pool, link_list, function(err, result) {
        if (link_list.length > 0) {
            _didWrite(pool, link_list, cb);
        }
        else {
            cb("没有可以插入的数据");
        }
    });

}

/**
 * 意外Crash或服务器需要重启更新时调用, 将所有的CacheLink数据写入数据库.
 */
function flush(pool, cb) {
    const FUNC = TAG + "flush() --- ";
    //----------------------------------

    var link_list = CacheLink.cache();
    _sumPlayerInCache(pool, link_list, function(err, result) {
        if (link_list.length > 0) {
            _didWrite(pool, link_list, cb);
        }
        else {
            cb("没有可以插入的数据");
        }
    });

}

/**
 * 计算一分钟内在线玩家的人数.
 * 写入数据库结束后就调用这个接口来生成统计数据.
 */
function sumPlayer(pool, cb) {
    const FUNC = TAG + "sumPlayer() --- ";
    //----------------------------------

    _didSumPlayer(pool, cb);
}


//==============================================================================
// private
//==============================================================================

function _didWrite(pool, link_list, cb) {
    const FUNC = TAG + "_didWrite() --- ";
    DEBUG = 0;
    //----------------------------------
    var count = link_list.length;
    // var sql = "";
    // sql += "INSERT `tbl_link_log` ";
    // sql += '(`uid`,`linked_at`,`api`) ';
    // sql += 'VALUES ';
    // for (var i = 0; i < count; i++) {
    //     if (i > 0) sql += ',';
    //     sql += '(?,?,?)';
    // }

    var sql_data = [];
    for (var i = 0; i < count; i++) {
        var one_link = link_list.shift();
        // sql_data.push(one_link.uid);
        // sql_data.push(new Date(one_link.linked_at));
        // sql_data.push(one_link.api);
    }

    // if (DEBUG) console.log(FUNC + 'sql:\n', sql);
    // if (DEBUG) console.log(FUNC + 'sql_data:\n', sql_data);
    
    // pool.query(sql, sql_data, function (err, result) {
    //     if (err) {
    //         if (ERROR) console.error(FUNC + "err:\n", err);
    //         if (ERROR) console.error(FUNC + 'sql:\n', sql);
    //         if (ERROR) console.error(FUNC + 'sql_data:\n', sql_data);
    //     } else {
    //         if (DEBUG) console.log(FUNC + 'result: ', result);
    //     }
    //     cb(err, result);
    //     DEBUG = 0;
    // });
    cb(null, "success");
}

function _sumPlayerInCache(pool, link_list, cb) {
    const FUNC = TAG + "_sumPlayerInCache() --- ";
    DEBUG = 0;
    //----------------------------------

    var uids = [];
    // var link_count = {};
    if (DEBUG) console.log(FUNC + "link_list:", link_list);
    for (var i = 0; i < link_list.length; i++) {
        var link = link_list[i];
        if (!ArrayUtil.contain(uids, link.uid)) {
            uids.push(link.uid);
        }
    }

    var top10_link = getTop10Link(link_list);
    if (DEBUG) console.log(FUNC + "top10_link:", top10_link);

    var sql = "";
    sql += "INSERT INTO `tbl_link_sum` ";
    sql += "(`time`, `online_count`, `link_count`, `top10_link`, `sid`) ";
    // sql += "VALUES ( DATE_FORMAT(NOW(),'%Y-%m-%d %H:%i:00')," + uids.length + ", " + link_list.length + ", '" + top10_link + "', " + SERVER_CFG.SID + ") ";
    sql += "VALUES ( DATE_FORMAT(NOW(),'%Y-%m-%d %H:%i:00'),?,?,?,?) ";

    // var sql_data = [];
    var sql_data = [
        uids.length,
        link_list.length,
        top10_link,
        SERVER_CFG.SID,
    ];
    
    pool.query(sql, sql_data, function (err, result) {
        if (err && ERROR) {
            console.error(FUNC + "err:\n", err);
            console.error(FUNC + 'sql:\n', sql);
            console.error(FUNC + 'sql_data:\n', sql_data);
        } else {
            if (DEBUG) console.log(FUNC + 'result: ', result);
        }
        cb(err, result);
        DEBUG = 0;
    });
}

function getTop10Link(link_list) {
    const FUNC = TAG + "getTop10Link() --- ";
    var link_count = {};
    if (DEBUG) console.log(FUNC + "link_list:", link_list);
    for (var i = 0; i < link_list.length; i++) {
        var link = link_list[i];
        if (!link_count["" + link.api]) {
            link_count["" + link.api] = 1;
        }
        else {
            link_count["" + link.api] += 1;
        }
    }

    if (DEBUG) console.log(FUNC + "link_count:", link_count);
    var pair_link = [];
    for (var link in link_count) {
        pair_link.push({link:link, count:link_count[link]});
    }
    if (DEBUG) console.log(FUNC + "pair_link:", pair_link);

    var temp = _.sortBy(pair_link, 'count');
    if (DEBUG) console.log(FUNC + "temp:", temp);
    var sort_link = [];
    var max_record = Math.min(10, temp.length);
    for (var i = max_record - 1; i >= 0; i--) {
        sort_link.push(temp[i]);
    }

    if (DEBUG) console.log(FUNC + "sort_link:", sort_link);

    var top10_link = [];
    for (var i = 0; i < sort_link.length; i++) {
        var obj = {};
        obj[sort_link[i].link] = sort_link[i].count;
        top10_link.push(obj);
    }
    return JSON.stringify(top10_link);
}

var SQL_LAST_MINUTE = "BETWEEN DATE_SUB(DATE_FORMAT(NOW(),'%Y-%m-%d %H:%i:00'),INTERVAL 1 MINUTE) AND DATE_FORMAT(NOW(),'%Y-%m-%d %H:%i:00')";
var SQL_THIS_MINUTE = "BETWEEN DATE_FORMAT(NOW(),'%Y-%m-%d %H:%i:00') AND DATE_ADD(DATE_FORMAT(NOW(),'%Y-%m-%d %H:%i:00'),INTERVAL 1 MINUTE)";


/**
 * @desperate
 * 下面的语句在表本身数据量很大的情况下会消耗很长的查询时间, 效率很低.
INSERT `tbl_link_sum` 
(`time`, `online_count`) 
SELECT DATE_FORMAT(NOW(),'%Y-%m-%d %H:%i:00') AS time, 
COUNT(DISTINCT uid) AS online_count 
FROM tbl_link_log 
WHERE linked_at 
BETWEEN DATE_SUB(DATE_FORMAT(NOW(),'%Y-%m-%d %H:%i:00'),INTERVAL 1 MINUTE) AND DATE_FORMAT(NOW(),'%Y-%m-%d %H:%i:00')
 */
function _didSumPlayer(pool, cb) {
    const FUNC = TAG + "_didSumPlayer() --- ";
    //----------------------------------

    var time = new Date().getTime() / 60000;

    var sql = "";
    sql += "INSERT `tbl_link_sum` ";
    sql += "(`time`, `online_count`, `sid`) ";
    sql += "SELECT DATE_FORMAT(NOW(),'%Y-%m-%d %H:%i:00') AS time, ";
    sql += "COUNT(DISTINCT uid) AS online_count, ";
    sql += "? ";
    sql += "FROM tbl_link_log ";
    sql += "WHERE linked_at ";
    sql += SQL_LAST_MINUTE;

    var sql_data = [SERVER_CFG.SID];

    if (DEBUG) console.log(FUNC + 'sql:\n', sql);
    if (DEBUG) console.log(FUNC + 'sql_data:\n', sql_data);
    
    pool.query(sql, sql_data, function (err, result) {
        if (err && ERROR) {
            console.error(FUNC + "err:\n", err);
            console.error(FUNC + 'sql:\n', sql);
            console.error(FUNC + 'sql_data:\n', sql_data);
        } else {
            if (DEBUG) console.log(FUNC + 'result: ', result);
        }
        cb(err, result);
        DEBUG = 0;
    });
}


//==============================================================================
// 需要转移
//==============================================================================

