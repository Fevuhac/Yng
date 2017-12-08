////////////////////////////////////////////////////////////////////////////////
// 玩家反馈的接口实现.
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var data_util = require('./data_util');
var buzz_recieve = require('../../src/buzz/buzz_recieve');

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------

//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
var TAG = "【data/recieve】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.openBox = openBox;
exports.openBoxAsDrop = openBoxAsDrop;
exports.turntableDraw = turntableDraw;
exports.packMix = packMix;
exports.changeInKind = changeInKind;
exports.getCikLog = getCikLog;
exports.getCikInfo = getCikInfo;
exports.cancelCik = cancelCik;

exports.weaponUp = weaponUp;
exports.buyVipGift = buyVipGift;
exports.vipDailyReward = vipDailyReward;

exports.minigameReward = minigameReward;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

function openBox(req, res) {
    const FUNC = TAG + "openBox() --- ";
    const HINT = "开宝箱";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_recieve.openBox(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

function openBoxAsDrop(req, res) {
    const FUNC = TAG + "openBoxAsDrop() --- ";
    const HINT = "开宝箱(掉落处理)";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_recieve.openBoxAsDrop(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

function turntableDraw(req, res) {
    const FUNC = TAG + "turntableDraw() --- ";
    const HINT = "转盘抽奖";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_recieve.turntableDraw(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

function packMix(req, res) {
    const FUNC = TAG + "packMix() --- ";
    const HINT = "背包合成";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_recieve.packMix(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

function changeInKind(req, res) {
    const FUNC = TAG + "changeInKind() --- ";
    const HINT = "实物兑换";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_recieve.changeInKind(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

function getCikLog(req, res) {
    const FUNC = TAG + "getCikLog() --- ";
    const HINT = "实物兑换记录查询";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_recieve.getCikLog(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

function getCikInfo(req, res) {
    const FUNC = TAG + "getCikInfo() --- ";
    const HINT = "实物兑换获取剩余兑换数";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_recieve.getCikInfo(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

function cancelCik(req, res) {
    const FUNC = TAG + "cancelCik() --- ";
    const HINT = "玩家取消实物兑换";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_recieve.cancelCik(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

function weaponUp(req, res) {
    const FUNC = TAG + "weaponUp() --- ";
    const HINT = "武器升级";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_recieve.weaponUp(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

function buyVipGift(req, res) {
    const FUNC = TAG + "buyVipGift() --- ";
    const HINT = "购买VIP礼包";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_recieve.buyVipGift(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

function vipDailyReward(req, res) {
    const FUNC = TAG + "vipDailyReward() --- ";
    const HINT = "领取VIP每日奖励";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_recieve.vipDailyReward(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

//----------------------------------------------------------

function minigameReward(req, res) {
    const FUNC = TAG + "minigameReward() --- ";
    const HINT = "小游戏结算";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_recieve.minigameReward(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}