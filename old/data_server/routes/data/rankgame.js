////////////////////////////////////////////////////////////////////////////////
// 排位赛相关接口的实现
// result
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
//------------------------------------------------------------------------------
// 工具(Tool)
//------------------------------------------------------------------------------
var BuzzUtil = require('../../src/utils/BuzzUtil');
var data_util = require('./data_util');
var buzz_rankgame = require('../../src/buzz/buzz_rankgame');
var buzz_cst_game = require('../../src/buzz/cst/buzz_cst_game');
var buzz_charts = require('../../src/buzz/buzz_charts');

var CstError = require('../../src/buzz/cst/buzz_cst_error');
const ERROR_OBJ = CstError.ERROR_OBJ;

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

var TAG = "【data.rankgame】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.result = result;
exports.info = info;
exports.box = box;
exports.get_ranking = get_ranking;
exports.ongoing = ongoing;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 获取排位赛结算数据.
 */
function result(req, res) {
    const FUNC = TAG + "result()---";

    data_util.request_info(req, "result");
    var aes = req.body.aes;
    var dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    
    buzz_rankgame.result(req, dataObj, function (err, results) {
        if (err) {
            res.success({ type: 1, msg: '排位赛数据获取失败', err: err });
        } else {
            if (DEBUG) console.log(FUNC + "results:\n", results);
            var res_data = buzz_cst_game.getResData(results, aes);
            res.success({ type: 1, msg: '排位赛数据获取成功', data: res_data, aes: aes });
        }
    });
}

/**
 * 获取排位赛结算数据.
 */
function info(req, res) {
    const FUNC = TAG + "info()---";
    const HINT = "获取排位赛结算数据";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);
    
    buzz_rankgame.info(req, dataObj, function (err, results) {
        if (err) {
            res.success({ type: 1, msg: '排位赛信息获取失败', err: err });
        } else {
            if (DEBUG) console.log(FUNC + "results:\n", results);
            var res_data = buzz_cst_game.getResData(results, aes);
            res.success({ type: 1, msg: '排位赛信息获取成功', data: res_data, aes: aes });
        }
    });
}

/**
 * 排位赛宝箱操作相关.
 */
function box(req, res) {
    const FUNC = TAG + "box()---";

    data_util.request_info(req, "box");
    var aes = req.body.aes;
    var dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    
    buzz_rankgame.box(req, dataObj, function (err, results) {
        if (err) {
            console.error(FUNC + "err", err);
            res.success({ type: 1, msg: '排位赛宝箱操作失败', err: err });
        } else {
            if (DEBUG) console.log(FUNC + "results:\n", results);
            var res_data = buzz_cst_game.getResData(results, aes);
            res.success({ type: 1, msg: '排位赛宝箱操作成功', data: res_data, aes: aes });
        }
    });
}

/**
 * 获取排行榜结算数据.
 */
function get_ranking(req, res) {
    const FUNC = TAG + "get_ranking()---";

    if (DEBUG) console.log(FUNC + "CALL...");
    
    console.log(FUNC + "CALL.....");// get_ranking() --- CALL.....

    data_util.request_info(req, "get_ranking");
    var aes = req.body.aes;
    var dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        console.log(FUNC + "获取排行榜失败, data_util.get_dao_data(req, res) == null");
        let err = ERROR_OBJ.RANK_COUNT_TOO_LARGE;
        res.success({ type: 1, msg: '获取排行榜失败', err: err });
        return;
    }
    
    // res.success({ type: 1, msg: '获取排行榜失败', err: {code:88888888, msg:"排行榜维护中"}});
    // return;

    // 从缓存中读取排行榜
    buzz_charts.getCharts(req, dataObj, function (err, results) {
        if (err) {
            if (ERROR) console.error(FUNC + "msg:", "获取排行榜失败");
            if (ERROR) console.error(FUNC + "err:", err);
            res.success({ type: 1, msg: '获取排行榜失败', err: err });
        } else {
            // if (DEBUG) console.log("update_account results:", results);
            res.success({ type: 1, msg: '获取排行榜成功', data: results });
        }
    });
}

/**
 * 获取是否有正在进行中的比赛.
 */
function ongoing(req, res) {
    const FUNC = TAG + "ongoing()---";

    data_util.request_info(req, "ongoing");
    var aes = req.body.aes;
    var dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }

    if(DEBUG)console.log(FUNC + "dataObj:", dataObj);

    buzz_rankgame.ongoing(req, dataObj, function (err, results) {
        if (err) {
            res.success({ type: 1, msg: '获取是否有正在进行中的比赛失败', err: err });
        } else {
            if (DEBUG) console.log(FUNC + "results:\n", results);
            var res_data = buzz_cst_game.getResData(results, aes);
            res.success({ type: 1, msg: '获取是否有正在进行中的比赛成功', data: res_data, aes: aes });
        }
    });
}


//==============================================================================
// private
//==============================================================================
