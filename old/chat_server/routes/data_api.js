// data_api
// =========================================================
var express = require('express');
var router = express.Router();

var sys = require('sys');
var fs = require('fs');
var _ = require('underscore');

var chat = require('./data/chat');
var data_feedback = require('./data/feedback');

//----------------------------------------------------------
// 业务逻辑
//----------------------------------------------------------
// =========================================================
// constant
// =========================================================
var DEBUG = 0;
var ERROR = 1;

var TAG = "【data_api】";

// =========================================================
// routes
// =========================================================

/**
 * 聊天信息获取
 */
router.post('/get_chat_info',function(req,res) {
    if(DEBUG)console.log(TAG + "/get_chat_info");
    chat.getChat(req, res);
});

/**
 * 返回聊天个人信息
 */
router.post('/get_user_info',function(req,res) {
    chat.userInfo(req, res);
});

//----------------------------------------------------------
// 玩家反馈接口
//----------------------------------------------------------
/**
 * 接收玩家发来的一条留言
 * token, text
 */
router.post('/player_propose', function (req, res) {
    data_feedback.playerPropose(req, res);
});

/**
 * 客户端拉取留言板内容.
 * token, timestamp, count, hot4
 */
router.post('/query_msgboard', function (req, res) {
    data_feedback.queryMsgboard(req, res);
});

/**
 * 玩家点赞.
 * token, mid
 */
router.post('/like_msgboard', function (req, res) {
    data_feedback.likeMsgboard(req, res);
});

/**
 * 刪除留言.
 * token, mid
 */
router.post('/del_msgboard', function (req, res) {
    data_feedback.delMsgboard(req, res);
});

module.exports = router;