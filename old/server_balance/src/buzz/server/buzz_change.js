////////////////////////////////////////////////////////////
// 实物兑换订单相关接口的业务逻辑
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
// var BuzzUtil = require(PATH_UTILS + 'BuzzUtil');

var ERROR_OBJ = CstError.ERROR_OBJ;

//------------------------------------------------------------------------------
// 对象(POJO)
//------------------------------------------------------------------------------
// var Reward = require('./pojo/Reward');

//------------------------------------------------------------------------------
// 业务(BUZZ)
//------------------------------------------------------------------------------
// var buzz_reward = require('./buzz_reward');

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------
var CacheChange = require(PATH_CACHE + 'CacheChange');
const ORDER_STATUS = CacheChange.ORDER_STATUS;

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------

//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
var TAG = "【buzz_change】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.modifyOrders = modifyOrders;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------


/**
 * 运营管理——修改配置.
 */
function modifyOrders(req, dataObj, cb) {
    const FUNC = TAG + "modifyCfgs() --- ";
    //----------------------------------

    _modifyOrders(req, dataObj, cb);
}

//==============================================================================
// private
//==============================================================================

/**
 * 修改订单状态
 */
function _modifyOrders(req, dataObj, cb) {
    const FUNC = TAG + "_modifyOrders() --- ";
    //----------------------------------

    var op = dataObj.op;
    var orderid = dataObj.orderid;
    var way = dataObj.way;
    var thingnum = dataObj.thingnum;
    var card_num = dataObj.card_num;
    var card_pwd = dataObj.card_pwd;
    var status = dataObj.status;

    console.log(FUNC + "op:", op);
    console.log(FUNC + "orderid:", orderid);
    console.log(FUNC + "way:", way);
    console.log(FUNC + "thingnum:", thingnum);
    console.log(FUNC + "card_num:", card_num);
    console.log(FUNC + "card_pwd:", card_pwd);
    console.log(FUNC + "status:", status);

    var extraInfo = null;
    if ("status" == op) {
        console.log(FUNC + '"status" == op');
        // 发货时需要及时判断当前订单是否被取消，已取消就不能发了
        var curStatus = CacheChange.getStatusByOrderId(orderid);
        console.log(FUNC + 'curStatus:', curStatus);
        if (curStatus != ORDER_STATUS.CANCEL) {
            CacheChange.updateStatus(req, orderid, status);
        }
        else {
            var uid = CacheChange.getUidByOrderId(orderid);
            extraInfo = "玩家" + uid + "已经取消了订单, 不能发送";
            console.log(FUNC + 'extraInfo:', extraInfo);
        }
    }
    else if ("way" == op) {
        console.log(FUNC + '"way" == op');
        CacheChange.updateWay(req, orderid, way, thingnum);
    }
    else if ("card" == op) {
        console.log(FUNC + '"card" == op');
        CacheChange.updateCard(req, orderid, card_num, card_pwd);
    }
    var ret  = {
        status: CacheChange.getStatusByOrderId(orderid),
    };
    if (extraInfo != null) {
        ret.extraInfo = extraInfo;
    }
    cb(null, ret);
}
