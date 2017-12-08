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
var buzz_weapon = require('../../src/buzz/buzz_weapon');
var data_util = require('./data_util');

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
exports.add_weapon_log = add_weapon_log;
exports.levelup = levelup;
exports.buySkin = buySkin;
exports.equip = equip;

exports.upstar = upstar;
exports.vote = vote;
exports.querySkinVote = querySkinVote;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 添加武器升级记录
 */
function add_weapon_log(req, res) {
    const FUNC = TAG + "add_weapon_log() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");
    if (DEBUG) console.log(FUNC + "req.body: " + JSON.stringify(req.body));
    
    data_util.request_info(req, "add_weapon_log");
    var dataObj = {};
    if (!(dataObj = data_util.get_dao_data(req, res))) {
        return;
    }
    BuzzUtil.cacheLinkDataApi(dataObj, "add_weapon_log");
    
    req.dao.addWeaponLog(dataObj, function (err, rows) {
        if (err) {
            if (ERROR) console.error(FUNC + "msg:", "更新玩家武器升级数据失败");
            if (ERROR) console.error(FUNC + "err:", err);
            res.success({ type: 1, msg: '更新玩家武器升级数据失败', err: err });
        } else {
            res.success({ type: 1, msg: '更新玩家武器升级数据成功', data: 1 });
        }
    });
}

function levelup(req, res) {
    const FUNC = TAG + "levelup() --- ";
    const HINT = "武器升级";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_weapon.levelup(req, dataObj, function(err, result) {
        if (err) console.error(FUNC + "err:", err);
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

// yDONE: 97-皮肤升星
function upstar(req, res) {
    const FUNC = TAG + "upstar() --- ";
    const HINT = "皮肤升星";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_weapon.upstar(req, dataObj, function(err, result) {
        if (err) console.error(FUNC + "err:", err);
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

function buySkin(req, res) {
    const FUNC = TAG + "buySkin() --- ";
    const HINT = "武器皮肤购买";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_weapon.buySkin(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

function equip(req, res) {
    const FUNC = TAG + "equip() --- ";
    const HINT = "武器皮肤装备";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_weapon.equip(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

// yDONE: 125-皮肤投票
function vote(req, res) {
    const FUNC = TAG + "vote() --- ";
    const HINT = "皮肤支持率投票";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_weapon.vote(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}

// yDONE: 125-皮肤投票
function querySkinVote(req, res) {
    const FUNC = TAG + "querySkinVote() --- ";
    const HINT = "查询投票排行榜";
    //----------------------------------
    var aes = req.body.aes;
    var dataObj = data_util.parseDataObj(req, HINT);

    buzz_weapon.querySkinVote(req, dataObj, function(err, result) {
        data_util.handleReturn(res, aes, err, result, HINT);
    });
}


//==============================================================================
// private
//==============================================================================


