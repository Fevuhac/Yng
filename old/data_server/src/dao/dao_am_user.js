////////////////////////////////////////////////////////////
// Application Management - User
// 应用管理 - 用户管理
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var utils = require('../buzz/utils');
var StringUtil = require('../utils/StringUtil');
var DaoUtil = require('./dao_utils');
var _ = require("underscore");


//==============================================================================
// const
//==============================================================================
var TAG = "【dao_am_user】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getUserList = _getUserList;
exports.addUser = _addUser;
exports.deleteUser = _deleteUser;

exports.validUser = _validUser;
exports.editUser = _editUser;
exports.userSignin = _signin;
exports.getUserAuth = _getUserAuth;
exports.getUserInfo = _getUserInfo;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 传入用户的token获取用户权限
 */
function _getUserInfo(pool, data, cb) {
    var param_name_list = [
        'token',
    ];
    
    if (DaoUtil.checkParams(param_name_list, data, cb)) {
        return;
    }
    _getUserDetail(pool, data, cb);
}

function _getUserDetail(pool, data, cb) {
    
    var token = data['token'];
    
    var sql = '';
    sql += 'SELECT id, uname, token, created_at, updated_at, role, valid ';
    sql += 'FROM tbl_admin_user ';
    sql += 'WHERE token=?';
    
    var sql_data = [token];
    
    console.log('sql: ', sql);
    console.log('sql_data: ', sql_data);
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log(JSON.stringify(err));
            cb(err);
        } else {
            console.log('result: ', result);
            if (result.length == 0) {
                var not_found_err = "查询的管理账户不存在";
                console.log(not_found_err);
                cb(new Error(not_found_err));
                return;
            }
            var role = result[0]["role"];
            console.log("用户角色: " + role);
            
            _didGetUserInfo(pool, result[0], function (err_user_info, result_user_info) {
                if (err_user_info) {
                    console.log(JSON.stringify(err_user_info));
                    cb(err_user_info);
                } else {
                    console.log('result_user_info: ', result_user_info);
                    cb(null, _.extend(result[0], result_user_info));
                }
            });
        }
    });

}

function _didGetUserInfo(pool, data, cb) {
    const FUNC = TAG + "_didGetUserInfo() --- ";
    
    var token = data['token'];
    
    var sql = '';
    sql += 'SELECT auth_ids, rname ';
    sql += 'FROM tbl_admin_role ';
    sql += 'WHERE id IN ';
    sql += '(SELECT role FROM tbl_admin_user WHERE token=?)';
    
    var sql_data = [token];
    
    console.log('sql: ', sql);
    console.log('sql_data: ', sql_data);
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log(FUNC + "err:", err);
        } else {
            console.log(FUNC + 'result: ', result);
            var auth_id_str = result[0]["auth_ids"];
            var rname = result[0]["rname"];
            var auth_id_array = StringUtil.split(auth_id_str, ",");
            
            _getAuthNames(pool, auth_id_str, function (err_auth_name, result_auth_name) {
                if (err_auth_name) {
                    console.log(JSON.stringify(err_auth_name));
                    cb(err_auth_name);
                } else {
                    console.log(FUNC + 'result_auth_name:', result_auth_name);
                    result_auth_name = _.map(result_auth_name, _.iteratee('page'));
                    console.log(FUNC + 'result_auth_name:', result_auth_name);
                    cb(null, { auth_list: result_auth_name, role_name: rname });
                }
            });
        }
    });
}

/**
 * 传入用户的token获取用户权限
 */
function _getUserAuth(pool, data, cb) {
    var param_name_list = [
        'token',
    ];
    
    if (DaoUtil.checkParams(param_name_list, data, cb)) {
        return;
    }
    _didGetUserAuth(pool, data, cb);
}

function _didGetUserAuth(pool, data, cb) {
    
    var token = data['token'];
    
    var sql = '';
    sql += 'SELECT auth_ids ';
    sql += 'FROM tbl_admin_role ';
    sql += 'WHERE id IN ';
    sql += '(SELECT role FROM tbl_admin_user WHERE token=?)';
    
    var sql_data = [token];
    
    console.log('sql: ', sql);
    console.log('sql_data: ', sql_data);
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log(JSON.stringify(err));
            cb(err);
        } else {
            console.log('result: ', result);
            var auth_id_str = result[0]["auth_ids"];
            var auth_id_array = StringUtil.split(auth_id_str, ",");
            
            _getAuthNames(pool, auth_id_str, function (err1, result1) {
                if (err1) {
                    console.log(JSON.stringify(err1));
                    cb(err1);
                } else {
                    console.log('result1: ', result1);
                    result1 = _.map(result1, _.iteratee('page'));
                    console.log('result1: ', result1);
                    cb(null, result1);
                }
            });
        }
    });
}

function _getAuthNames(pool, auth_id_str, cb) {
    
    var sql = '';
    sql += 'SELECT page ';
    sql += 'FROM tbl_admin_auth ';
    sql += 'WHERE id IN ';
    sql += '(' + auth_id_str + ')';
    
    var sql_data = [];
    
    console.log('sql: ', sql);
    console.log('sql_data: ', sql_data);
    
    pool.query(sql, sql_data, function (err, result) {
        cb(err, result);
    });
}

/**
 * 获取用户列表
 */
function _getUserList(pool, data, cb) {
    var sql = '';
    sql += 'SELECT * ';
    sql += 'FROM `tbl_admin_user`';
    
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
 * 增加一条用户记录
 */
function _addUser(pool, data, cb) {
    var param_name_list = [
        'user_name',
        'user_pwd',
        'user_role',
    ];
    
    if (DaoUtil.checkParams(param_name_list, data, cb)) {
        return;
    }
    _didAddUser(pool, data, cb);
};

function _didAddUser(pool, data, cb) {
    
    var user_name = data['user_name'];
    var user_pwd = data['user_pwd'];
    var user_role = data['user_role'];
    
    // TODO: make salt and pwd
    var salt = utils.createSalt();
    var password = utils.encodePassword(salt, user_pwd);
    var token = "";
    
    var sql = '';
    sql += 'INSERT INTO `tbl_admin_user` ';
    sql += '(`uname`, `salt`, `password`, `role`) ';
    sql += 'VALUES (?, ?, ?, ?)';
    
    var sql_data = [user_name, salt, password, user_role];
    
    console.log('sql: ', sql);
    console.log('sql_data: ', sql_data);
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log(JSON.stringify(err));
            cb(err);
        } else {
            console.log('result: ', result);
            var id = result.insertId;
            _createSessionToken(pool, id, function (err2, result2) {
                if (err2) {
                    console.log(JSON.stringify(err2));
                    cb(err2);
                } else {
                    cb(null, result2);
                }
            })
        }
    });
}

function _createSessionToken(pool, id, cb) {
    var token = utils.generateSessionToken(id);
    pool.query('UPDATE `tbl_admin_user` SET `token`=? WHERE `id`=?', [token, id], function (err, result) {
        if (err) {
            cb(err);
        } else {
            cb(null, result);
        }
    });
};

/**
 * 禁止用户(在用户管理中该用户不可见)
 */
function _deleteUser(pool, data, cb) {
    _enableUser(pool, data, cb, false);
};

/**
 * 激活用户(在用户管理中该用户可见)
 */
function _validUser(pool, data, cb) {
    _enableUser(pool, data, cb, true);
};

function _enableUser(pool, data, cb, isValid) {
    var param_name_list = [
        'user_id',
    ];
    
    if (DaoUtil.checkParams(param_name_list, data, cb)) {
        return;
    }
    _didEnableUser(pool, data, cb, isValid);
}

function _didEnableUser(pool, data, cb, isValid) {
    
    var id = data['user_id'];
    
    var sql = '';
    sql += 'UPDATE `tbl_admin_user` ';
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
 * 编辑用户
 */
function _editUser(pool, data, cb) {
    var param_name_list = [
        'user_name',
        'user_description',
        'user_auth',
        'user_id',
    ];
    
    if (DaoUtil.checkParams(param_name_list, data, cb)) {
        return;
    }
    _didEditUser(pool, data, cb);
};

// 更新用户数据
function _didEditUser(pool, data, cb) {
    
    var user_name = data['user_name'];
    var user_description = data['user_description'];
    var user_auth = data['user_auth'];
    var user_id = data['user_id'];
    
    var sql = '';
    sql += 'UPDATE `tbl_admin_user` ';
    sql += 'SET `rname`=?, `description`=?, `auth_ids`=? ';
    sql += 'WHERE `id`=?';
    
    var sql_data = [user_name, user_description, user_auth, user_id];
    
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
 * 用户登录
 */
function _signin(pool, data, cb) {
    
    var param_name_list = [
        'username',
        'password',
    ];
    
    if (DaoUtil.checkParams(param_name_list, data, cb)) {
        return;
    }
    _didSignin(pool, data, cb);
}


/**
 * 用户登录
 */
function _didSignin(pool, data, cb) {

    const FUNC = TAG + "_didSignin() --- ";
    
    var username = data['username'];
    var password = data['password'];

    var sql = '';
    sql += 'SELECT * ';
    sql += 'FROM `tbl_admin_user` ';
    sql += 'WHERE `uname`=?';
    
    var sql_data = [username];
    
    console.log(FUNC + 'sql: ', sql);
    console.log(FUNC + 'sql_data: ', sql_data);
    
    pool.query(sql, sql_data, function (err, rows) {
        if (err) {
            console.log(FUNC + 'err: ', err);
            cb(err);
            return;
        }
        
        if (rows.length <= 0) {
            console.log(FUNC + '用户不存在: ', username);
            cb(new Error('用户不存在'));
            return;
        }
        
        var account = rows[0];
        
        var id = account.id;
        var salt = account.salt;
        var encrypted = utils.encodePassword(salt, password);
        
        if (encrypted === account.password) {
            console.log(FUNC + '密码正确，返回用户数据');
            cb(null, account);
        } else {
            console.log(FUNC + '密码错误');
            cb(new Error('密码错误'));
        }
    });
}
