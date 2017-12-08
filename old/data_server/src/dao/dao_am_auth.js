////////////////////////////////////////////////////////////////////////////////
// Application Management - Auth
// 应用管理 - 权限管理
// addAuth
// deleteAuth
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var utils = require('../buzz/utils');
var StringUtil = require('../utils/StringUtil');
var DaoUtil = require('./dao_utils');


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getAuthList = _getAuthList;
exports.addAuth = _addAuth;
exports.deleteAuth = _deleteAuth;
exports.validAuth = _validAuth;
exports.editAuth = _editAuth;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
/**
 * 获取权限列表
 */
function _getAuthList(pool, data, cb) {
    var sql = '';
    sql += 'SELECT * ';
    sql += 'FROM `tbl_admin_auth`';
    
    var sql_data = [];
    
    console.log('sql: ', sql);
    console.log('sql_data: ', sql_data);
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log(JSON.stringify(err));
            cb(err);
        } else {
            console.log('result: ', result);
            cb(null, result);
        }
    });
}

/**
 * 增加一条权限记录
 */
function _addAuth(pool, data, cb) {
    var param_name_list = [
        'auth_page',
        'auth_description',
        'auth_parent',
        'auth_level',
    ];
    
    if (DaoUtil.checkParams(param_name_list, data, cb)) {
        return;
    }
    _didAddAuth(pool, data, cb);
};

function _didAddAuth(pool, data, cb) {
    
    var page = data['auth_page'];
    var description = data['auth_description'];
    var parent = data['auth_parent'];
    var level = data['auth_level'];
    
    var sql = '';
    sql += 'INSERT INTO `tbl_admin_auth` ';
    sql += '(`page`, `description`, `parent`, `level`) ';
    sql += 'VALUES (?, ?, ?, ?)';
    
    var sql_data = [page, description, parent, level];
    
    console.log('sql: ', sql);
    console.log('sql_data: ', sql_data);
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log(JSON.stringify(err));
            cb(err);
        } else {
            console.log('result: ', result);
            cb(null, result);
        }
    });
}

/**
 * 禁止权限(在角色管理中该权限不可见)
 */
function _deleteAuth(pool, data, cb) {
    _enableAuth(pool, data, cb, false);
};

/**
 * 激活权限(在角色管理中该权限可见)
 */
function _validAuth(pool, data, cb) {
    _enableAuth(pool, data, cb, true);
};

function _enableAuth(pool, data, cb, isValid) {
    var param_name_list = [
        'auth_id',
    ];
    
    if (DaoUtil.checkParams(param_name_list, data, cb)) {
        return;
    }
    _didEnableAuth(pool, data, cb, isValid);
}

function _didEnableAuth(pool, data, cb, isValid) {
    
    var id = data['auth_id'];
    
    var sql = '';
    sql += 'UPDATE `tbl_admin_auth` ';
    sql += 'SET `valid`=? ';
    sql += 'WHERE `id`=?';
    
    var sql_data = [isValid, id];
    
    console.log('sql: ', sql);
    console.log('sql_data: ', sql_data);
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log(JSON.stringify(err));
            cb(err);
        } else {
            console.log('result: ', result);
            cb(null, result);
        }
    });
}

/**
 * 编辑权限
 */
function _editAuth(pool, data, cb) {
    var param_name_list = [
        'auth_page',
        'auth_description',
        'auth_parent',
        'auth_level',
        'auth_id',
    ];
    
    if (DaoUtil.checkParams(param_name_list, data, cb)) {
        return;
    }
    _didEditAuth(pool, data, cb);
};

// 更新权限数据
function _didEditAuth(pool, data, cb) {
    
    var page = data['auth_page'];
    var description = data['auth_description'];
    var parent = data['auth_parent'];
    var level = data['auth_level'];
    var id = data['auth_id'];
    
    var sql = '';
    sql += 'UPDATE `tbl_admin_auth` ';
    sql += 'SET `page`=?, `description`=?, `parent`=?, `level`=? ';
    sql += 'WHERE `id`=?';
    
    var sql_data = [page, description, parent, level, id];
    
    console.log('sql: ', sql);
    console.log('sql_data: ', sql_data);
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log(JSON.stringify(err));
            cb(err);
        } else {
            console.log('result: ', result);
            cb(null, result);
        }
    });
}
