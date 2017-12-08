////////////////////////////////////////////////////////////////////////////////
// 跨域设置
////////////////////////////////////////////////////////////////////////////////
var express = require('express');
var router = express.Router();
const CACHE_TIME = 86400;

var cross_fn_all = function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", '3.2.1');
    next();
};

var max_age_all = function (req, res, next) {
    res.setHeader("Cache-Control", 'max-age=' + CACHE_TIME);
    next();
};

router.all('/fishjoy_js/*', cross_fn_all);
router.all('/fishjoy/*', cross_fn_all);
router.all('/cfgs/*', cross_fn_all);
router.all('/img/*', cross_fn_all);
router.all('/*', cross_fn_all);
router.all('/*', cross_fn_all);

router.all('/fishjoy/res/raw-assets/*', max_age_all);
router.all('/fishjoy/res/raw-internal/*', max_age_all);


module.exports = router;