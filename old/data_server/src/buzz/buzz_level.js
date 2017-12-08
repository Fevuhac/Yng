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

//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;

var TAG = "【buzz_level】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.levelUp = levelUp;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 武器升级
 */
function levelUp(req, dataObj, cb) {
    const FUNC = TAG + "levelUp() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "level_up");

    _levelUp(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'exp'], "buzz_level", cb);
    }
}

//==============================================================================
// private
//==============================================================================

/**
 * 发放人物升级奖励，具体升级和经验值计算放在战斗服，数据服负责发放奖励，务必注意校验，防止反复发奖
 */
function _levelUp(req, dataObj, cb) {
    const FUNC = TAG + "_levelUp() --- ";
    var uid = dataObj.uid;
    var token = dataObj.token;
    var oldLevel = dataObj.old_level;
    var oldExp = dataObj.old_exp;
    var newLevel = dataObj.level;
    var newExp = dataObj.exp;
    var pool = req.pool;

    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {
        let nowLv = account.level;
        //console.error(FUNC + "AAA玩家的经验值不可能涨到下一级oldExp222= ", newLevel, nowLv, oldLevel, newExp, account.exp);
        if (newLevel === nowLv && oldLevel + 1 === nowLv && newExp >= account.exp) {
            if (!_checkLevelup1()) return;
            var player_level = BuzzUtil.getPlayerLevelByLevel(oldLevel);
            var player_level_next = BuzzUtil.getPlayerLevelByLevel(newLevel);

            // console.error(FUNC + "AAA玩家的经验值不可能涨到下一级oldExp=" + oldExp);
            // console.error(FUNC + "AAA玩家的经验值不可能涨到下一级player_level.exp_max=" + player_level.exp_max);
            // console.error(FUNC + "AAA玩家的经验值不可能涨到下一级newExp=" + newExp);

            if (oldExp - player_level.exp_max > newExp) {
                return;
            }
            if (!_checkLevelup2()) return;

            var item_list = BuzzUtil.getItemList(player_level_next.reward_package);
            BuzzUtil.putIntoPack(req, account, item_list, function(reward_info) {
                var change = BuzzUtil.getChange(account, reward_info);
                var ret = {
                    item_list: item_list,
                    change: change,
                };
                cb(null, ret);
            });
            console.error(FUNC + ":升级奖励发放成功");
        }
        
        // 校验方法1
        function _checkLevelup1() {
            if (oldLevel == 99) {
                if (ERROR) console.error(FUNC + "玩家已经是最大等级");
                cb(ERROR_OBJ.LEVELUP_MAX_LEVEL);
                return false;
            }

            return true;
        }

        function _checkLevelup2() {
            if (player_level_next != null && player_level_next.exp_max < oldExp) {
                if (ERROR) console.error(FUNC + "玩家的经验值不可能涨到下一级");
                cb(ERROR_OBJ.LEVELUP_EXP_TOO_MUCH);
                return false;
            }

            return true;
        }
    }
}


