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
var buzz_operation = require('../../src/buzz/buzz_operation');
var buzz_change = require('../../src/buzz/buzz_change');


//==============================================================================
// const
//==============================================================================
var ERROR = 1;
var DEBUG = 0;

var TAG = "【routes/api/admin_operation】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getOperationCfgs = getOperationCfgs;
exports.modifyCfgs = modifyCfgs;
exports.modifyOrders = modifyOrders;
exports.getChangeOrder = getChangeOrder;

exports.addHuafeiquan = addHuafeiquan;
exports.queryJackpot = queryJackpot;
exports.queryPlayer = queryPlayer;
exports.changeRate = changeRate;
exports.queryProfit = queryProfit;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

////////////////////////////////////////
function queryProfit(req, res) {
    const FUNC = TAG + "queryProfit() --- ";
    const HINT = "运营管理——查询盈亏排行榜";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_operation.queryProfit(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

////////////////////////////////////////
function queryJackpot(req, res) {
    const FUNC = TAG + "queryJackpot() --- ";
    const HINT = "运营管理——查询奖池总览数据";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_operation.queryJackpot(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

////////////////////////////////////////
function queryPlayer(req, res) {
    const FUNC = TAG + "queryPlayer() --- ";
    const HINT = "运营管理——查询玩家数据";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_operation.queryPlayer(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

////////////////////////////////////////
function changeRate(req, res) {
    const FUNC = TAG + "changeRate() --- ";
    const HINT = "运营管理——修改捕获率";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_operation.changeRate(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

////////////////////////////////////////
function addHuafeiquan(req, res) {
    const FUNC = TAG + "addHuafeiquan() --- ";
    const HINT = "运营管理——取消订单给玩家返还话费券";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_operation.addHuafeiquan(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

////////////////////////////////////////
function getOperationCfgs(req, res) {
    const FUNC = TAG + "getOperationCfgs() --- ";
    const HINT = "运营管理——获取运营配置";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_operation.getOperationCfgs(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

////////////////////////////////////////
function modifyCfgs(req, res) {
    const FUNC = TAG + "modifyCfgs() --- ";
    const HINT = "运营管理——修改配置";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_operation.modifyCfgs(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

function modifyOrders(req, res) {
    const FUNC = TAG + "modifyOrders() --- ";
    const HINT = "修改订单状态和信息";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_change.modifyOrders(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

function getChangeOrder(req, res) {
    const FUNC = TAG + "getChangeOrder() --- ";
    const HINT = "运营管理——获取指定时间段内的订单";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_operation.getChangeOrder(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

//==============================================================================
// private
//==============================================================================

// function isNull(field) {
//     return field == null || field == undefined || field == "";
// }

// function handleDaoResult(res, err, results, hint, FUNC) {
//     if (err) {
//         console.error(FUNC + hint + "失败");
//         console.error(FUNC + "err:", err);
//     }
//     else {
//         console.error(FUNC + hint + "成功");
//         console.log(FUNC + "results:", results);
//     }
//     admin_common.response(hint, res, err, results);
// }