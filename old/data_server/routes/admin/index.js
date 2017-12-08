var express = require('express');
var router = express.Router();
var buzz_admin_utils = require('../../src/buzz/buzz_admin_utils');
var buzz_cst_admin = require('../../src/buzz/cst/buzz_cst_admin');
var _ = require('underscore');

function _makeVar() {
    var TXT_EN = buzz_cst_admin.TXT_SIDEBAR_EN;
    var TXT_CN = buzz_cst_admin.TXT_SIDEBAR_CN;
    var data = TXT_CN;
    
    data = _.extend(data, { title: 'Dashboard', expanded_id: 'menu_dashboard' });
    console.log(data.title);
    return data;
}

/* GET. */
router.get('/', function (req, res) {
    buzz_admin_utils.checkToken(req, function () {
        res.render("admin/pages-signin", { title: 'Admin Signin' });
        //res.render("admin/index", _makevar());
    });
});

/* POST: 需要验证token, 决定用户的访问权限. */
router.post('/', function (req, res) {
    buzz_admin_utils.checkTokenPost(req, function (err, user_auth, user_info) {
        if (err) {
            var errMsg = JSON.stringify(err);
            console.log(errMsg);
            res.json({ rc: 10000, error: errMsg });
        } else {
            console.log('----------user_auth: ', user_auth);
            // 处理页面权限
            var data = _makeVar();
            var extend_user_info = {
                user_auth: user_auth,
                user_name: user_info['uname'],
                user_role: user_info['role_name']
            };
            data = _.extend(data, extend_user_info);

            console.log("跳转到仪表盘");
            res.render("admin/index", data);
        }
    });
});

module.exports = router;