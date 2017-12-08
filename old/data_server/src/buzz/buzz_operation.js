////////////////////////////////////////////////////////////
// 运营管理接口的业务逻辑
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------
var _ = require('underscore');
var CstError = require('./cst/buzz_cst_error');
var ERROR_OBJ = CstError.ERROR_OBJ;
var CommonUtil = require('./CommonUtil');
var ObjUtil = require('./ObjUtil');
var BuzzUtil = require('../utils/BuzzUtil');
var DaoUtil = require('../utils/DaoUtil');
var RedisUtil = require('../utils/RedisUtil');
// var RandomUtil = require('../utils/RandomUtil');


var redisSync = require('./redisSync');

//------------------------------------------------------------------------------
// POJO
//------------------------------------------------------------------------------
// var Reward = require('./pojo/Reward');

//------------------------------------------------------------------------------
// 业务
//------------------------------------------------------------------------------
// var buzz_reward = require('./buzz_reward');

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------
var CacheOperation = require('./cache/CacheOperation');
var CacheChange = require('./cache/CacheChange');
var CacheAccount = require('./cache/CacheAccount');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
// var api_map = require('../../routes/api_map');
// var treasure_treasure_cfg = require('../../cfgs/treasure_treasure_cfg');
// var drop_droplist_cfg = require('../../cfgs/drop_droplist_cfg');
// var goldfish_goldlevel_cfg = require('../../cfgs/goldfish_goldlevel_cfg');
// var goldfish_goldfish_cfg = require('../../cfgs/goldfish_goldfish_cfg');
// var item_item_cfg = require('../../cfgs/item_item_cfg');
// var item_itemtype_cfg = require('../../cfgs/item_itemtype_cfg');
// var item_mix_cfg = require('../../cfgs/item_mix_cfg');

//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
var TAG = "【buzz_operation】";

/** 运营操作类型 */
var OP_TYPE = {
    /** 实物兑换 */
    CHANGE_IN_KIND: 1,
    /** 总开关 */
    SWITCH: 2,
};


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getOperationCfgs = getOperationCfgs;
exports.modifyCfgs = modifyCfgs;
exports.getChangeOrder = getChangeOrder;
exports.addHuafeiquan = addHuafeiquan;

exports.queryJackpot = queryJackpot;
exports.queryPlayer = queryPlayer;
exports.changeRate = changeRate;
exports.queryProfit = queryProfit;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 运营管理——查询盈亏排行榜.
 */
function queryProfit(req, dataObj, cb) {
    const FUNC = TAG + "queryProfit() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;

    _queryProfit(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ["type"], "buzz_operation.queryProfit", cb);
    }
}

/**
 * 运营管理——查询奖池总览数据.
 */
function queryJackpot(req, dataObj, cb) {
    const FUNC = TAG + "queryJackpot() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;

    _queryJackpot(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, [], "buzz_operation.queryJackpot", cb);
    }
}

/**
 * 运营管理——查询玩家数据.
 */
function queryPlayer(req, dataObj, cb) {
    const FUNC = TAG + "queryPlayer() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;

    _queryPlayer(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['uid'], "buzz_operation.queryPlayer", cb);
    }
}

/**
 * 运营管理——修改捕获率.
 */
function changeRate(req, dataObj, cb) {
    const FUNC = TAG + "changeRate() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;

    _changeRate(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['type'], "buzz_operation.changeRate", cb);
    }
}

/**
 * 运营管理——获取运营配置.
 */
function getOperationCfgs(req, dataObj, cb) {
    const FUNC = TAG + "getOperationCfgs() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    // BuzzUtil.cacheLinkDataApi(dataObj, "open_box");

    _getOperationCfgs(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['type'], "buzz_operation", cb);
    }
}

/**
 * 运营管理——修改配置.
 */
function modifyCfgs(req, dataObj, cb) {
    const FUNC = TAG + "modifyCfgs() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    // BuzzUtil.cacheLinkDataApi(dataObj, "open_box");

    _modifyCfgs(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['oid'], "buzz_operation", cb);
    }
}

function getChangeOrder(req, dataObj, cb) {
    const FUNC = TAG + "getChangeOrder() --- ";
    //----------------------------------
    // if (!lPrepare(dataObj)) return;
    // BuzzUtil.cacheLinkDataApi(dataObj, "open_box");

    _getChangeOrder(req, dataObj, cb);

    // function lPrepare(input) {
    //     return BuzzUtil.checkParams(input, ['oid'], "buzz_operation", cb);
    // }
}

function addHuafeiquan(req, dataObj, cb) {
    const FUNC = TAG + "addHuafeiquan() --- ";
    //----------------------------------
    _addHuafeiquan(req, dataObj, cb);
}

//==============================================================================
// private
//==============================================================================

function _queryJackpot(req, dataObj, cb) {
    const FUNC = TAG + "_queryJackpot() --- ";
    //----------------------------------

    DaoUtil.query('tbl_platform', null, null, function(err, res) {
        if (err) return cb(err);
        cb(null, res[0]);
    });
}

function _queryPlayer(req, dataObj, cb) {
    const FUNC = TAG + "_queryPlayer() --- ";
    //----------------------------------

    let uid = dataObj.uid;
    var fields = [
        'id',
        'nickname',
        'recharge',
        'cash',
        'gold',
        'playerCatchRate'
    ];
    redisSync.getAccountById(uid, fields, function (err, account) {
        account = account.toJSON();
        console.log(account);
        if (!account.playerCatchRate) {
            account.playerCatchRate = 1;
        }
        if (!account.cash) {
            account.cash = 0;
        }
        if (!account.recharge) {
            account.recharge = 0;
        }
        cb(null, account);
    });

}

function _queryProfit(req, dataObj, cb) {
    const FUNC = TAG + "_queryPlayer() --- ";
    //----------------------------------

    let type = dataObj.type;
    // cb("接口有待实现");

    let fakeData = [
        {uid:1, nickname:"fj_1", recharge:1000, cash:400, gold: 500, profit: -100, playerCatchRate: 1},
        {uid:2, nickname:"fj_2", recharge:1000, cash:500, gold: 500, profit: 0, playerCatchRate: 1},
        {uid:3, nickname:"fj_3", recharge:1000, cash:600, gold: 500, profit: 100, playerCatchRate: 1},
    ];

    cb(null, fakeData);

}

const CHANGE_RATE_TYPE = {
    JACKPOT:1,
    PLAYER:2,
};
function _changeRate(req, dataObj, cb) {
    const FUNC = TAG + "_changeRate() --- ";
    //----------------------------------

    let type = dataObj.type;
    let rate = dataObj.rate / 100;
    if (CHANGE_RATE_TYPE.JACKPOT == type) {
        RedisUtil.set('fishjoy:platformCatchRate', rate, function(err, res) {
            if (err) return cb(err);
            cb(null, "全服命中修正成功");
        });
        // 主动更新MySQL中的值
        DaoUtil.update('tbl_platform', ["platformCatchRate=" + rate], null);
    }
    else if (CHANGE_RATE_TYPE.PLAYER == type) {
        let uid = dataObj.uid;
        RedisUtil.hset('pair:uid:playerCatchRate', uid, rate, function(err, res) {
            if (err) return cb(err);
            cb(null, "玩家捕获率修正成功");
        });
    }
}

////////////////////////////////////////////////////////////
// 获取运营配置数据

/**
 * 运营管理——获取运营配置.
 */
function _getOperationCfgs(req, dataObj, cb) {
    const FUNC = TAG + "_getOperationCfgs() --- ";
    //----------------------------------

    var type = dataObj.type;

    console.log(FUNC + "type:", type);

    // TODO: 改变内存中数据, 需要时才写入数据库
    switch (type) {
        case OP_TYPE.CHANGE_IN_KIND:
            _getChangeCfgs(req, cb);
        break;
        case OP_TYPE.SWITCH:
            _getSwitch(req, cb);
        break;
    }
}

/**
 * 获取实物兑换相关配置数据.
 */
function _getChangeCfgs(req, cb) {
    const FUNC = TAG + "_getChangeCfgs() --- ";
    //----------------------------------

    var ret = CacheOperation.findCfgsByType(OP_TYPE.CHANGE_IN_KIND);

    cb(null, ret);
}

/**
 * 获取实物兑换相关配置数据.
 */
function _getSwitch(req, cb) {
    const FUNC = TAG + "_getSwitch() --- ";
    //----------------------------------

    var ret = CacheOperation.findCfgsByType(OP_TYPE.SWITCH);

    cb(null, ret);
}


////////////////////////////////////////////////////////////
// 配置实物兑换数据

/**
 * 运营管理——实物兑换配置
 */
function _modifyCfgs(req, dataObj, cb) {
    const FUNC = TAG + "_modifyCfgs() --- ";
    //----------------------------------

    var oid = dataObj.oid;
    var value = dataObj.value;
    var desc = dataObj.desc;
    var change = dataObj.change;
    var cfg_id = dataObj.cfg_id;

    console.log(FUNC + "oid:", oid);
    console.log(FUNC + "value:", value);
    console.log(FUNC + "desc:", desc);
    console.log(FUNC + "change:", change);
    console.log(FUNC + "cfg_id:", cfg_id);

    if (!_.isUndefined(desc)) {
        CacheOperation.updateDesc(oid, desc);
        cb(null, CacheOperation.findCfgsById(oid).desc);
    }
    if (!_.isUndefined(value)) {
        CacheOperation.updateValue(oid, value);
        cb(null, CacheOperation.findCfgsById(oid).value);
    }
    if (!_.isUndefined(change)) {
        CacheOperation.change(oid, change);
        cb(null, CacheOperation.findCfgsById(oid).value);
    }
    if (!_.isUndefined(cfg_id)) {
        CacheOperation.updateCid(oid, cfg_id);
        cb(null, CacheOperation.findCfgsById(oid).cfg_id);
    }
}

function _getChangeOrder(req, dataObj, cb) {
    const FUNC = TAG + "_getChangeOrder() --- ";
    //----------------------------------
    var start_date = dataObj.start_date;
    var end_date = dataObj.end_date;
    var filter = dataObj.filter;
    
    console.log(FUNC + "start_date:", start_date);
    console.log(FUNC + "end_date:", end_date);
    console.log(FUNC + "filter:", filter);

    // var ret = CacheChange.findOrdersByTimeRange(start_date, end_date);

    var ret = CacheChange.findOrdersByTimeRangeAndFilter(start_date, end_date, filter);

    cb(null, ret);
}

function _addHuafeiquan(req, dataObj, cb) {
    const FUNC = TAG + "_addHuafeiquan() --- ";
    //----------------------------------
    var uid = dataObj.uid;
    var num = dataObj.num;
    
    console.log(FUNC + "uid:", uid);
    console.log(FUNC + "num:", num);

    var ret = CacheAccount.addHuafeiquan(uid, num);

    cb(null, ret);
}
