var express = require('express');
var router = express.Router();
var buzz_admin_utils = require('../../src/buzz/buzz_admin_utils');
var buzz_cst_admin = require('../../src/buzz/cst/buzz_cst_admin');
var buzz_cst_om_control = require('../../src/buzz/cst/buzz_cst_om_control');
var _ = require('underscore');

function _makeVar() {
    var TXT_EN = buzz_cst_admin.TXT_SIDEBAR_EN;
    TXT_EN = _.extend(TXT_EN, buzz_cst_om_control.TXT_CONTENT_EN);
    
    var TXT_CN = buzz_cst_admin.TXT_SIDEBAR_CN;
    TXT_CN = _.extend(TXT_CN, buzz_cst_om_control.TXT_CONTENT_CN);
    
    var data = TXT_CN;
    
    data = _.extend(data, { title: 'OM Control', expanded_id: 'menu_operation' });
    return data;
}

/* POST */
router.post('/', function (req, res) {
    buzz_admin_utils.checkTokenPost(req, function (err, user_auth) {
        if (err) {
            var errMsg = JSON.stringify(err);
            console.log(errMsg);
            res.json({ rc: 10000, error: errMsg });
        } else {
            console.log('----------user_auth: ', user_auth);
            var params = _makeVar();
            params = _.extend(params, { user_auth: user_auth });
            res.render("admin/pages-om-control", params);
        }
    });
});

module.exports = router;