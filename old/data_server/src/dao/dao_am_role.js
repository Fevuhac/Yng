////////////////////////////////////////////////////////////
// Application Management - Role
// 应用管理 - 角色管理
////////////////////////////////////////////////////////////

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
exports.getRoleList = _getRoleList;
exports.addRole = _addRole;
exports.deleteRole = _deleteRole;
exports.validRole = _validRole;
exports.editRole = _editRole;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 获取角色列表
 */
function _getRoleList(pool, data, cb) {
    var sql = '';
    sql += 'SELECT * ';
    sql += 'FROM `tbl_admin_role`';
    
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
 * 增加一条角色记录
 */
function _addRole(pool, data, cb) {
    var param_name_list = [
        'role_name',
        'role_description',
        'role_auth',
    ];
    
    if (DaoUtil.checkParams(param_name_list, data, cb)) {
        return;
    }
    _didAddRole(pool, data, cb);
};

function _didAddRole(pool, data, cb) {
    
    var role_name = data['role_name'];
    var role_description = data['role_description'];
    var role_auth = data['role_auth'];
    
    var sql = '';
    sql += 'INSERT INTO `tbl_admin_role` ';
    sql += '(`rname`, `description`, `auth_ids`) ';
    sql += 'VALUES (?, ?, ?)';
    
    var sql_data = [role_name, role_description, role_auth];
    
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
 * 禁止角色(在角色管理中该角色不可见)
 */
function _deleteRole(pool, data, cb) {
    _enableRole(pool, data, cb, false);
};

/**
 * 激活角色(在角色管理中该角色可见)
 */
function _validRole(pool, data, cb) {
    _enableRole(pool, data, cb, true);
};

function _enableRole(pool, data, cb, isValid) {
    var param_name_list = [
        'role_id',
    ];
    
    if (DaoUtil.checkParams(param_name_list, data, cb)) {
        return;
    }
    _didEnableRole(pool, data, cb, isValid);
}

function _didEnableRole(pool, data, cb, isValid) {
    
    var id = data['role_id'];
    
    var sql = '';
    sql += 'UPDATE `tbl_admin_role` ';
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
 * 编辑角色
 */
function _editRole(pool, data, cb) {
    var param_name_list = [
        'role_name',
        'role_description',
        'role_auth',
        'role_id',
    ];
    
    if (DaoUtil.checkParams(param_name_list, data, cb)) {
        return;
    }
    _didEditRole(pool, data, cb);
};

// 更新角色数据
function _didEditRole(pool, data, cb) {
    
    var role_name = data['role_name'];
    var role_description = data['role_description'];
    var role_auth = data['role_auth'];
    var role_id = data['role_id'];
    
    var sql = '';
    sql += 'UPDATE `tbl_admin_role` ';
    sql += 'SET `rname`=?, `description`=?, `auth_ids`=? ';
    sql += 'WHERE `id`=?';
    
    var sql_data = [role_name, role_description, role_auth, role_id];
    
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
