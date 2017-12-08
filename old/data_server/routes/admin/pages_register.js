var express = require('express');
var router = express.Router();

var buzz_admin_utils = require('../../src/buzz/buzz_admin_utils');
var buzz_cst_admin = require('../../src/buzz/cst/buzz_cst_admin');
var buzz_cst_admin_register = require('../../src/buzz/cst/buzz_cst_admin_register');
var _ = require('underscore');

function _makeVar() {
    var TXT_EN = buzz_cst_admin.TXT_SIDEBAR_EN;
    TXT_EN = _.extend(TXT_EN, buzz_cst_admin_register.TXT_CONTENT_EN);
    
    var TXT_CN = buzz_cst_admin.TXT_SIDEBAR_CN;
    TXT_CN = _.extend(TXT_CN, buzz_cst_admin_register.TXT_CONTENT_CN);
    
    var data = TXT_CN;
    
    data = _.extend(data, { title: 'Register', expanded_id: 'menu_statistics' });
    return data;
}

/* GET. */
router.get('/', function (req, res) {
    console.log("req.headers: ", req.headers);
    console.log("req.body: ", req.body);

    var data = _makeVar();
    data = _.extend(data, { user_auth: {} });

    res.render("admin/pages-register", data);
});

/* POST */
router.post('/', function (req, res) {
    buzz_admin_utils.checkTokenPost(req, function (err, user_auth) {
        if (err) {
            var errMsg = JSON.stringify(err);
            console.log(errMsg);
            res.json({ rc: 10000, error: errMsg });
        } else {
            var data = _makeVar();
            data = _.extend(data, { user_auth: user_auth });
            res.render("admin/pages-register", data);
        }
    });
});

///* POST. */
//router.post('/', function (req, res) {

//    buzz_admin_utils.checkTokenPost(req, function (err, rows) {
//        if (err) {
//            console.log(JSON.stringify(err));
//            cb(err);
//        } else {
//            console.log('----------rows: ', rows);
//            var user_auth = {};
//            for (var i = 0; i < rows.length; i++) {
//                user_auth[rows[i]] = 1;
//            }
//            // 处理页面权限
//            var data = _makeVar();
//            data = _.extend(data, { user_auth: user_auth });
//            res.render("admin/pages-register", data);
//        }
//    });

//    //console.log("req.headers: ", req.headers);
//    //console.log("req.body: ", req.body);
    
//    //var data = _makeVar();
//    //data = _.extend(data, { user_auth: {} });
    
//    //res.render("admin/pages-register", data);
//});

module.exports = router;