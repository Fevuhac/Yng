const config = require('../config');
const consts = require('../consts');
const async = require('async');
const randomName = require("chinese-random-name");
const redisClient = require('../../../../utils/import_db').redisClient;
const redisAccountSync = require('../../../../utils/import_utils').redisAccountSync;
const KEYTYPEDEF = require('../../../../utils/import_def').KEYTYPEDEF;

class RobotBuilder {
    constructor() {
        this._weaponLevels = Object.keys(GAMECFG.newweapon_upgrade_cfg);
        for (let k in this._weaponLevels) {
            this._weaponLevels[k] = parseInt(this._weaponLevels[k]);
        }

        this._weaponSkins = Object.keys(GAMECFG.newweapon_weapons_cfg);
        this._roleMaxLevel = GAMECFG.player_level_cfg.length;
    }

    /**
     * 计算机器人武器等级、武器能量、武器皮肤
     * @param level
     * @returns {*}
     * @private
     */
    _calcWeapon(level, minLevel) {
        let weapon = {
            level: level,
            weapon_energy:{},
            skin:{}
        };

        let levels = Array.from(this._weaponLevels);
        levels.sort(function (a, b) {
            return a - b
        });

        let newLevel = level;
        for (let i = 0; i < levels.length; ++i) {
            if (levels[i] >= level) {
                let rm = utils.random_int(config.ROBOT.WEAPON_LEVEL_RANDOM[0], config.ROBOT.WEAPON_LEVEL_RANDOM[1]);
                i += rm;
                i = i >= levels.length ? levels.length - 1 : i;
                i = i < 0 ? 0 : i;
                newLevel = levels[i];
                break;
            }
        }
        newLevel = newLevel < minLevel ? minLevel : newLevel;
        weapon.level = newLevel;

        let level_filter = this._weaponLevels.filter(function (item) {
            return item <= newLevel;
        });

        level_filter.forEach(function (item) {
            weapon.weapon_energy[item] = utils.random_int(100, 3000);
        });
        weapon.skin = this.genOwnWeaponSkin();

        return weapon;
    }

    /**
     * 计算角色等级
     * @param level
     * @returns {*}
     * @private
     */
    _calcRoleLevel(level, minLevel) {
        let newLevel = level;
        newLevel += utils.random_int(config.ROBOT.ROLE_LEVEL_RANDOM[0], config.ROBOT.ROLE_LEVEL_RANDOM[1]);
        newLevel = newLevel < 1 ? 1 : newLevel;
        newLevel = newLevel > this._roleMaxLevel ? this._roleMaxLevel : newLevel;
        newLevel = newLevel < minLevel ? minLevel : newLevel;
        return newLevel;
    }

    /**
     * 计算武器皮肤
     * @returns {{own: [number], equip: number, star: {}}}
     * @private
     */
    genOwnWeaponSkin() {
        let weapon_skin = {
            own: [1],
            equip: 12,
            star: {}
        };

        let randomMap = new Map();
        for (let i = 0; i < 5; i++) {
            let index = utils.random_int(1, this._weaponSkins.length - 1);
            randomMap.set(index, this._weaponSkins[index]);
        }

        for (let skin of randomMap.values()) {
            weapon_skin.own.push(skin);
        }

        let equip_index = utils.random_int(0, weapon_skin.own.length - 1);
        weapon_skin.equip = weapon_skin.own[equip_index];

        return weapon_skin;
    }

    genBaseInfo(){
        return new Promise(function (resolve, reject) {
            let info = {
                figure_url:KEYTYPEDEF.OtherDef.figure_url.def,
                nickname:randomName.generate()
            };
            async.waterfall([function (cb) {
                redisClient.cmd.hlen(dbConsts.REDISKEY.FIGURE_URL, cb);
            },function (num, cb) {
                let skip = utils.random_int(0, num - 2);

                logger.error('----------------机器人昵称分配', 'num:', num, "skip:",skip);
                redisAccountSync.getHashValueLimit(dbConsts.REDISKEY.FIGURE_URL, skip, 2, (res, next) => {
                    if (!!res && res.length > 0) {
                        let uid = res[0];
                        let figure_url = res[1];
                        info.figure_url = figure_url || info.figure_url;
                        logger.error('----------------机器人昵称分配头像', figure_url);
                        cb(null, res[2]);
                    }
                    else {
                        cb(1);
                    }
                });

            },function (uid, cb) {
                redisAccountSync.getAccount(uid, [dbConsts.ACCOUNTKEY.NICKNAME], cb);
            }], function (err, account) {
                if(err){
                    resolve(info);
                    return;
                }
                logger.error('----------------机器人昵称分配', account.nickname);
                info.nickname = account.nickname || info.nickname;
                resolve(info)
            });

        });
    }

    _calcGold(num, minNum){
        let gold = num + utils.random_int(config.ROBOT.GOLD_RANDOM[0], config.ROBOT.GOLD_RANDOM[1]) * config.ROBOT.GOLD_STEP;
        gold = gold <= 0 ? config.ROBOT.GOLD_DEFAULT : gold;
        if (gold < minNum) {
            gold = minNum;
        }
        return gold;
    }

    _calcPearl(num){
        let pearl = num + utils.random_int(config.ROBOT.PEARL_RANDOM[0], config.ROBOT.PEARL_RANDOM[1]) * config.ROBOT.PEARL_STEP;
        pearl = pearl <= 0 ? config.ROBOT.PEARL_DEFAULT : pearl;
        return pearl;
    }

    async genAccount(room) {
        let minLevel = 0;
        let minGold = 0;
        let minWeaponLevel = room.config.min_level;
        if (room.mode == consts.GAME_MODE.MATCH) {
            minLevel = GAMECFG.common_const_cfg.RMATCH_ROLE_LV;
            minWeaponLevel = GAMECFG.common_const_cfg.RMATCH_OPEN_LIMIT;
        }else{
            minGold = room.config.needgold;
        }
        let robot_Level = this._calcRoleLevel(room.avgLevel, minLevel);
        let robot_weapon = this._calcWeapon(room.avgWeaponLevel, minWeaponLevel);
        let gold = this._calcGold(room.avgGold, minGold);
        let pearl = this._calcPearl(room.avgPearl);
        let exp = room.avgExp;
        let vip = room.avgVIP;
        let randomInfo = await this.genBaseInfo();

        let account = {
            nickname: randomInfo.nickname,
            level: robot_Level,
            weapon_skin: robot_weapon.skin,
            weapon: robot_weapon.level,
            gold: gold,
            pearl: pearl,
            vip: vip,
            comeback:{},
            weapon_energy: robot_weapon.weapon_energy,
            heartbeat: 100,
            roipct_time: 100,
            skill: {1: 2, 2: 8, 3: 8, 4: -1, 8: 2, 9: 0, 10: 0},
            exp: exp,
            figure_url: randomInfo.figure_url,
        };

        return account;
    }

}

module.exports = RobotBuilder;









