////////////////////////////////////////////////////////////////////////////////
// 女神相关接口的实现
// getDefend
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var data_util = require('./data_util');
var buzz_goddess = require('../../src/buzz/buzz_goddess');
var buzz_cst_game = require('../../src/buzz/cst/buzz_cst_game');


//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;

var TAG = "【data.goddess】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getDefend = getDefend;
exports.challengeGoddess = challengeGoddess;
exports.rewardTimes = rewardTimes;
exports.weekTop1 = weekTop1;
exports.unlock = unlock;
exports.levelup = levelup;
exports.weekReward = weekReward;
exports.queryWeekReward = queryWeekReward;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 领取保卫女神周排名奖励
 */
function weekReward(req, res) {
    const FUNC = TAG + "weekReward() --- ";
    const HINT = "领取保卫女神周排名奖励";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_goddess.weekReward(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

/**
 * 查询当前有无保卫女神周奖励，且返回我的当前排名、以及可以领奖的dropkey
 */
function queryWeekReward(req, res) {
    const FUNC = TAG + "queryWeekReward() --- ";
    const HINT = "查询当前有无保卫女神周奖励";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_goddess.queryWeekReward(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

/**
 * 女神解锁
 */
function unlock(req, res) {
    const FUNC = TAG + "unlock() --- ";
    const HINT = "女神解锁身体区域";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_goddess.unlock(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

/**
 * 女神升级
 */
function levelup(req, res) {
    const FUNC = TAG + "levelup() --- ";
    const HINT = "女神升级";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_goddess.levelup(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

/**
 * 获取女神数据.
 */
function getDefend(req, res) {
    const FUNC = TAG + "getDefend()---";

    data_util.request_info(req, "getDefend");
    var aes = req.body.aes;
    var dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    
    buzz_goddess.getDefend(req, dataObj, function (err, results) {
        if (err) {
            res.success({ type: 1, msg: '女神数据获取失败', err: err });
        } else {
            if (DEBUG) console.log(FUNC + "results:\n", results);
            var res_data = buzz_cst_game.getResData(results, aes);
            res.success({ type: 1, msg: '女神数据获取成功', data: res_data, aes: aes });
        }
    });
}

/**
 * 挑战女神.
 */
function challengeGoddess(req, res) {
    const FUNC = TAG + "challengeGoddess()---";

    data_util.request_info(req, "challengeGoddess");
    var aes = req.body.aes;
    var dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    
    buzz_goddess.challengeGoddess(req, dataObj, function (err, results) {
        if (err) {
            res.success({ type: 1, msg: '挑战女神失败', err: err });
        } else {
            if (DEBUG) console.log(FUNC + "results:\n", results);
            var res_data = buzz_cst_game.getResData(results, aes);
            res.success({ type: 1, msg: '挑战女神成功', data: res_data, aes: aes });
        }
    });
}

/**
 * 女神结算时返回奖励倍数.
 */
function rewardTimes(req, res) {
    const FUNC = TAG + "rewardTimes()---";

    data_util.request_info(req, "rewardTimes");
    var aes = req.body.aes;
    var dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    
    buzz_goddess.rewardTimes(req, dataObj, function (err, results) {
        if (err) {
            res.success({ type: 1, msg: '女神结算时返回奖励倍数失败', err: err });
        } else {
            if (DEBUG) console.log(FUNC + "results:\n", results);
            var res_data = buzz_cst_game.getResData(results, aes);
            res.success({ type: 1, msg: '女神结算时返回奖励倍数成功', data: res_data, aes: aes });
        }
    });
}

function weekTop1(req, res) {
    const FUNC = TAG + "/weekTop1 --- ";

    // res.success({ type: 1, msg: '获取保卫女神第一名数据失败', err: {code: 100000, msg: "获取保卫女神第一名数据失败"} });
    // return;

    if (DEBUG) console.log(FUNC + "CALL...");
    if (DEBUG) console.log(FUNC + "req.body: " + JSON.stringify(req.body));
    
    var aes = req.body.aes;
    var dataObj = {};
    try {
        dataObj = buzz_cst_game.getDataObj(req.body.data, req.body.aes);
    }
    catch (json_parse_err) {
        if (ERROR) console.error(FUNC + "msg:", "获取保卫女神第一名数据失败(json解析错误)");
        if (ERROR) console.error(FUNC + "err:", json_parse_err);
        // 此处不中断
    }
    var platform = dataObj.platform || 1;

// 女神数据
// {
//   id: 69914,
//   vip: 8,
// //   channel_account_name: null,
// //   tempname: 'fj_69914',
//   nickname: null,
// //   redress_no: 0,
//   max_wave: 6,
// //   updated_at: 2017-09-14T06:36:53.000Z,
//   figure_url: 'http://p3.wmpic.me/article/2015/05/18/1431913649_GWJqwtVU.jpeg' }

// { uid: '69914',
//  score: '6',
//  timestamp: '1505371013652',
//  name: 'fj_69914',
//  rank: null,
//  vip: '8',
//  weapon: '100',
//  weapon_skin_own: [ 1, 9, 8, 10 ],
//  id: '69914',
//  nickname: 'fj_69914',
//  max_wave: '6' }

    // TODO: 使用buzz_goddess
    var result = buzz_goddess.getGoddessTop1(platform);
    // console.log(FUNC + "result:", result);
    var res_data = buzz_cst_game.getResData(result, aes);
    res.success({ type: 1, msg: '获取保卫女神第一名数据成功', data: res_data, aes: aes });

    // req.dao.getGoddessTop1(platform, function (err, result) {
    //     if (err) {
    //         if (ERROR) console.error(FUNC + "msg:", "获取保卫女神第一名数据失败");
    //         if (ERROR) console.error(FUNC + "err:", err);
    //         res.success({ type: 1, msg: '获取保卫女神第一名数据失败', err: err });
    //     } else {
    //         console.log(FUNC + "result:", result);
    //         var res_data = buzz_cst_game.getResData(result, aes);
    //         res.success({ type: 1, msg: '获取保卫女神第一名数据成功', data: res_data, aes: aes });
    //     }
    // });
}


//==============================================================================
// private
//==============================================================================
