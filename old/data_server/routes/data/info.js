////////////////////////////////////////////////////////////////////////////////
// 获取服务器中特定账户的信息
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
//------------------------------------------------------------------------------
// 工具(Tool)
//------------------------------------------------------------------------------
var BuzzUtil = require('../../src/utils/BuzzUtil');
var buzz_info = require('../../src/buzz/buzz_info');
var data_util = require('./data_util');

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var api_map = require('../api_map');


//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;

var TAG = "【data/info】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getHuafeiquan = getHuafeiquan;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 获取话费券数量.
 */
function getHuafeiquan(req, res) {
    const FUNC = TAG + "getHuafeiquan() --- ";
    const HINT = "获取话费券数量";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_info.getHuafeiquan(req, dataObj, function(err, result) {
        if (err) {
            if (ERROR) console.error(FUNC + "err:", err);
        }
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}


/**
 * 查询玩家使用的喇叭和收到的鲜花
 * 注意是收到的鲜花，不是当前鲜花总量
 */
exports.getHornFlower = function (req, res) {
    const FUNC = TAG + "getHornFlower() --- ";
    const HINT = "获取喇叭、鲜花数量";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_info.getHornFlower(req, dataObj, function(err, result) {
        if (err) {
            if (ERROR) console.error(FUNC + "err:", err);
        }
        data_util.handleReturn(res, aes, err, result, HINT);
    });
    
};

/**
 * 查询指定某个道具剩余过期时间
 */
exports.getItemLimitTime = function (req, res) {
    const FUNC = TAG + "getItemLimitTime() --- ";
    const HINT = "获取限时道具剩余时间";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_info.getItemLimitTime(req, dataObj, function(err, result) {
        if (err) {
            if (ERROR) console.error(FUNC + "err:", err);
        }
        data_util.handleReturn(res, aes, err, result, HINT);
    });
};

/**
 * 查询玩家限时道具获得时间
 */
exports.getItemLimitGotTime = function (req, res) {
    const FUNC = TAG + "getItemLimitTime() --- ";
    const HINT = "获取玩家限时道具获得时间";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_info.getItemLimitGotTime(req, dataObj, function(err, result) {
        if (err) {
            if (ERROR) console.error(FUNC + "err:", err);
        }
        data_util.handleReturn(res, aes, err, result, HINT);
    });
};

//==============================================================================
// private
//==============================================================================


