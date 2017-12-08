

var buzz_mail = require('../../src/buzz/buzz_mail');
var buzz_cst_game = require('../../src/buzz/cst/buzz_cst_game');
var buzz_cst_error = require('../../src/buzz/cst/buzz_cst_error');
var data_util = require('./data_util');

var DEBUG = 0;
var ERROR = 1;
var TAG = "【routes/data/mail】";

exports.sendMail = sendMail;
exports.mailList = mailList;
exports.readMail = readMail;
exports.clearMail = clearMail;

function sendMail(req, res) {
    const FUNC = TAG + "sendMail() --- ";
    const HINT = "发邮件(系统邮件)";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);


    buzz_mail.sendMail(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

function mailList(req, res) {
    var aes = req.body.aes;
    var dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    if (DEBUG) console.log('dataObj: ', dataObj);
    
    req.dao.mailList(dataObj, function (err, mail_box) {
        if (err) {
            res.success({ type: 1, msg: '获取邮件列表失败', err: err });
            return;
        }
        var res_data = buzz_cst_game.getResData(mail_box, aes);
        res.success({ type: 1, msg: '获取邮件列表成功', data: res_data, aes: aes });
    });
}

function readMail(req, res) {
    var aes = req.body.aes;
    var dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    if (DEBUG) console.log('dataObj: ', dataObj);
    
    req.dao.readMail(dataObj, function (err, results) {
        if (err) {
            res.success({ type: 1, msg: '领取邮件奖励失败', err: err });
            return;
        }
        var res_data = buzz_cst_game.getResData(results[0], aes);
        res.success({ type: 1, msg: '领取邮件奖励成功', data: res_data, aes: aes });
    });
}

function clearMail(req, res) {
    var aes = req.body.aes;
    var dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    if (DEBUG) console.log('dataObj: ', dataObj);
    
    req.dao.clearMail(function (err, results) {
        if (err) {
            console.error("err:", err);
            res.success({ type: 1, msg: '清理邮件奖励失败', err: err });
            return;
        }
        var res_data = buzz_cst_game.getResData(results[0], aes);
        res.success({ type: 1, msg: '清理邮件奖励成功', data: res_data, aes: aes });
    });
}

