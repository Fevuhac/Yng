////////////////////////////////////////////////////////////////////////////////
// 跨域设置
////////////////////////////////////////////////////////////////////////////////
var express = require('express');
var router = express.Router();

var cross_fn_all = function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", '3.2.1')
    next();
};

var cross_fn_json = function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", '3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
};

var cross_fn_html = function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", '3.2.1')
    res.header("Content-Type", "text/html;charset=utf-8");
    next();
};

var cross_fn_mp3 = function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", '3.2.1')
    res.header("Content-Type", "audio/mpeg");
    next();
};

router.all('/account_api/*', cross_fn_json);
router.all('/data_api/*', cross_fn_json);
router.all('/test_api/*', cross_fn_json);
router.all('/manage_api/*', cross_fn_json);
router.all('/admin_api/*', cross_fn_json);

//router.all('/fjds/pages-design-test.html', cross_fn_html);// 策划修改配置的网页
//router.all('/fjds/admin/pages-hot-res.html', cross_fn_html);// 热更新资源网页
router.all('/fjds/fishjoy_game/*', cross_fn_html);// 策划调试时使用的客户端
router.all('/app_hot_update/*', cross_fn_all);

// dev上的跨域配置
router.all('/dev/account_api/*', cross_fn_json);
router.all('/dev/data_api/*', cross_fn_json);
router.all('/dev/test_api/*', cross_fn_json);
router.all('/dev/manage_api/*', cross_fn_json);
router.all('/dev/admin_api/*', cross_fn_json);

//router.all('/dev/fjds/pages-design-test.html', cross_fn_html);// 策划修改配置的网页
//router.all('/dev/fjds/admin/pages-hot-res.html', cross_fn_html);// 热更新资源网页
router.all('/dev/fjds/fishjoy_game/*', cross_fn_html);// 策划调试时使用的客户端
router.all('/dev/app_hot_update/*', cross_fn_all);

router.all('/download/*', cross_fn_all);

module.exports = router;