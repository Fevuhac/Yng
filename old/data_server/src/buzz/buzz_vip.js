////////////////////////////////////////////////////////////
// Account Related
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------
var CstError = require('./cst/buzz_cst_error');
var ERROR_OBJ = CstError.ERROR_OBJ;

//------------------------------------------------------------------------------
// 业务
//------------------------------------------------------------------------------
var ObjUtil = require('./ObjUtil');
var DateUtil = require('../utils/DateUtil');
var BuzzUtil = require('../utils/BuzzUtil');
var RandomUtil = require('../utils/RandomUtil');

var ItemTypeC = require('./pojo/Item').ItemTypeC;

//------------------------------------------------------------------------------
// DAO
//------------------------------------------------------------------------------
// var dao_reward = require('../dao/dao_reward');
var DaoCommon = require('../dao/dao_common');

//------------------------------------------------------------------------------
// 缓存
//------------------------------------------------------------------------------
var CacheAccount = require('./cache/CacheAccount');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var vip_vip_cfg = require('../../cfgs/vip_vip_cfg');

//==============================================================================
// const
//==============================================================================
var DEBUG = 1;
var ERROR = 1;

var TAG = "【buzz_weapon】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.updateRmbAndVip = updateRmbAndVip;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 更新人民币和VIP
 */
function updateRmbAndVip(req, dataObj) {
    const FUNC = TAG + "updateRmbAndVip() --- ";
    //----------------------------------
    _updateRmbAndVip(req, dataObj);
}


//==============================================================================
// private
//==============================================================================

/**
 * 更新人民币和VIP
 */
function _updateRmbAndVip(req, dataObj) {
    const FUNC = TAG + "_updateRmbAndVip() --- ";
    const EFUNC = "<<<ERROR>>>" + TAG + "_updateRmbAndVip() --- ";

    var uid = dataObj.uid;
    var diamond = dataObj.diamond;
    var pool = req.pool;

    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {

        var prev_vip = account.vip;
        var prev_rmb = account.rmb;

        var curr_rmb = prev_rmb + diamond * 10;//1钻等于10分
        var curr_vip = prev_vip;
        for (key in vip_vip_cfg) {
            var value = vip_vip_cfg[key];
            if (value.vip_unlock * 100 <= curr_rmb) {
                curr_vip = value.vip_level;
            }
        }
        if (DEBUG) console.log("-------------------------------------");
        if (DEBUG) console.log(FUNC + "curr_vip: " + curr_vip);

        // 玩家VIP变化时重置vip_daily_reward
        if (curr_vip > prev_vip) {
            RedisUtil.hset("pair:uid:vip_daily_reward", uid, 0);
        }

        CacheAccount.setRmb(uid, curr_rmb);
        CacheAccount.setVip(uid, curr_vip);
    }
}
