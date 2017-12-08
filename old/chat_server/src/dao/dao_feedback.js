/////////////////////////////////////////////////////////////////////////////////////////
// Feedback Related
// 反馈相关
/////////////////////////////////////////////////////////////////////////////////////////

//=======================================================================================
// import
//=======================================================================================
// var ObjUtil = require('../buzz/ObjUtil');
var CstError = require('../buzz/cst/buzz_cst_error');

// var DaoGold = require('./dao_gold');
// var DaoAccount = require('./dao_account');
// var DaoMail = require('./dao_mail');

// var CacheAccount = require('../buzz/cache/CacheAccount');


//------------------------------------------------------------------------------
// Cache
//------------------------------------------------------------------------------
var CachePropose = require('../buzz/cache/CachePropose');
var CacheUserInfo = require('../buzz/cache/CacheUserInfo');


//=======================================================================================
// constant
//=======================================================================================
var ERROR_CODE = CstError.ERROR_CODE;
var ERROR_OBJ = CstError.ERROR_OBJ;

var DEBUG = 0;
var ERROR = 1;

var TAG = "【dao_feedback】";

var fields = [
    // { name: "uid", type: "number", save: 1 },
    // { name: "text", type: "string", save: 1 },
    // { name: "time", type: "timestamp", save: 1 },
    {name: "like_uids", type: "array", save: 1},
    {name: "like_count", type: "number", save: 1},
];


//=======================================================================================
// public
//=======================================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.insertMsg = insertMsg;
exports.saveAll = saveAll;
exports.loadAll = loadAll;
exports.loadUserInfo = loadUserInfo;
exports.loadAllUserInfo = loadAllUserInfo;
exports.del = del;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

function insertMsg(pool, uid, text, cb) {
    var sql = "";
    sql += "INSERT INTO `tbl_propose` ";
    sql += "(uid, text) ";
    sql += "VALUES (?, ?)";

    var sql_data = [uid, text];

    if (DEBUG) console.log("sql: ", sql);
    if (DEBUG) console.log("sql_data: ", sql_data);

    pool.query(sql, sql_data, function (err, rows) {
        if (DEBUG) console.log("err: ", err);
        if (DEBUG) console.log("rows: ", rows);
        if (cb != null) cb(err, rows.insertId);
    });
}

function saveAll(pool) {
    const FUNC = TAG + "saveAll() --- ";

    // if (DEBUG) console.log(FUNC + "CALL...");

    var keys = CachePropose.keys();

    var id_collection = keys.id_collection;
    var list = keys.list;

    if (id_collection.length > 0) {
        var sql = "";
        sql += "UPDATE `tbl_propose` ";
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            if (field.save) {
                sql += _case(list, field.name, field.type, i == 0, i == fields.length - 1);
            }
        }
        sql += "WHERE id IN (" + id_collection + ")";

        var sql_data = [];

        if (DEBUG) console.log("sql: ", sql);
        if (DEBUG) console.log("sql_data: ", sql_data);
        if (DEBUG) console.log("sql.length: ", sql.length);

        pool.query(sql, sql_data, function (err, rows) {
            if (DEBUG) console.log("err: ", err);
            if (DEBUG) console.log("rows: ", rows);
            console.log(FUNC + "留言更新完毕, 共更新留言" + id_collection.length + "条");
        });
    }
    else {
        // console.log(FUNC + "没有需要更新的留言");
    }

}

function loadAll(pool, cb) {
    const FUNC = TAG + "loadAll() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");

    let sql2 = "SELECT id,uid,text,time,like_uids,like_count FROM `tbl_propose` ORDER BY like_count DESC limit 10";
    let sql1= "SELECT id,uid,text,time,like_uids,like_count FROM `tbl_propose` ORDER BY id DESC limit 90";
    pool.query(sql1,[],function (err, rows) {
        if(err) {
            cb();
            return;
        }
        CachePropose.loadAll(rows,true);
        pool.query(sql2,[],function (err, res) {
            if(err) {
                cb();
                return;
            }
            for(let i in rows) {
                for(let j in res) {
                    if(rows[i].id==res[j].id) {
                        res.splice(j, 1);
                    }
                }
            }
            if(res.length>0) {
                CachePropose.loadAll(res,false);
            }
            cb(CachePropose.uids());
        })
    })
}

/**
 * 加载指定用户信息
 */
function loadUserInfo(pool, uid, cb) {
    const FUNC = TAG + "loadUserInfo() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");

    var sql = "";
    sql += "SELECT a.id AS uid";
    sql += ", a.tempname AS tempname";
    sql += ", a.nickname AS nickname";
    sql += ", a.channel_account_name AS channel_account_name";
    sql += ", i.web_url AS figure ";
    sql += ", a.figure AS figureid ";//20170925 add
    sql += "FROM `tbl_account` AS a, `tbl_img` AS i ";
    sql += "WHERE a.figure = i.id ";
    sql += "AND a.id IN (" + uid + ") ";

    var sql_data = [];

    // if (DEBUG) console.log(FUNC + "sql: ", sql);
    // if (DEBUG) console.log(FUNC + "sql_data: ", sql_data);

    pool.query(sql, sql_data, function (err, rows) {
        // if (DEBUG) console.log(FUNC + "err: ", err);
        // if (DEBUG) console.log(FUNC + "rows: ", rows);
        if (err) {
            cb();
            return;
        }
        if (rows && rows.length > 0) {
            CacheUserInfo.push(rows[0]);
        }
        cb();
    });
}

/**
 * 加载所有用户信息
 */
function loadAllUserInfo(pool, uid_list, cb) {
    const FUNC = TAG + "loadAllUserInfo() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");

    if (uid_list.length == 0) {
        console.log(FUNC + "加载了0个玩家数据到公告板缓存中");
        cb();
        return;
    }

    var sql = "";
    sql += "SELECT a.id AS uid";
    sql += ", a.tempname AS tempname";
    sql += ", a.nickname AS nickname";
    sql += ", a.channel_account_name AS channel_account_name";
    sql += ", i.web_url AS figure ";
    sql += ", a.figure AS figureid ";
    sql += "FROM `tbl_account` AS a, `tbl_img` AS i ";
    sql += "WHERE a.figure = i.id ";
    if (uid_list) {
        sql += "AND a.id IN (" + uid_list + ") ";
    }

    var sql_data = [];

    // if (DEBUG) console.log(FUNC + "sql: ", sql);
    // if (DEBUG) console.log(FUNC + "sql_data: ", sql_data);

    pool.query(sql, sql_data, function (err, rows) {
        // if (DEBUG) console.log(FUNC + "err: ", err);
        // if (DEBUG) console.log(FUNC + "rows: ", rows);
        console.log(FUNC + "加载了" + rows.length + "个玩家数据到公告板缓存中");
        if (rows && rows.length > 0) {
            for(var i=0;i<rows.length;i++) {
                rows[i].figure = rows[i].figure;
            }
        }
        CacheUserInfo.loadAll(rows);
        cb();
    });
}

/**
 * 刪除留言.
 */
function del(pool, mid, cb) {
    const FUNC = TAG + "del() --- ";

    var sql = "";
    sql += "DELETE FROM tbl_propose ";
    sql += "WHERE id IN (" + mid + ")";

    var sql_data = [];

    if (DEBUG) console.log(FUNC + "sql: ", sql);
    if (DEBUG) console.log(FUNC + "sql_data: ", sql_data);

    pool.query(sql, sql_data, function (err, rows) {
        if (DEBUG) console.log(FUNC + "err: ", err);
        if (DEBUG) console.log(FUNC + "rows: ", rows);
        cb();
    });
}


//=======================================================================================
// private
//=======================================================================================

/**
 * 返回一个SET...END条件.
 * @param field 需要更新的字段名名(string类型).
 * @param isLast 是否最后一个SET...END子句(bool类型).
 * @param type 更新的数据类型，取值string, number, bool.
 */
function _case(list, field, type, isFirst, isLast) {
    var sql = "";
    if (isFirst) {
        sql += "SET ";
    }
    sql += field + " = CASE id ";
    for (var i = 0; i < list.length; i++) {
        var id = list[i].id;
        var field_value = list[i][field];
        sql += "WHEN " + id + " THEN ";
        switch (type) {
            case "string":
                sql += "'" + field_value + "' ";
                break;
            case "array":
                sql += "'" + field_value.toString() + "' ";
                break;
            case "number":
                sql += field_value + " ";
                break;
        }
    }
    if (isLast) {
        sql += "END ";
    }
    else {
        sql += "END, ";
    }
    return sql;
}

