////////////////////////////////////////////////////////////////////////////////
// 社交相关的接口实现.
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
//------------------------------------------------------------------------------
// 工具(Tool)
//------------------------------------------------------------------------------
var data_util = require('./data_util');
var buzz_social = require('../../src/buzz/buzz_social');
var buzz_cst_game = require('../../src/buzz/cst/buzz_cst_game');

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
var TAG = "【data/social】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getInviteProgress = getInviteProgress;
exports.getShareStatus = getShareStatus;
exports.getEnshrineStatus = getEnshrineStatus;
exports.inviteSuccess = inviteSuccess;
exports.shareSuccess = shareSuccess;
exports.enshrineSuccess = enshrineSuccess;
exports.getSocialReward = getSocialReward;
exports.getFriendsCharts = getFriendsCharts;
exports.inviteDaily = inviteDaily;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 获取好友排行榜.
 */
function getFriendsCharts(req, res) {
    const FUNC = TAG + "getFriendsCharts() --- ";
    const HINT = "获取好友排行榜";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_social.getFriendsCharts(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

/**
 * 获取好友邀请进度.
 */
function getInviteProgress(req, res) {
    const FUNC = TAG + "getInviteProgress() --- ";
    const HINT = "获取好友邀请进度";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_social.getInviteProgress(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

/**
 * 获取好友分享状态.
 */
function getShareStatus(req, res) {
    const FUNC = TAG + "getShareStatus() --- ";
    const HINT = "获取好友分享状态";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);
    
    buzz_social.getShareStatus(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

/**
 * 获取收藏状态.
 */
function getEnshrineStatus(req, res) {
    const FUNC = TAG + "getEnshrineStatus() --- ";
    const HINT = "获取收藏状态";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);
    
    buzz_social.getEnshrineStatus(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

/**
 * 邀请好友.
 */
function inviteSuccess(req, res, cb) {
    const FUNC = TAG + "inviteSuccess() --- ";
    const HINT = "邀请好友";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);
    
    buzz_social.inviteSuccess(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

/**
 * 每日首次邀请好友记录.
 */
function inviteDaily(req, res, cb) {
    const FUNC = TAG + "inviteSuccess() --- ";
    const HINT = "首次邀请好友记录";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_social.inviteDaily(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

/**
 * 分享记录.
 */
function shareSuccess(req, res, cb) {
    const FUNC = TAG + "shareSuccess() --- ";
    const HINT = "分享记录";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);
    
    buzz_social.shareSuccess(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

/**
 * 社交奖励领取.
 */
function getSocialReward(req, res, cb) {
    const FUNC = TAG + "getSocialReward() --- ";
    const HINT = "社交奖励领取";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);
    
    buzz_social.getSocialReward(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

/**
 * 快捷方式相关(创建, 领取奖励).
 */
function enshrineSuccess(req, res, cb) {
    const FUNC = TAG + "enshrineSuccess() --- ";
    const HINT = "快捷方式相关";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);
    
    buzz_social.enshrineSuccess(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}


//==============================================================================
// private
//==============================================================================
