////////////////////////////////////////////////////////////////////////////////
// 玩家反馈的接口实现.
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var DataUtil = require('../../src/utils/DataUtil');
var buzz_cik = require('../../src/buzz/server/buzz_cik');

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------

//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
var TAG = "【server_cik】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.addCikOrder = addCikOrder;
exports.cikReduce = cikReduce;
exports.findValuesByCid = findValuesByCid;
exports.getCikLog = getCikLog;
exports.getCikInfo = getCikInfo;
exports.cancelCik = cancelCik;


//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

function addCikOrder(req, res) {
    const FUNC = TAG + "addCikOrder() --- ";
    const HINT = "插入一个订单";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = DataUtil.parseDataObj(req, HINT);

    buzz_cik.addCikOrder(req, dataObj, function(err, result) {
        DataUtil.handleReturn(res, aes, err, result, HINT);
    });
}

function cikReduce(req, res) {
    const FUNC = TAG + "getCikLog() --- ";
    const HINT = "减少库存操作";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = DataUtil.parseDataObj(req, HINT);

    buzz_cik.cikReduce(req, dataObj, function(err, result) {
        DataUtil.handleReturn(res, aes, err, result, FUNC, HINT);
    });
}

function findValuesByCid(req, res) {
    const FUNC = TAG + "getCikLog() --- ";
    const HINT = "获取对应物品的今日库存和总库存";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = DataUtil.parseDataObj(req, HINT);

    buzz_cik.findValuesByCid(req, dataObj, function(err, result) {
        DataUtil.handleReturn(res, aes, err, result, FUNC, HINT);
    });
}

function getCikLog(req, res) {
    const FUNC = TAG + "getCikLog() --- ";
    const HINT = "实物兑换记录查询";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = DataUtil.parseDataObj(req, HINT);

    buzz_cik.getCikLog(req, dataObj, function(err, result) {
        DataUtil.handleReturn(res, aes, err, result, FUNC, HINT);
    });
}

function getCikInfo(req, res) {
    const FUNC = TAG + "getCikInfo() --- ";
    const HINT = "实物兑换获取剩余兑换数";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = DataUtil.parseDataObj(req, HINT);

    buzz_cik.getCikInfo(req, dataObj, function(err, result) {
        console.log("result:", result);
        DataUtil.handleReturn(res, aes, err, result, FUNC, HINT);
    });
}

function cancelCik(req, res) {
    const FUNC = TAG + "cancelCik() --- ";
    const HINT = "玩家取消实物兑换";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = DataUtil.parseDataObj(req, HINT);

    buzz_cik.cancelCik(req, dataObj, function(err, result) {
        DataUtil.handleReturn(res, aes, err, result, FUNC, HINT);
    });
}