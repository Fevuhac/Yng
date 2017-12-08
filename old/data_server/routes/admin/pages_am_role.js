var express = require('express');
var router = express.Router();
var buzz_admin_utils = require('../../src/buzz/buzz_admin_utils');
var buzz_cst_admin = require('../../src/buzz/cst/buzz_cst_admin');
var buzz_cst_am_role = require('../../src/buzz/cst/buzz_cst_am_role');
var _ = require('underscore');

function _makeVar() {
    var TXT_EN = buzz_cst_admin.TXT_SIDEBAR_EN;
    TXT_EN = _.extend(TXT_EN, buzz_cst_am_role.TXT_CONTENT_EN);
    
    var TXT_CN = buzz_cst_admin.TXT_SIDEBAR_CN;
    TXT_CN = _.extend(TXT_CN, buzz_cst_am_role.TXT_CONTENT_CN);
    
    var data = TXT_CN;
    
    data = _.extend(data, { title: 'Role Mgmt', expanded_id: 'menu_back_mgmt' });
    return data;
}

function _getRoleList(req, cb) {
    // TODO: 查询数据库获取数据(需要变为回调形式)
    req.dao.getRoleList({}, function (err, rows) {
        if (err) {
            //res.success({ type: 1, msg: '更新玩家金币数据失败', err: '' + err });
        } else {
            console.log("role_list:", rows);
            cb(rows);
        }
    });

    //cb([]);
}

/* GET home page. */
router.get('/', function (req, res) {
    buzz_admin_utils.checkToken(req, function () {
        var params = _makeVar(req);
        
        _getRoleList(req, function (rows) {
            params = _.extend(params, { role_list: rows });
            res.render("admin/pages-am-role", params);
        });
    });
});

/* POST */
router.post('/', function (req, res) {
    buzz_admin_utils.checkTokenPost(req, function (err, user_auth) {
        if (err) {
            var errMsg = JSON.stringify(err);
            console.log(errMsg);
            res.json({ rc: 10000, error: errMsg });
        } else {
            console.log('----------user_auth: ', user_auth);
            var params = _makeVar(req);
            params = _.extend(params, { user_auth: user_auth });
            
            _getRoleList(req, function (rows) {
                params = _.extend(params, { role_list: rows });
                res.render("admin/pages-am-role", params);
            });
        }
    });
});

module.exports = router;