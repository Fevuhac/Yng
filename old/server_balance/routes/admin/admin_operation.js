//==============================================================================
// import
//==============================================================================
var _ = require('underscore');

const PATH_SRC = '../../src';
const PATH_SRC_BUZZ = PATH_SRC + '/buzz';
const PATH_SRC_UTILS = PATH_SRC + '/utils';

var DataUtil = require(PATH_SRC_UTILS + '/DataUtil');

//------------------------------------------------------------------------------
// Buzz
//------------------------------------------------------------------------------
var buzz_operation = require(PATH_SRC_BUZZ + '/server/buzz_operation');
var buzz_change = require(PATH_SRC_BUZZ + '/server/buzz_change');


//==============================================================================
// const
//==============================================================================
var ERROR = 1;
var DEBUG = 0;

var TAG = "【routes/server/admin_operation】";


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

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

////////////////////////////////////////
function getOperationCfgs(req, res) {
    const FUNC = TAG + "getOperationCfgs() --- ";
    const HINT = "运营管理——获取运营配置";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = DataUtil.parseDataObj(req, HINT);

    buzz_operation.getOperationCfgs(req, dataObj, function(err, result) {
        DataUtil.handleReturn(res, aes, err, result, FUNC, HINT);
    });
}

////////////////////////////////////////
function modifyCfgs(req, res) {
    const FUNC = TAG + "modifyCfgs() --- ";
    const HINT = "运营管理——修改配置";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = DataUtil.parseDataObj(req, HINT);

    buzz_operation.modifyCfgs(req, dataObj, function(err, result) {
        DataUtil.handleReturn(res, aes, err, result, FUNC, HINT);
    });
}

function modifyOrders(req, res) {
    const FUNC = TAG + "modifyOrders() --- ";
    const HINT = "修改订单状态和信息";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = DataUtil.parseDataObj(req, HINT);

    buzz_change.modifyOrders(req, dataObj, function(err, result) {
        DataUtil.handleReturn(res, aes, err, result, FUNC, HINT);
    });
}

function getChangeOrder(req, res) {
    const FUNC = TAG + "getChangeOrder() --- ";
    const HINT = "运营管理——获取指定时间段内的订单";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = DataUtil.parseDataObj(req, HINT);

    buzz_operation.getChangeOrder(req, dataObj, function(err, result) {
        DataUtil.handleReturn(res, aes, err, result, FUNC, HINT);
    });
}

//==============================================================================
// private
//==============================================================================
