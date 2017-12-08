////////////////////////////////////////////////////////////////////////////////
// 支付的操作相关
// pay
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
//------------------------------------------------------------------------------
// 工具(Tool)
//------------------------------------------------------------------------------
var BuzzUtil = require('../../src/utils/BuzzUtil');
var buzz_cst_game = require('../../src/buzz/cst/buzz_cst_game');
var buzz_pay = require('../../src/buzz/buzz_pay');
var data_util = require('./data_util');

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------
var CacheLink = require('../../src/buzz/cache/CacheLink');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var api_map = require('../api_map');


//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;

var TAG = "【data/pay】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.buy = buy;
exports.get_game_order = get_game_order;
exports.check_order_status = check_order_status;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 添加商城记录
 */
function buy(req, res) {
    const FUNC = TAG + "buy() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");
    if (DEBUG) console.log(FUNC + "req.body: " + JSON.stringify(req.body));

    // 用户数据解析(解码为请求数据结构)
    data_util.request_info(req, "buy");
    var aes = req.body.aes;
    var dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    BuzzUtil.cacheLinkDataApi(dataObj, "buy");
    
    // NOTICE: 测试数据
    //_runFakeData(res, aes);

    switch(dataObj.payChannel){
        case 1003:{
            buzz_pay.VietnamPay(req, dataObj, function(err, results){
                if (err) {
                    res.success({ type: 1, msg: '玩家购买失败', err: err });
                } else {
                    console.log("越南卡购买商品返回结果----aes:", aes);
                    console.log("越南卡购买商品返回结果----results:", results);
                    var res_data = buzz_cst_game.getResData(results, aes);
                    console.log("越南卡购买商品返回结果----res_data:", res_data);
                    res.success({ type: 1, msg: '玩家购买成功', data: res_data, aes:aes });
                }
            });
        }
        break;
        default:{
            buzz_pay.buy(req, dataObj, function (err, results) {
                if (err) {
                    res.success({ type: 1, msg: '玩家购买失败', err: err });
                } else {
                    console.log("玩吧玩家积分购买商品返回结果----aes:", aes);
                    console.log("玩吧玩家积分购买商品返回结果----results:", results);
                    var res_data = buzz_cst_game.getResData(results, aes);
                    console.log("玩吧玩家积分购买商品返回结果----res_data:", res_data);
        
                    res.success({ type: 1, msg: '玩家购买成功', data: res_data, aes:aes });
                }
            });
        }
        break;
    }



}


/**
 * 获取游戏订单.
 */
function get_game_order(req, res) {
    const FUNC = TAG + "get_game_order() --- ";

    // getGameOrderOld(req, res);
    getGameOrderNew(req, res);
}

function getGameOrderOld(req, res) {
    const FUNC = TAG + "getGameOrderOld() --- ";
    // 用户数据解析(解码为请求数据结构)
    data_util.request_info(req, "get_game_order");
    var aes = req.body.aes;
    var dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    BuzzUtil.cacheLinkDataApi(dataObj, "get_game_order");
  
    // 生成订单号记录在数据库中，然后返回给客户端
    // 查询当前最大订单号
    req.dao.getGameOrder(dataObj, function (err, game_order_id) {
        if (err) {
            if (ERROR) console.error(FUNC + "msg:", "获取订单失败");
            if (ERROR) console.error(FUNC + "err:", err);
            res.success({ type: 1, msg: '获取订单失败', err: err });
        } else {
            console.log(FUNC + "game_order_id:", game_order_id);
            res.success({ type: 1, msg: '获取订单成功', data: { "game_order_id": game_order_id } });
        }
    });
}

function getGameOrderNew(req, res) {
    const FUNC = TAG + "getGameOrderNew() --- ";
    const HINT = "获取订单号";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    if (undefined == dataObj.test) {
        dataObj.test = true;
    }

    buzz_pay.getGameOrder(req, dataObj, function(err, result) {
        if (err) {
            if (ERROR) console.error(FUNC + "err:", err);
        }
        console.log(FUNC + "result:", result);
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

/**
 * 检查游戏订单.
 */
function check_order_status(req, res) {
    const FUNC = TAG + "check_order_status() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");
    if (DEBUG) console.log(FUNC + "req.body: " + JSON.stringify(req.body));

    // 用户数据解析(解码为请求数据结构)
    data_util.request_info(req, "check_order_status");
    var aes = req.body.aes;
    var dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    BuzzUtil.cacheLinkDataApi(dataObj, "check_order_status");

    req.dao.checkOrderStatus(dataObj, function (err, result) {
        if (err) {
            if (ERROR) console.error(FUNC + "msg:", "检查订单状态失败");
            if (ERROR) console.error(FUNC + "err:", err);
            res.success({ type: 1, msg: '检查订单状态失败', err: err });
        } else {
            if (DEBUG) console.log("check_order_status result:", result);
            res.success({ type: 1, msg: '检查订单状态成功', data: result });
        }
    });
}


//==============================================================================
// private
//==============================================================================

function _runFakeData(res, aes) {
    // NOTICE: 测试数据
    // 余额不足
    //var results = {
    //    code: 1004,
    //    subcode: -7499,
    //    message: '金额不足',
    //    notice: 0,
    //    time: 1490334317,
    //    tips: 'B505-258'
    //};
    // 支付成功
    var results = {
        code: 0,
        subcode: 0,
        message: '',
        default: 0,
        data: [{ billno: '-8957_A500009_1_1490345431_45919313', cost: 2 }],
        game_order_id: '201703240000000027'
    };
    
    console.log("玩吧玩家积分购买商品返回结果----aes:", aes);
    console.log("玩吧玩家积分购买商品返回结果----results:", results);
    var res_data = buzz_cst_game.getResData(results, aes);
    console.log("玩吧玩家积分购买商品返回结果----res_data:", res_data);
    
    res.success({ type: 1, msg: '玩家购买成功', data: res_data, aes: aes });
}