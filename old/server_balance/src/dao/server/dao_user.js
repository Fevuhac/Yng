////////////////////////////////////////////////////////////
// 运营设置参数的数据库读写逻辑
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------
var _ = require('underscore');
var ObjUtil = require('../../utils/ObjUtil');
var ArrayUtil = require('../../utils/ArrayUtil');
var DateUtil = require('../../utils/DateUtil');
var buzz_cst_error = require('../../buzz/cst/buzz_cst_error');

var ERROR_OBJ = buzz_cst_error.ERROR_OBJ;

//------------------------------------------------------------------------------
// 业务
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// 缓存
//------------------------------------------------------------------------------
var CacheUser = require('../../buzz/cache/CacheUser');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------

//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
var TAG = "【dao_change】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.loadAll = loadAll;
exports.insert = insert;
exports.remove = remove;
exports.flush = flush;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 意外Crash或服务器需要重启更新时调用, 将所有的CacheOperation数据写入数据库.
 */
function flush(pool, cb) {
    const FUNC = TAG + "flush() --- ";
    //----------------------------------

    var list = CacheUser.obj();
    if (_.keys(list).length > 0) {
        _updateAll(pool, list, cb);
    }
    else {
        cb("没有可以插入的数据");
    }

}

/**
 * 加载所有的用户服务器信息.
 */
function loadAll(pool, cb) {
    const FUNC = TAG + "read() --- ";
    //----------------------------------

    _didRead(pool, function(err, results) {
        CacheUser.init(results);
        cb();
    });
}

/**
 * 插入一条记录
 */
function insert(pool, data, cb) {
    const FUNC = TAG + "insert() --- ";
    //----------------------------------

    _didInsert(pool, data, function(err, results) {
        cb();
    });
}

/**
 * 移除一条记录
 */
function remove(pool, data, cb) {
    const FUNC = TAG + "remove() --- ";
    //----------------------------------

    _didRemove(pool, data, function(err, results) {
        cb();
    });
}

//==============================================================================
// private
//==============================================================================

/**
 * TODO: 订单的数据需要及时更新到数据库
 * 订单数据会有更新，也会有插入, 需要研究如何在一个SQL语句中完成
 * 两种方法: INSERT, REPLACE
 * INSERT: 先尝试插入, 若主键存在则更新
 * REPLACE: 先尝试插入, 若主键存在删除原有记录再INSERT
 * 综合考虑, 建立订单时就在数据库插入, 这里需要做的就是更新操作
 * 可以更新的字段如下
 * ship_at: 发货时间
 * status: 订单状态
 * thingnum: 物流单号
 * way: 物流渠道
 * 
 */
function _updateAll(pool, list, cb) {
    const FUNC = TAG + "_updateAll() --- ";
    var keys = _.keys(list);
    if (DEBUG) console.log(FUNC + "keys:", keys);
    if (DEBUG) console.log(FUNC + "list:", list);
    DEBUG = 0;
    const ALTERABLE_FIELD = [
        { field: 'sid', type: 'number'}, 
    ];
    //----------------------------------
    var sql = "";
    sql += "UPDATE `tbl_account_server` ";
    sql += "SET ";
    for (var i = 0; i < ALTERABLE_FIELD.length; i++) {
        var field_info = ALTERABLE_FIELD[i];
        var field = field_info.field;
        var type = field_info.type;
        sql += "`" + field + "` = CASE uid ";
        for (var idx in keys) {
            var value = list["" + keys[idx]][field];
            if (type == 'timestamp' && value != null) {
                value = "'" + DateUtil.format(new Date(value), "yyyy-MM-dd hh:mm:ss") + "'";
            }
            else if (type == 'string' && value != null) {
                value = "'" + value + "'";
            }
            sql += "    WHEN " + keys[idx] + " THEN " + value + " ";
        }
        sql += "END";
        if (i < ALTERABLE_FIELD.length - 1) {
            sql += ", ";
        }
    }

    var sql_data = [];

    handleQuery(pool, sql, sql_data, cb);
}

/**
 * 读取对应类型的运营配置
 */
function _didRead(pool, cb) {
    const FUNC = TAG + "_didRead() --- ";
    DEBUG = 0;
    //----------------------------------
    var sql = "";
    sql += "SELECT *, unix_timestamp(login_time) * 1000 AS login_time ";
    sql += "FROM `tbl_account_server` ";

    var sql_data = [];

    handleQuery(pool, sql, sql_data, cb);
}

/**
 * 插入一条服务器分配记录
 */
function _didInsert(pool, data, cb) {
    const FUNC = TAG + "_didInsert() --- ";
    //----------------------------------
    var sql = "";

    // 使用ON DUPLICATE KEY UPDATE
    sql += "INSERT INTO tbl_account_server ";
    sql += "(uid, sid, login_time) ";
    sql += "VALUES ";
    sql += "(?,?,?) ";
    sql += "ON DUPLICATE KEY UPDATE sid=?, login_time=? ";

    var sql_data = [
        data.uid,
        data.sid,
        new Date(data.login_time),
        data.sid,
        new Date(data.login_time),
    ];

    handleQuery(pool, sql, sql_data, cb);
}

/**
 * 移除一条记录服务器分配记录.
 * 用户退出游戏logout， 一定时间不活跃, 则删除游戏服中用户缓存并通知负载服
 */
function _didRemove(pool, data, cb) {
    const FUNC = TAG + "_didRemove() --- ";
    //----------------------------------
    var sql = "";
    sql += "DELETE FROM tbl_account_server ";
    sql += "WHERE uid=? ";

    var sql_data = [
        data.uid,
    ];

    handleQuery(pool, sql, sql_data, cb);
}



//==============================================================================
// 需要转移
//==============================================================================

function handleQuery(pool, sql, sql_data, cb) {
    const FUNC = TAG + "handleQuery() --- ";
    if (DEBUG) console.log(FUNC + 'sql:\n', sql);
    if (DEBUG) console.log(FUNC + 'sql_data:\n', sql_data);
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            if (ERROR) console.error(FUNC + "err:\n", err);
            if (ERROR) console.error(FUNC + 'sql:\n', sql);
            if (ERROR) console.error(FUNC + 'sql_data:\n', sql_data);
        } else {
            if (DEBUG) console.log(FUNC + 'result: ', result);
        }
        cb(err, result);
    });
}

