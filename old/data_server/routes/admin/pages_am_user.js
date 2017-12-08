var express = require('express');
var router = express.Router();
var buzz_admin_utils = require('../../src/buzz/buzz_admin_utils');
var buzz_cst_admin = require('../../src/buzz/cst/buzz_cst_admin');
var buzz_cst_am_user = require('../../src/buzz/cst/buzz_cst_am_user');
var _ = require('underscore');

function _makeVar() {
    var TXT_EN = buzz_cst_admin.TXT_SIDEBAR_EN;
    TXT_EN = _.extend(TXT_EN, buzz_cst_am_user.TXT_CONTENT_EN);
    
    var TXT_CN = buzz_cst_admin.TXT_SIDEBAR_CN;
    TXT_CN = _.extend(TXT_CN, buzz_cst_am_user.TXT_CONTENT_CN);
    
    var data = TXT_CN;
    
    data = _.extend(data, { title: 'User Mgmt', expanded_id: 'menu_back_mgmt' });
    return data;
}

function _getUserList(req, cb) {
    req.dao.getUserList({}, function (err, rows) {
        if (err) {
            //res.success({ type: 1, msg: '更新玩家金币数据失败', err: '' + err });
        } else {
            console.log("user_list:", rows);
            cb(rows);
        }
    });
}

/* GET home page. */
router.get('/', function (req, res) {
    buzz_admin_utils.checkToken(req, function () {
        var params = _makeVar(req);
        
        _getUserList(req, function (rows) {
            params = _.extend(params, { user_list: rows });
            res.render("admin/pages-am-user", params);
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
            
            _getUserList(req, function (rows) {
                params = _.extend(params, { user_list: rows });
                res.render("admin/pages-am-user", params);
            });
        }
    });
});

module.exports = router;