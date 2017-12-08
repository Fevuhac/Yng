////////////////////////////////////////////////////////////////////////////////
// Gold Data Operation
// 金币数据的操作更新
// add_gold_log
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
//------------------------------------------------------------------------------
// 工具(Tool)
//------------------------------------------------------------------------------
var buzz_cst_game = require('../../src/buzz/cst/buzz_cst_game');
var buzz_cst_error = require('../../src/buzz/cst/buzz_cst_error');
var data_util = require('./data_util');
var BuzzUtil = require('../../src/utils/BuzzUtil');

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------
var CacheLink = require('../../src/buzz/cache/CacheLink');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var api_map = require('../../routes/api_map');


//==============================================================================
// const
//==============================================================================
var ERROR_OBJ = buzz_cst_error.ERROR_OBJ;

var DEBUG = 0;
var ERROR = 1;

var TAG = "【data.broadcast】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.get_broadcast = get_broadcast;
exports.set_broadcast = set_broadcast;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 设置公告
 */
function set_broadcast(req, res) {
    const FUNC = TAG + "set_broadcast()---";

    var aes = req.body.aes;
    var dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    if (DEBUG) console.log(FUNC + 'dataObj:\n', dataObj);

    BuzzUtil.cacheLinkDataApi(dataObj, "set_broadcast");

    buzz_cst_game.setBroadcast(dataObj, req);
    res.success({ type: 1, msg: '设置公告信息成功', aes: aes });
}

/**
 * 获取公告
 */
function get_broadcast(req, res) {
    const FUNC = TAG + "get_broadcast() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");

    var aes = req.body.aes;
    var dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    if (DEBUG) console.log(FUNC + 'dataObj:\n', dataObj);

    BuzzUtil.cacheLinkDataApi(dataObj, "get_broadcast");

    buzz_cst_game.getBroadcast(dataObj, function (err, gameBroadcast) {
        if (DEBUG) console.log(FUNC + "gameBroadcast:", gameBroadcast);
        if (gameBroadcast) {
            var gameBroadcast = buzz_cst_game.getResData(gameBroadcast, aes);
            if (DEBUG) console.log(FUNC + "成功返回公告数据");
            res.success({ type: 1, msg: '获取公告信息成功', data: gameBroadcast, aes: aes });
        }
        else {
            if (DEBUG) console.log(FUNC + "返回公告数据失败");
            res.success({ type: 1, msg: '当前没有公告', data: null, aes: aes });
        }
    });

}


//==============================================================================
// private
//==============================================================================