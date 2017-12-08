////////////////////////////////////////////////////////////
// 社交接口的业务逻辑
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// 工具(Tool)——第三方
//------------------------------------------------------------------------------
var _ = require('underscore');

//------------------------------------------------------------------------------
// 路径(Path)
//------------------------------------------------------------------------------
const PATH_CST = '../cst/';
const PATH_UTILS = '../../utils/';
const PATH_DAO = '../../dao/';
const PATH_CACHE = '../cache/';

//------------------------------------------------------------------------------
// 工具(Tool)——自定义
//------------------------------------------------------------------------------
var CstError = require(PATH_CST + 'buzz_cst_error');
var BuzzUtil = require(PATH_UTILS + 'BuzzUtil');

var ERROR_OBJ = CstError.ERROR_OBJ;

//------------------------------------------------------------------------------
// 业务
//------------------------------------------------------------------------------
// var buzz_reward = require('./buzz_reward');

//------------------------------------------------------------------------------
// 数据库访问(DAO)
//------------------------------------------------------------------------------
var dao_change = require(PATH_DAO + 'server/dao_change');

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------
var CacheOperation = require(PATH_CACHE + 'CacheOperation');
var CacheChange = require(PATH_CACHE + 'CacheChange');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
// var treasure_treasure_cfg = require('../../cfgs/treasure_treasure_cfg');

//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
var TAG = "【buzz_recieve】";


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

function addCikOrder(req, dataObj, cb) {
    const FUNC = TAG + "addCikOrder() --- ";
    //----------------------------------
    _addCikOrder(req, dataObj, cb);
}

function cikReduce(req, dataObj, cb) {
    const FUNC = TAG + "cikReduce() --- ";
    //----------------------------------
    _cikReduce(req, dataObj, cb);
}

function findValuesByCid(req, dataObj, cb) {
    const FUNC = TAG + "findValuesByCid() --- ";
    //----------------------------------
    _findValuesByCid(req, dataObj, cb);
}

function getCikLog(req, dataObj, cb) {
    const FUNC = TAG + "getCikLog() --- ";
    _didGetCikLog(req, dataObj, cb);
}

function getCikInfo(req, dataObj, cb) {
    const FUNC = TAG + "getCikInfo() --- ";
    //----------------------------------
    _didGetCikInfo(req, dataObj, cb);
}

function cancelCik(req, dataObj, cb) {
    const FUNC = TAG + "cancelCik() --- ";
    //----------------------------------
    _didCancelCik(req, dataObj, cb);
}


//==============================================================================
// private
//==============================================================================

/**
 * 插入一个订单
 */
function _addCikOrder(req, data, cb) {
    const FUNC = TAG + "_addCikOrder() --- ";
    var sn = CacheChange.makeSn();
    data.orderid = BuzzUtil.getOrderId(sn);
    data.sn = sn;
    CacheChange.push(data);

    cb(null, data);
    // // 写入数据库(由具体的API服务器来执行)
    // dao_change.insert(req.pool, data, function() {
    //     cb(null, data);
    // });
}

/**
 * 获取实物兑换记录
 */
function _cikReduce(req, dataObj, cb) {
    const FUNC = TAG + "_cikReduce() --- ";
    var cid = dataObj.cid;
    var value = dataObj.value;
    var count = CacheOperation.reduce(cid, 1, value);
    var total = CacheOperation.reduce(cid, 2, value);
    var ret = {
        count: count,
        total: total,
    };
    cb(null, ret);
}

/**
 * 获取实物兑换记录
 */
function _findValuesByCid(req, dataObj, cb) {
    const FUNC = TAG + "_findValuesByCid() --- ";
    var cid = dataObj.cid;
    var count = CacheOperation.findValueByCid(cid, 1);
    var total = CacheOperation.findValueByCid(cid, 2);
    var ret = {
        count: count,
        total: total,
    };
    cb(null, ret);
}

/**
 * 获取实物兑换记录
 */
function _didGetCikLog(req, dataObj, cb) {
    const FUNC = TAG + "_didGetCikLog() --- ";
    var uid = dataObj.uid;
    var ret = CacheChange.findChangeLogByUid(uid);
    cb(null, ret);
}

/**
 * 返回兑换数据中的每日剩余数量
 */
function _didGetCikInfo(req, dataObj, cb) {
    const FUNC = TAG + "_didGetCikInfo() --- ";
    // var uid = dataObj.uid;
    var ret = CacheOperation.getChangeDailyLeft();
    cb(null, ret);
}

/**
 * 玩家取消实物兑换
 */
function _didCancelCik(req, dataObj, cb) {
    const FUNC = TAG + "_didCancelCik() --- ";
    var uid = dataObj.uid;
    var orderid = dataObj.orderid;
    var change = CacheChange.cancelCik(uid, orderid);
    cb(null, change);
}
