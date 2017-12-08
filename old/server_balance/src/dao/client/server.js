////////////////////////////////////////////////////////////
// 客户端获取API服务器的数据库访问逻辑
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var DataUtil = require("../../utils/DataUtil");
var DaoUtil = require("../../utils/DaoUtil");

//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// 业务
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// 数据库访问
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------


//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;

var TAG = "【dao/client/server】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getUidFromChannelAccountId = getUidFromChannelAccountId;
exports.getAccountCount = getAccountCount;
exports.getAccountServerId = getAccountServerId;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
/**
 * 通过查询tbl_account.channel_account_id获取tbl_account.id.
 */
function getUidFromChannelAccountId(pool, channel_account_id, cb) {
    const FUNC = TAG + "getUidFromChannelAccountId() --- ";
    //----------------------------------
    
    var sql = "";
    sql += "SELECT id AS uid ";
    sql += "FROM tbl_account ";
    sql += "WHERE channel_account_id=? ";
    var sql_data = [channel_account_id];
    
    DaoUtil.logSQL(DEBUG, FUNC, sql, sql_data);

    pool.query(sql, sql_data, function (err, rows) {
        if (err) {
            DaoUtil.errorSQL(DEBUG, FUNC, sql, sql_data, err);
            cb(err);
        }
        else {
            if (rows.length == 0) {
                // 传入channel_account_id没有查到uid, 表示此时为一个新账号,
                // 返回0, 通知业务层走新账号逻辑.
                cb(null, 0);
            }
            else {
                cb(null, rows[0].uid);
            }
        }
    });
}

/**
 * 获取数据库中玩家总数.
 */
function getAccountCount(pool, cb) {
    const FUNC = TAG + "getAccountCount() --- ";
    //----------------------------------
    
    var sql = "";
    sql += "SELECT COUNT(id) AS total ";
    sql += "FROM tbl_account ";
    var sql_data = [];
    
    DaoUtil.logSQL(DEBUG, FUNC, sql, sql_data);

    pool.query(sql, sql_data, function (err, rows) {
        if (err) {
            DaoUtil.errorSQL(DEBUG, FUNC, sql, sql_data, err);
            cb(err);
        }
        else {
            if (rows.length == 0) {
                cb(null, 0);
            }
            else {
                var total = rows[0].total;
                console.log("当前玩家总数:", total);
                cb(null, total);
            }
        }
    });
}

/**
 * 获取数据库中玩家所在的服务器ID.
 */
function getAccountServerId(pool, uid, cb) {
    const FUNC = TAG + "getAccountCount() --- ";
    //----------------------------------
    
    var sql = "";
    sql += "SELECT uid, sid ";
    sql += "FROM `tbl_account_server` ";
    sql += "WHERE uid=? ";
    var sql_data = [uid];
    
    DaoUtil.logSQL(DEBUG, FUNC, sql, sql_data);

    pool.query(sql, sql_data, function (err, rows) {
        if (err) {
            DaoUtil.errorSQL(DEBUG, FUNC, sql, sql_data, err);
            cb(err);
        }
        else {
            if (rows.length == 0) {
                cb(null, null);
            }
            else {
                var sid = rows[0].sid;
                console.log("当前玩家(" + uid + ")所在服务器:", sid);
                cb(null, sid);
            }
        }
    });
}

//==============================================================================
// private
//==============================================================================