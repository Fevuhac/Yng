/**
 * 聊天
 * Created by zhenghang on 2017/9/15.
 */
var data_util = require('../../routes/data/data_util');
var buzz_chat = require('../../src/buzz/buzz_chat');
var TAG = "【data/chat】";
var DEBUG = 0;

function getChat(req, res) {
    const FUNC = TAG + "getChat() --- ";
    const HINT = "获取聊天";
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);
    buzz_chat.getChat(dataObj, function (err, result) {
        if (DEBUG)console.log(FUNC + "--END--");
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

function sendChat(req, res) {
    const FUNC = TAG + "sendChat() --- ";
    const HINT = "发送消息";
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    // console.log(FUNC + "dataObj:", dataObj);

    buzz_chat.sendChat(req, dataObj, function (err, result) {
        if (DEBUG)console.log(FUNC + "--END--");
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

function userInfo(req, res) {
    const FUNC = TAG + "userInfo() --- ";
    const HINT = "用户信息";
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);
    buzz_chat.userInfo(req, dataObj, function (err, result) {
        if (DEBUG)console.log(FUNC + "--END--");
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

function forbid_player_world(req, res) {
    const FUNC = TAG + "forbid_player_world() --- ";
    const HINT = "禁言";
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);
    buzz_chat.forbid_player_world(req, dataObj, function (err, result) {
        if (DEBUG)console.log(FUNC + "--END--");
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

function unforbid_player_world(req, res) {
    const FUNC = TAG + "unforbid_player_world() --- ";
    const HINT = "解除禁言";
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);
    buzz_chat.unforbid_player_world(req, dataObj, function (err, result) {
        if (DEBUG)console.log(FUNC + "--END--");
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

exports.getChat = getChat;
exports.sendChat = sendChat;
exports.userInfo = userInfo;
exports.forbid_player_world = forbid_player_world;
exports.unforbid_player_world = unforbid_player_world;