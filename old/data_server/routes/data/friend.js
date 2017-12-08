/**
 * 好友系统
 * Created by zhenghang on 2017/9/9.
 */
var data_util = require('../../routes/data/data_util');
var buzz_friends = require('../../src/buzz/buzz_friends');

var TAG = "【data/friend】";
var DEBUG = 0;

function addFriend(req, res) {
    const FUNC = TAG + "addFriend() --- ";
    const HINT = "添加好友";
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);
    buzz_friends.addFriend(req, dataObj, function (err,result) {
        if(DEBUG)console.log(FUNC+"--END--");
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

function delFriend(req, res) {
    const FUNC = TAG + "delFriend() --- ";
    const HINT = "删除好友";
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);
    if(DEBUG)console.log(FUNC+"--start--",dataObj);
    buzz_friends.delFriend(req, dataObj, function (err,result) {
        if(DEBUG)console.log(FUNC+"--END--");
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

exports.addFriend = addFriend;
exports.delFriend = delFriend;