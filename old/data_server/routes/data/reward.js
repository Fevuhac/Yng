////////////////////////////////////////////////////////////////////////////////
// Weapon Data Operation
// 武器数据的操作更新
// add_weapon_log
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
//------------------------------------------------------------------------------
// 工具(Tool)
//------------------------------------------------------------------------------
var BuzzUtil = require('../../src/utils/BuzzUtil');
var buzz_cst_game = require('../../src/buzz/cst/buzz_cst_game');
var data_util = require('./data_util');

//------------------------------------------------------------------------------
// 业务(Buzz)
//------------------------------------------------------------------------------
var buzz_reward = require('../../src/buzz/buzz_reward');
var buzz_charts = require('../../src/buzz/buzz_charts');

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

var TAG = "【data/weapon】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.monthSign = monthSign;
exports.get_day_reward = get_day_reward;
exports.get_bankruptcy_compensation = get_bankruptcy_compensation;
exports.get_online_time = get_online_time;

exports.guideReward = guideReward;
exports.dailyReward = dailyReward;
exports.achieveReward = achieveReward;
exports.missionReward = missionReward;
exports.activeReward = activeReward;
exports.onekeyReward = onekeyReward;
exports.getUserRank = getUserRank;
exports.getChartReward = getChartReward;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 查询本月的可签到状态.
 */
function monthSign(req, res) {
    const FUNC = TAG + "monthSign() --- ";
    const HINT = "查询本月的可签到状态";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_reward.monthSign(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

/**
 * 领取每日奖励
 */
function get_day_reward(req, res) {
    getDayRewardNew(req, res);
}

function getDayRewardNew(req, res) {
    const FUNC = TAG + "getDayRewardNew() --- ";
    const HINT = "领取每日奖励";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_reward.getDayReward(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

function getDayRewardOld(req, res) {
    const FUNC = TAG + "getDayRewardOld() --- ";
    
    if (DEBUG) console.log(FUNC + "CALL...");
    if (DEBUG) console.log(FUNC + "req.body:", req.body);
    
    data_util.request_info(req, "get_day_reward");
    var dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    BuzzUtil.cacheLinkDataApi(dataObj, "get_day_reward");
    
    req.dao.getDayReward(dataObj, function (err, rows) {
        if (err) {
            if (ERROR) console.error(FUNC + "msg:", "领取每日奖励失败");
            if (ERROR) console.error(FUNC + "err:", err);
            res.success({ type: 1, msg: '领取每日奖励失败', err: err });
        } else {
            res.success({ type: 1, msg: '领取每日奖励成功', data: 1 });
        }
    });
}

/**
 * 领取破产救济金.
 */
function get_bankruptcy_compensation(req, res) {
    const FUNC = TAG + "get_bankruptcy_compensation() --- ";
    
    if (DEBUG) console.log(FUNC + "CALL...");
    if (DEBUG) console.log(FUNC + "req.body:", req.body);
    
    var aes = req.body.aes;
    data_util.request_info(req, "get_bankruptcy_compensation");
    var dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    BuzzUtil.cacheLinkDataApi(dataObj, "get_bankruptcy_compensation");
    
    req.dao.getBankruptcyCompensation(dataObj, function (err, rows) {
        if (err) {
            if (ERROR) console.error(FUNC + "msg:", "领取破产补偿失败");
            if (ERROR) console.error(FUNC + "err:", err);
            res.success({ type: 1, msg: '领取破产补偿失败', err: err });
        } else {
            var res_data = buzz_cst_game.getResData(rows[0], aes);
            res.success({ type: 1, msg: '领取破产补偿成功', data: res_data, aes: aes });
        }
    });
}

/**
 * 获取在线时长.
 */
function get_online_time(req, res) {
    const FUNC = TAG + "get_online_time() --- ";
    
    if (DEBUG) console.log(FUNC + "CALL...");
    if (DEBUG) console.log(FUNC + "req.body:", req.body);
    
    var aes = req.body.aes;
    data_util.request_info(req, "get_online_time");
    var dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    BuzzUtil.cacheLinkDataApi(dataObj, "get_online_time");
    
    req.dao.getOnlineTime(dataObj, function (err, rows) {
        if (err) {
            if (ERROR) console.error(FUNC + "msg:", "获取在线时间失败");
            if (ERROR) console.error(FUNC + "err:", err);
            res.success({ type: 1, msg: '获取在线时间失败', err: err });
        } else {
            var res_data = buzz_cst_game.getResData(rows[0], aes);
            res.success({ type: 1, msg: '获取在线时间成功', data: res_data, aes: aes });
        }
    });
}

function guideReward(req, res) {
    const FUNC = TAG + "guideReward() --- ";
    const HINT = "完成强制教学领奖";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_reward.guideReward(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

function dailyReward(req, res) {
    const FUNC = TAG + "dailyReward() --- ";
    const HINT = "日常领奖";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_reward.dailyReward(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

function achieveReward(req, res) {
    const FUNC = TAG + "achieveReward() --- ";
    const HINT = "成就领奖";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_reward.achieveReward(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

function missionReward(req, res) {
    const FUNC = TAG + "missionReward() --- ";
    const HINT = "任务领奖";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_reward.missionReward(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

function activeReward(req, res) {
    const FUNC = TAG + "activeReward() --- ";
    const HINT = "活跃领奖";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_reward.activeReward(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

function onekeyReward(req, res) {
    const FUNC = TAG + "onekeyReward() --- ";
    const HINT = "一键领取";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_reward.onekeyReward(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

function getUserRank(req, res) {
    const FUNC = TAG + "getUserRank() --- ";
    const HINT = "获取玩家历史排行榜信息";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_charts.getUserRank(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

function getChartReward(req, res) {
    const FUNC = TAG + "getChartReward() --- ";
    const HINT = "获取玩家排行榜奖励";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_charts.getChartReward(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}



//==============================================================================
// private
//==============================================================================

