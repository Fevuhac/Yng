////////////////////////////////////////////////////////////////////////////////
// Account Update Weapon Energy
// 武器充能更新
// update
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
let StringUtil = require('../../../utils/StringUtil');

//----------------------------------------------------------
// Redis
//----------------------------------------------------------
let RedisUtil = require('../../../utils/RedisUtil');
let REDIS_KEYS = require('../../../buzz/cst/buzz_cst_redis_keys').REDIS_KEYS,
    PAIR = REDIS_KEYS.PAIR;

let ObjUtil = require('../../../buzz/ObjUtil');
let CstError = require('../../../buzz/cst/buzz_cst_error');

let AccountCommon = require('../common');
let CacheAccount = require('../../../buzz/cache/CacheAccount');

//----------------------------------------------------------
// Configs
//----------------------------------------------------------
let newweapon_weapons_cfg = require('../../../../cfgs/newweapon_weapons_cfg');


//==============================================================================
// const
//==============================================================================
const ERROR_CODE = CstError.ERROR_CODE;
const ERROR_OBJ = CstError.ERROR_OBJ;

let DEBUG = 0;
let ERROR = 1;
let TAG = "【update/weapon_energy】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.update = _update;
exports.checkWeaponEnergy = checkWeaponEnergy;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 武器充能更新.
 */
function _update(pool, data, cb, account) {
    if (DEBUG) console.log("CALL weapon_energy.update()");
    
    let uid = account['id'];
    let token = account['token'];
    let weapon_energy = ObjUtil.str2Data(data['weapon_energy']);

    checkWeaponEnergy(weapon_energy, account, function(err) { 
        if (err) {
            cb && cb(null, [{
                weapon_energy: account.weapon_energy,
            }]);
            return;
        }  
        CacheAccount.setWeaponEnergy(uid, weapon_energy);
        cb && cb(null, ["success"]);
    });
}

/**
 * 校验武器激光能量(使用时间差校验)
 */
function checkWeaponEnergy(new_weapon_energy, account, cb) {
    let uid = account.id;
    const FUNC = TAG + "checkWeaponEnergy() --- ";
    RedisUtil.hget(PAIR.UID_TIMESTAMP_UPDATE_LASER_ENERGY, uid, function(err, res) {
        if (err) return cb && cb(err);

        // 有时间戳才校验, 没有不校验且设置初始时间戳.
        let current_timestamp = new Date().getTime();
        RedisUtil.hset(PAIR.UID_TIMESTAMP_UPDATE_LASER_ENERGY, uid, current_timestamp);
        if (res) {
            // 校验代码
            let delta_time = (current_timestamp - parseInt(res)) / 1000;

            let weapon_info = newweapon_weapons_cfg[account.weapon_skin.equip];
            let power = weapon_info.power;
            let interval = weapon_info.interval;
            let max_delta_energy = power[1] / interval * delta_time;
            
            //console.log(FUNC + "delta_time:", delta_time);
            //console.log(FUNC + "power[1]:", power[1]);
            //console.log(FUNC + "interval:", interval);

            let old_weapon_energy = CacheAccount.getAllWeaponEnergy(account);

            var client_delta_energy = 0;
            for (let level in new_weapon_energy) {
                let new_energy_for_level = new_weapon_energy[level];
                let old_energy_for_level = old_weapon_energy[level];

                let delta_energy = new_energy_for_level - old_energy_for_level;
                client_delta_energy += delta_energy;
                if (delta_energy > 0) {
                    console.log(FUNC + "<<" + level + ">>old_energy_for_level:", old_energy_for_level);
                    console.log(FUNC + "<<" + level + ">>new_energy_for_level:", new_energy_for_level);
                    console.log(FUNC + "<<" + level + ">>delta_energy:", delta_energy);
                }
            }

            // 容差20%
            //console.log(FUNC + "<<<<<<<<<<<< client_delta_energy:", client_delta_energy);
            //console.log(FUNC + "<<<<<<<<<<<< max_delta_energy:", max_delta_energy);
            
            if ((client_delta_energy - max_delta_energy) > max_delta_energy * 0.2) {
                console.error(FUNC + "玩家激光能量数据异常, 返回错误码");
                cb(new Error("玩家激光能量数据异常, 返回错误码"));
                return;
            }
        }
        cb();
    });
}


//==============================================================================
// private
//==============================================================================
