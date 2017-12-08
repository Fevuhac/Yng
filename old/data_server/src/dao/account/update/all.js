////////////////////////////////////////////////////////////////////////////////
// Account Update All
// 数据更新
// update
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var StringUtil = require('../../../utils/StringUtil');
var ObjUtil = require('../../../buzz/ObjUtil');
var CstError = require('../../../buzz/cst/buzz_cst_error');
var CacheAccount = require('../../../buzz/cache/CacheAccount');
var AccountCommon = require('../common');
var update_mdr = require('./mission_daily_reset');
var update_moo = require('./mission_only_once');


var dao_gold = require('../../dao_gold');

var ERROR_CODE = CstError.ERROR_CODE;
var ERROR_OBJ = CstError.ERROR_OBJ;

var common_log_const_cfg = require('../../../../cfgs/common_log_const_cfg');


//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;

var TAG = "【update/all】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.update = _update;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 数据更新(退出游戏场景或退出账号时调用).
 */
function _update(pool, data, cb, my_account) {
    const FUNC = TAG + "_update() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");
    
    var uid = my_account.id;
    var token = my_account.token;

    if (!data.all) {
        if (ERROR) console.error(FUNC + "全部更新数据中没有all字段");
        cb(new Error("全部更新数据中没有all字段"));
        return;
    }
        
    var all = ObjUtil.str2Data(data.all);

    if (ObjUtil.isNull(all.mission_daily_reset)) {
        if (ERROR) console.error(FUNC + "全部更新数据中没有mission_daily_reset字段");
        cb(new Error("全部更新数据中没有mission_daily_reset字段"));
        return;
    }
    if (ObjUtil.isNull(all.mission_only_once)) {
        if (ERROR) console.error(FUNC + "全部更新数据中没有mission_only_once字段");
        cb(new Error("全部更新数据中没有mission_only_once字段"));
        return;
    }
    if (ObjUtil.isNull(all.achieve_point)) {
        if (ERROR) console.error(FUNC + "全部更新数据中没有achieve_point字段");
        cb(new Error("全部更新数据中没有achieve_point字段"));
        return;
    }

    var pirate = ObjUtil.data2String(all.pirate);


    // 成就点验证
    if (my_account.achieve_point > all.achieve_point) {
        all.achieve_point = my_account.achieve_point;
    }

    //--------------------------------------------------------------------------
    // 校验mission_daily_reset和mission_only_once_old
    //--------------------------------------------------------------------------
    var json_mission_only_once_new = update_moo.checkMissionOnlyOnce(my_account, all);
    var mission_only_once_new = ObjUtil.data2String(json_mission_only_once_new);

    var json_mission_daily_reset_new = update_mdr.checkMissionDailyReset(my_account, all);
    var mission_daily_reset_new = ObjUtil.data2String(json_mission_daily_reset_new);

    if (DEBUG)console.log(FUNC + "json_mission_daily_reset_new:", json_mission_daily_reset_new);

    //--------------------------------------------------------------------------
    // 更新缓存中的数据(重要:数据库操作将会被删除)
    //--------------------------------------------------------------------------
    CacheAccount.setPirate(uid, all.pirate);
    CacheAccount.setMissionDailyReset(uid, json_mission_daily_reset_new);
    CacheAccount.setMissionOnlyOnce(uid, json_mission_only_once_new);
    CacheAccount.setAchievePoint(uid, all.achieve_point);

    //--------------------------------------------------------------------------

    // 返回值高达9K, 这里只返回has_new_mail
    var ret = {
        id: my_account.id,
        has_new_mail: my_account.mail_box.length > 0,
    };
    cb(null, [ret]);
}

