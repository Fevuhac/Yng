//==============================================================================
// import
//==============================================================================
var _ = require('underscore');
var admin_common = require('./admin_common');
var data_util = require('../data/data_util');
var CacheUtil = require('../../src/buzz/cache/CacheUtil');
// var CacheAccount = require('../../src/buzz/cache/CacheAccount');
// var CacheMail = require('../../src/buzz/cache/CacheMail');
// var CacheGold = require('../../src/buzz/cache/CacheGold');

//------------------------------------------------------------------------------
// Buzz
//------------------------------------------------------------------------------
var buzz_test = require('../../src/buzz/buzz_test');


//==============================================================================
// const
//==============================================================================
var ERROR = 1;
var DEBUG = 0;

var TAG = "【routes/api/admin_test】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.modifyTestData = modifyTestData;
exports.shellTimeM = shellTimeM;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

////////////////////////////////////////
function modifyTestData(req, res) {
    const FUNC = TAG + "modifyTestData() --- ";
    const HINT = "测试修改——更改数据";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_test.modifyTestData(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

////////////////////////////////////////
function shellTimeM(req, res) {
    const FUNC = TAG + "shellTimeM() --- ";
    const HINT = "设置服务器系统时间";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_test.shellTimeM(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

//==============================================================================
// private
//==============================================================================
