// server_api
// 服务器调用的API, 包括
// =========================================================
// notify_user_login
// notify_user_logout
// =========================================================

// =============================================================================
// import
// =============================================================================
// -----------------------------------------------------------------------------
// router
// -----------------------------------------------------------------------------
var express = require('express');
var router = express.Router();
var server_cik = require('./server/server_cik');
var server_usersign = require('./server/server_usersign');

// -----------------------------------------------------------------------------
// utils
// -----------------------------------------------------------------------------
var _ = require('underscore');

// -----------------------------------------------------------------------------
// API handler
// -----------------------------------------------------------------------------
// var client_server = require('./client/server');


// =============================================================================
// constant
// =============================================================================
var DEBUG = 0;
var ERROR = 1;

var TAG = "【server_api】";


// =============================================================================
// routes
// =============================================================================

// 增加一个订单
router.post('/sign_user_sid', function (req, res) {
    // console.log("----------------------------------------------");
    // console.log("call sign_user_sid");
    server_usersign.setUserSid(req, res);
});

//------------------------------------------------------------------------------
// 实物兑换接口——API服务器调用
//------------------------------------------------------------------------------

// 玩家进行实物兑换操作
// router.post('/change_in_kind', function (req, res) {
//     server_cik.changeInKind(req, res);
// });

// 增加一个订单
router.post('/add_cik_order', function (req, res) {
    server_cik.addCikOrder(req, res);
});

// 减少库存操作
router.post('/cik_reduce', function (req, res) {
    server_cik.cikReduce(req, res);
});

// 获取对应物品的今日库存和总库存
router.post('/find_values_by_cid', function (req, res) {
    server_cik.findValuesByCid(req, res);
});

// 获取实物兑换记录
router.post('/get_cik_log', function (req, res) {
    server_cik.getCikLog(req, res);
});

// 返回兑换数据中的每日剩余数量
router.post('/get_cik_info', function (req, res) {
    server_cik.getCikInfo(req, res);
});

// 玩家取消实物兑换
router.post('/cacel_cik', function (req, res) {
    server_cik.cancelCik(req, res);
});


// //------------------------------------------------------------------------------
// // 运营管理
// //------------------------------------------------------------------------------
// // 获取配置接口
// router.post('/get_operation_cfgs', function (req, res) {
//     admin_operation.getOperationCfgs(req, res);
// });

// // 改变实物领取相关配置的接口
// router.post('/modify_cfgs', function (req, res) {
//     admin_operation.modifyCfgs(req, res);
// });

// // 修改订单状态和信息
// router.post('/modify_orders', function (req, res) {
//     admin_operation.modifyOrders(req, res);
// });

// // 改变实物领取相关配置的接口
// router.post('/get_change_order', function (req, res) {
//     admin_operation.getChangeOrder(req, res);
// });

// -----------------------------------------------------------------------------
// 用户登录登出通知
// -----------------------------------------------------------------------------

/**
 * 通知负载均衡服务器玩家登录成功.
 */
router.post('/notify_user_login', function (req, res) {
    // client_server.getApiServer(req, res);
});

/**
 * 通知负载均衡服务器玩家退出登录(从缓存中写入数据库并移除).
 */
router.post('/notify_user_logout', function (req, res) {
    // client_server.getApiServer(req, res);
});

module.exports = router;