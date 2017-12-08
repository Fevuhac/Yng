//==============================================================================
// import
//==============================================================================
//------------------------------------------------------------------------------
// 工具(Tool)
//------------------------------------------------------------------------------
var buzz_cst_game = require('../../src/buzz/cst/buzz_cst_game');
var buzz_cst_error = require('../../src/buzz/cst/buzz_cst_error');
var data_util = require('./data_util');

// 水族馆逻辑
var buzz_aquarium = require('../../src/buzz/buzz_aquarium');

var DEBUG = 0;
var ERROR = 1;

const TAG = "【data.aquarium】";

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------
var CacheLink = require('../../src/buzz/cache/CacheLink');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var api_map = require('../../routes/api_map');

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.upgradePetfish = upgradePetfish;
exports.putPetfish = putPetfish;
exports.rewardPetfish = rewardPetfish;
exports.putGoddess = putGoddess;
exports.getAquarium = getAquarium;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
/**
 * 解锁或升级宠物鱼
 */
function upgradePetfish(req, res) {
    var aes = req.body.aes;
    var dataObj = _getDataObj(req, res);
    buzz_aquarium.upgradePetfish(req, dataObj, function (err, account) {
        _resultHandler(res, err, account, '解锁或升级宠物鱼', aes);
    });
}

/**
 * 放养宠物鱼
 */
function putPetfish(req, res) {
    var aes = req.body.aes;
    var dataObj = _getDataObj(req, res);
    buzz_aquarium.putPetfish(req, dataObj, function (err, account) {
        _resultHandler(res, err, account, '放养宠物鱼', aes);
    });
}

/**
 * 领取宠物鱼奖励
 */
function rewardPetfish(req, res) {
    var aes = req.body.aes;
    var dataObj = _getDataObj(req, res);
    buzz_aquarium.rewardPetfish(req, dataObj, function (err, account) {
        _resultHandler(res, err, account, '领取宠物鱼奖励', aes);
    });
}

/**
 * 放置女神
 */
function putGoddess(req, res) {
    var aes = req.body.aes;
    var dataObj = _getDataObj(req, res);
    buzz_aquarium.putGoddess(req, dataObj, function (err, account) {
        _resultHandler(res, err, account, "放置女神", aes);
    });
}

/**
 * 获取当前鱼缸和女神状态
 */
function getAquarium(req, res) {
    const FUNC = TAG + "getAquarium()---";

    var aes = req.body.aes;
    var dataObj = _getDataObj(req, res);
    buzz_aquarium.getAquarium(req, dataObj, function (err, aquarium) {
        if (err) {
            if (ERROR) console.log(FUNC + "err:", err);
        }
        if (DEBUG) console.log(FUNC + "aquarium:", aquarium);
        _resultHandler(res, err, aquarium, "获取当前鱼缸和女神状态", aes);
    });
}

//==============================================================================
// private
//==============================================================================

function _getDataObj(req, res) {
    const FUNC = TAG + "_getDataObj()---";

    var dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    if (DEBUG) console.log(FUNC + 'dataObj:\n', dataObj);
    return dataObj;
}

function _resultHandler(res, err, account, msg, aes) {
    const FUNC = TAG + "_resultHandler()---";

    if (err) {
        res.success({ type: 1, msg: msg + '失败', err: err });
    } else {
        if (DEBUG) console.log(FUNC + 'account:\n', account);
        var res_data = buzz_cst_game.getResData(account, aes);
        if (DEBUG) console.log(FUNC + 'res_data:\n', res_data);
        res.success({ type: 1, msg: msg + '成功', data: res_data, aes: aes });
    }
}