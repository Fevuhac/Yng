////////////////////////////////////////////////////////////
// 运营管理接口的业务逻辑
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
const PATH_CACHE = '../cache/';

//------------------------------------------------------------------------------
// 工具(Tool)——自定义
//------------------------------------------------------------------------------
var CstError = require(PATH_CST + 'buzz_cst_error');
var ObjUtil = require(PATH_UTILS + 'ObjUtil');
// var BuzzUtil = require('../../utils/BuzzUtil');
// var RandomUtil = require('../utils/RandomUtil');

var ERROR_OBJ = CstError.ERROR_OBJ;

//------------------------------------------------------------------------------
// POJO
//------------------------------------------------------------------------------
// var Reward = require('./pojo/Reward');

//------------------------------------------------------------------------------
// 业务
//------------------------------------------------------------------------------
// var buzz_reward = require('./buzz_reward');

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------
var CacheOperation = require(PATH_CACHE + 'CacheOperation');
var CacheChange = require(PATH_CACHE + 'CacheChange');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
// var api_map = require('../../routes/api_map');
// var treasure_treasure_cfg = require('../../cfgs/treasure_treasure_cfg');

//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
var TAG = "【buzz_operation】";

/** 运营操作类型 */
var OP_TYPE = {
    /** 实物兑换 */
    CHANGE_IN_KIND: 1,
    /** 总开关 */
    SWITCH: 2,
};


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getOperationCfgs = getOperationCfgs;
exports.modifyCfgs = modifyCfgs;
exports.getChangeOrder = getChangeOrder;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 运营管理——获取运营配置.
 */
function getOperationCfgs(req, dataObj, cb) {
    const FUNC = TAG + "getOperationCfgs() --- ";
    //----------------------------------
    // if (!lPrepare(dataObj)) return;

    _getOperationCfgs(req, dataObj, cb);

    // function lPrepare(input) {
    //     return BuzzUtil.checkParams(input, ['type'], "buzz_operation", cb);
    // }
}

/**
 * 运营管理——修改配置.
 */
function modifyCfgs(req, dataObj, cb) {
    const FUNC = TAG + "modifyCfgs() --- ";
    //----------------------------------
    // if (!lPrepare(dataObj)) return;

    _modifyCfgs(req, dataObj, cb);

    // function lPrepare(input) {
    //     return BuzzUtil.checkParams(input, ['oid'], "buzz_operation", cb);
    // }
}

function getChangeOrder(req, dataObj, cb) {
    const FUNC = TAG + "getChangeOrder() --- ";
    //----------------------------------
    // if (!lPrepare(dataObj)) return;

    _getChangeOrder(req, dataObj, cb);
}

//==============================================================================
// private
//==============================================================================

////////////////////////////////////////////////////////////
// 获取运营配置数据

/**
 * 运营管理——获取运营配置.
 */
function _getOperationCfgs(req, dataObj, cb) {
    const FUNC = TAG + "_getOperationCfgs() --- ";
    //----------------------------------

    var type = dataObj.type;

    console.log(FUNC + "type:", type);

    // TODO: 改变内存中数据, 需要时才写入数据库
    switch (type) {
        case OP_TYPE.CHANGE_IN_KIND:
            _getChangeCfgs(req, cb);
        break;
        case OP_TYPE.SWITCH:
            _getSwitch(req, cb);
        break;
    }
}

/**
 * 获取实物兑换相关配置数据.
 */
function _getChangeCfgs(req, cb) {
    const FUNC = TAG + "_getChangeCfgs() --- ";
    //----------------------------------

    var ret = CacheOperation.findCfgsByType(OP_TYPE.CHANGE_IN_KIND);

    cb(null, ret);
}

/**
 * 获取实物兑换相关配置数据.
 */
function _getSwitch(req, cb) {
    const FUNC = TAG + "_getSwitch() --- ";
    //----------------------------------

    var ret = CacheOperation.findCfgsByType(OP_TYPE.SWITCH);

    cb(null, ret);
}


////////////////////////////////////////////////////////////
// 配置实物兑换数据

/**
 * 运营管理——实物兑换配置
 */
function _modifyCfgs(req, dataObj, cb) {
    const FUNC = TAG + "_modifyCfgs() --- ";
    //----------------------------------

    var oid = dataObj.oid;
    var value = dataObj.value;
    var desc = dataObj.desc;
    var change = dataObj.change;
    var cfg_id = dataObj.cfg_id;

    console.log(FUNC + "oid:", oid);
    console.log(FUNC + "value:", value);
    console.log(FUNC + "desc:", desc);
    console.log(FUNC + "change:", change);
    console.log(FUNC + "cfg_id:", cfg_id);

    if (!_.isUndefined(desc)) {
        CacheOperation.updateDesc(oid, desc);
        cb(null, CacheOperation.findCfgsById(oid).desc);
    }
    if (!_.isUndefined(value)) {
        CacheOperation.updateValue(oid, value);
        cb(null, CacheOperation.findCfgsById(oid).value);
    }
    if (!_.isUndefined(change)) {
        CacheOperation.change(oid, change);
        cb(null, CacheOperation.findCfgsById(oid).value);
    }
    if (!_.isUndefined(cfg_id)) {
        CacheOperation.updateCid(oid, cfg_id);
        cb(null, CacheOperation.findCfgsById(oid).cfg_id);
    }
}

function _getChangeOrder(req, dataObj, cb) {
    const FUNC = TAG + "_getChangeOrder() --- ";
    //----------------------------------
    var start_date = dataObj.start_date;
    var end_date = dataObj.end_date;
    var filter = dataObj.filter;
    
    console.log(FUNC + "start_date:", start_date);
    console.log(FUNC + "end_date:", end_date);
    console.log(FUNC + "filter:", filter);

    // var ret = CacheChange.findOrdersByTimeRange(start_date, end_date);

    var ret = CacheChange.findOrdersByTimeRangeAndFilter(start_date, end_date, filter);

    cb(null, ret);
}
