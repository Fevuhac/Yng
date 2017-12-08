////////////////////////////////////////////////////////////
// 技能接口的业务逻辑
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------
var CstError = require('./cst/buzz_cst_error');
var ERROR_OBJ = CstError.ERROR_OBJ;
var CommonUtil = require('./CommonUtil');
var DateUtil = require('../utils/DateUtil');
var ObjUtil = require('./ObjUtil');
var BuzzUtil = require('../utils/BuzzUtil');

//------------------------------------------------------------------------------
// 业务
//------------------------------------------------------------------------------
var update_weapon_energy = require('../dao/account/update/weapon_energy');

//------------------------------------------------------------------------------
// DAO
//------------------------------------------------------------------------------
var DaoCommon = require('../dao/dao_common');

//------------------------------------------------------------------------------
// 缓存(Cache)
//------------------------------------------------------------------------------
var CacheAccount = require('./cache/CacheAccount');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var skill_skill_cfg = require('../../cfgs/skill_skill_cfg');
var player_users_cfg = require('../../cfgs/player_users_cfg');
var newweapon_upgrade_cfg = require('../../cfgs/newweapon_upgrade_cfg');
var shop_shop_buy_type_cfg = require('../../cfgs/shop_shop_buy_type_cfg');

//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
var TAG = "【buzz_skill】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getInitStr = getInitStr;
exports.useSkill = useSkill;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 获取技能初始值(玩家创建账户时初始化)
 */
function getInitStr() {
    var initSkill = player_users_cfg[0].skillcount;
    var initObj = {};
    for (var idx in initSkill) {
        var skill_info = initSkill[idx];
        var skill_id = skill_info[0];
        var skill_num = skill_info[1];
        initObj["" + skill_id] = skill_num;
    }
    return ObjUtil.data2String(initObj);
}

/**
 * 使用技能.
 */
function useSkill(req, dataObj, cb) {
    const FUNC = TAG + "useSkill() --- ";
    //----------------------------------
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "use_skill");

    _useSkill(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'skill_id'], "buzz_skill", cb);
    }
}


//==============================================================================
// private
//==============================================================================
function _useSkill(req, dataObj, cb) {
    const FUNC = TAG + "_useSkill() --- ";
    var uid = dataObj.uid;
    var token = dataObj.token;
    var sid = "" + dataObj.skill_id;

    var pool = req.pool;

    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {

        let coinType = shop_shop_buy_type_cfg.BUY_SKILL.name;
        let coinId = shop_shop_buy_type_cfg.BUY_SKILL.id;

        let skill = account.skill;
        let costCoinOld = account[coinType];
        let costCoin = account[coinType];
        let ret = {
            skill: {
                skill_id: sid,
            },
        };
        ret[coinType] = costCoin;
        
        // console.log('1.' + coinType + ':', costCoin);

        CacheAccount.useSkill(uid, [{sid:sid, num:1}], dataObj);

        // 使用技能
        // {"1":203,"2":225,"3":203,"4":-1,"8":200,"9":200,"10":199}

        // 激光能量校验
        if (4 == sid) {
            
            var weapon_energy = dataObj.weapon_energy;// 每一个倍率的炮对应的累积激光能量
            if (weapon_energy) {
                // 激光防作弊字段
                var weapon_level = dataObj.weapon_level;// 客户端对应的当前武器倍率
                var weapon_info = newweapon_upgrade_cfg[weapon_level];

                update_weapon_energy.checkWeaponEnergy(weapon_energy, account, function(err) {
                    if (err) {
                        // 作弊直接踢出
                        cb && cb(ERROR_OBJ.TOKEN_INVALID);
                        return;
                    }
                    CacheAccount.setWeaponEnergy(account.id, weapon_energy);

                    var weapon_laser = weapon_energy;
                    if (weapon_laser < weapon_info.needpower) {
                        if (ERROR) console.error(FUNC + "玩家激光作弊");
                        CacheAccount.setOneWeaponEnergy(account, weapon_level, 0);
                        // 作弊直接踢出
                        cb && cb(ERROR_OBJ.TOKEN_INVALID);
                    }
                    else {
                        handleSkill();
                    }
                });
            }
            else {
                handleSkill();
            }
        }
        else {
            handleSkill();
        }

        function handleSkill() {

            if (skill[sid] && skill[sid] > 0) {
                skill[sid]--;
                ret.skill.skill_count = skill[sid];
            }
            else {
                for (var idx in skill_skill_cfg) {
                    var skill_info = skill_skill_cfg[idx];
                    if (skill_info.id == sid) {
                        ret.skill.skill_count = 0;
                        if (costCoin < skill_info.cost) {
                            // 钻石不够, 无法使用技能
                            if (ERROR) {
                                console.error(FUNC + "钻石不够, 无法使用技能");
                                console.error(FUNC + "  time:", DateUtil.format(new Date(), "yyy-MM-dd hh:mm:ss"));
                                console.error(FUNC + "  uid:", uid);
                                console.error(FUNC + "  skill_id:", sid);
                                console.error(FUNC + "  skill_cost:", skill_info.cost);
                                console.error(FUNC + "  costCoin:", costCoin);
                            }
                            cb(ERROR_OBJ.DIAMOND_NOT_ENOUGH, ret);
                            return;
                        }
                        costCoin -= skill_info.cost;

                        ret[coinType] = costCoin;
                        break;
                    }
                }
            }
            account.skill = skill;
            
            // console.log('2.' + coinType + ':', costCoin);

            BuzzUtil.useCoin(account, coinId, costCoinOld - costCoin, function(err, res) {
                account.commit();
                cb(null, ret);
            });
        }
    }

}

