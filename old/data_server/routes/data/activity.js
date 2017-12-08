////////////////////////////////////////////////////////////////////////////////
// Activity Operation
// 生成CD-KEY, 玩家使用CD-KEY兑换礼品
// showMeActivity
// getReward
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var buzz_cst_game = require('../../src/buzz/cst/buzz_cst_game');
var buzz_cst_error = require('../../src/buzz/cst/buzz_cst_error');
var data_util = require('./data_util');


//==============================================================================
// const
//==============================================================================
var ERROR_OBJ = buzz_cst_error.ERROR_OBJ;

var DEBUG = 0;
var ERROR = 1;

var TAG = "【data.activity】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.showMeActivity = showMeActivity;
exports.getReward = getReward;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
/**
 * 创建CD-KEY
 */
function showMeActivity(req, res) {
    const FUNC = TAG + "showMeActivity()---";

    var aes = req.body.aes;
    var dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    if (DEBUG) console.log(FUNC + 'dataObj:\n', dataObj);
    
    req.dao.showMeActivity(dataObj, function (err, results) {
        if (err) {
            res.success({ type: 1, msg: '获取当前开启的活动失败', err: err });
        } else {
            var res_data = buzz_cst_game.getResData( results, aes);
            res.success({ type: 1, msg: '获取当前开启的活动成功', data: res_data, aes: aes });
        }
    });
}

/**
 * 根据传入的action_id获取此活动下所有CD-KEY极其状态
 */
function getReward(req, res) {
    const FUNC = TAG + "getReward()---";

    var aes = req.body.aes;
    var dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    if (DEBUG) console.log(FUNC + 'dataObj:\n', dataObj);
    
    req.dao.getReward(dataObj, function (err, account) {
        if (err) {
            if (ERROR) console.error(FUNC + "err:\n", err);
            res.success({ type: 1, msg: '获取活动奖励失败', err: err });
        } else {
            var res_data = buzz_cst_game.getResData(account, aes);
            res.success({ type: 1, msg: '获取活动奖励成功', data: res_data, aes: aes });
        }
    });
}


//==============================================================================
// private
//==============================================================================

