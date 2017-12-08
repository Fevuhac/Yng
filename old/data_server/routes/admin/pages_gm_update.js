var express = require('express');
var router = express.Router();

var FileUtil = require('../../src/utils/FileUtil');
var StringUtil = require('../../src/utils/StringUtil');

var buzz_admin_utils = require('../../src/buzz/buzz_admin_utils');
var buzz_cst_admin = require('../../src/buzz/cst/buzz_cst_admin');
var buzz_cst_gm_update = require('../../src/buzz/cst/buzz_cst_gm_update');

var _ = require('underscore');

function _makeVar() {
    var TXT_EN = buzz_cst_admin.TXT_SIDEBAR_EN;
    TXT_EN = _.extend(TXT_EN, buzz_cst_gm_update.TXT_CONTENT_EN);
    
    var TXT_CN = buzz_cst_admin.TXT_SIDEBAR_CN;
    TXT_CN = _.extend(TXT_CN, buzz_cst_gm_update.TXT_CONTENT_CN);
    
    var data = TXT_CN;
    
    data = _.extend(data, { title: 'Update Game', expanded_id: 'menu_game_mgmt' });
    
    // 策划更新不再更新下面的文件(后台前端ejs和js文件都要做相应的修改)
    // // 获得res下的目录列表(raw - assets和raw - internal分别获取)
    // var path_assets = './public/fishjoy_game/res/raw-assets';
    // var path_internal = './public/fishjoy_game/res/raw-internal';
    // var path_assets_list = FileUtil.listDir(path_assets, true, false);
    // var path_internal_list = FileUtil.listDir(path_internal, true, false);
    
    // data = _.extend(data,
    //     {
    //         path_assets_list: path_assets_list,
    //         path_internal_list: path_internal_list,
    //     }
    // );
    return data;
}

/* GET home page. */
router.get('/', function (req, res) {
    res.render("admin/pages-gm-update", _makeVar());
    // res.render("admin/pages-gm-update", {});
});

/* POST */
router.post('/', function (req, res) {
    buzz_admin_utils.checkTokenPost(req, function (err, user_auth) {
        if (err) {
            var errMsg = JSON.stringify(err);
            console.log(errMsg);
            res.json({ rc: 10000, error: errMsg });
        } else {
            var params = _makeVar(req);
            params = _.extend(params, { user_auth: user_auth });
            // var params = { user_auth: user_auth };
            
            res.render("admin/pages-gm-update", params);
        }
    });
});

module.exports = router;