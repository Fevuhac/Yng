////////////////////////////////////////////////////////////////////////////////
// Account Update Weapon Skin
// 更新玩家的武器皮肤信息
// update
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var ObjUtil = require('../../../buzz/ObjUtil');
var StringUtil = require('../../../utils/StringUtil');
var ArrayUtil = require('../../../utils/ArrayUtil');
var RedisUtil = require('../../../utils/RedisUtil');
var BuzzUtil = require('../../../utils/BuzzUtil');
var CstError = require('../../../buzz/cst/buzz_cst_error');
var buzz_cst_game = require('../../../buzz/cst/buzz_cst_game');

var AccountCommon = require('../common');
var CacheAccount = require('../../../buzz/cache/CacheAccount');
var DaoPearl = require('../../dao_pearl');

var newweapon_weapons_cfg = require('../../../../cfgs/newweapon_weapons_cfg');
var string_strings_cfg = require('../../../../cfgs/string_strings_cfg');
var common_log_const_cfg = require('../../../../cfgs/common_log_const_cfg');
var shop_shop_buy_type_cfg = require('../../../../cfgs/shop_shop_buy_type_cfg');

//==============================================================================
// const
//==============================================================================
const ERROR_CODE = CstError.ERROR_CODE;
const ERROR_OBJ = CstError.ERROR_OBJ;

var GAME_EVENT_TYPE = buzz_cst_game.GAME_EVENT_TYPE;

var DEBUG = 0;
var ERROR = 1;

var TAG = "【weapon_skin】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.update = _update;
exports.addBroadcast = _addBroadcast;
//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 更新玩家的武器皮肤信息.
 * weapon_skin字段数据结构: {own:[1,2,3], equip:1}
 * 有效性验证:
 * 1. own字段只能增加新的皮肤ID而不能减少
 * 2. equip只能装备玩家拥有的皮肤ID
 */
function _update(pool, data, cb, my_account) {
    const FUNC = TAG + "_update() --- ";
    if (DEBUG) console.log("CALL weapon_skin.update()");

    let coinType = shop_shop_buy_type_cfg.BUY_SKIN.name;
    let coinId = shop_shop_buy_type_cfg.BUY_SKIN.id;
    
    var uid = my_account['id'];
    var token = my_account['token'];
    var nickname = my_account['nickname'];
    var weapon_skin_old = my_account['weapon_skin'];

    var weapon_skin_new = data['weapon_skin'];
        
    // 需要消耗的钻石数量
    var pearl_cost = 0;
    // 玩家持有钻石总量
    var pearl_old = my_account[coinType];
    var pearl_new = pearl_old;
    
    var new_skin_list = [];
    // 数据有效性验证
    try {
        if (weapon_skin_new && weapon_skin_new != "") {
            var json_weapon_skin_new = weapon_skin_new;
            if (StringUtil.isString(weapon_skin_new)) {
                json_weapon_skin_new = ObjUtil.str2Data(weapon_skin_new);
            }
            var own_new = json_weapon_skin_new["own"];
            // yDONE: 用户不能购买已经拥有的皮肤. 对客户端数据进行一次去重处理
            own_new = ArrayUtil.delRepeat(own_new);
        
            if (weapon_skin_old && weapon_skin_old != "") {
                var json_weapon_skin_old = ObjUtil.str2Data(weapon_skin_old);
                // 1. own字段只能增加新的皮肤ID而不能减少
                var own_old = json_weapon_skin_old["own"];
                // own_old中有而own_new中没有将被视为不合法
                if (!_checkSkin(own_old, own_new)) {
                    if (ERROR) console.error("用户的武器皮肤不能减少!");
                    cb(new Error("用户的武器皮肤不能减少!"));
                    return;
                }
            }
        
            // 2. equip只能装备玩家拥有的皮肤ID
            var equip_new = json_weapon_skin_new["equip"];
            if (own_new.indexOf(equip_new) == -1) {
                if (ERROR) console.error("用户不能装备自己不拥有的武器皮肤!");
                cb(new Error("用户不能装备自己不拥有的武器皮肤!"));
                return;
            }
        
            // 3. 需要计算本次购买的皮肤ID，并验证玩家当前拥有的钻石是否足够
            new_skin_list = _getNewWeaponSkinId(own_old, own_new);
            pearl_cost = _getPearlCost(new_skin_list);
            if (pearl_cost > pearl_old) {
                if (ERROR) console.error("用户的钻石数量还不足以购买当前皮肤，请先充值钻石!");
                cb(new Error("用户的钻石数量还不足以购买当前皮肤，请先充值钻石!"));
                return;
            }
            pearl_new = pearl_new - pearl_cost;
        }
    }
    catch (err_parse) {
        if (ERROR) console.error(err_parse);
        if (ERROR) console.error(JSON.stringify(err_parse));
    }

    BuzzUtil.useCoin(my_account, coinId, pearl_cost, function (err, res) {

        console.log(FUNC + 'my_account.gold:', my_account.gold);

        if (pearl_cost > 0) {
            switch(coinType) {
                case "pearl":
                    console.log(FUNC + uid + "购买皮肤消耗钻石");
                    logDiamond.push({
                        account_id: uid,
                        log_at: new Date(),
                        gain: 0,
                        cost: pearl_cost,
                        total: pearl_new,
                        scene: common_log_const_cfg.SKIN_BUY,
                        nickname: 0,
                    });
                break;
                case "gold":
                    console.log(FUNC + uid + "购买皮肤消耗金币");
                    my_account.cost = pearl_cost;//其他消耗 购买皮肤累加
                    my_account.commit();
                    logGold.push({
                        account_id: uid,
                        log_at: new Date(),
                        gain: 0,
                        cost: pearl_cost,
                        total: pearl_new,
                        scene: common_log_const_cfg.SKIN_BUY,
                        nickname: 0,
                        duration: 0,
                        level: my_account.level,
                    });
                break;
            }

        }

        CacheAccount.setWeaponSkin(my_account, ObjUtil.str2Data(weapon_skin_new), function (chs) {
            var ret = {
                weapon_skin: ObjUtil.str2Data(weapon_skin_new),
            };
            ret[coinType] = pearl_new;
            if (chs && chs.length == 2) {
                var charmPoint = chs[0];
                var charmRank = chs[1];
                charmPoint >= 0 && (ret.charm_point = charmPoint);
                charmRank >= 0 && (ret.charm_rank = charmRank);
            }
            cb && cb(null, [ret]);
        });

        // TODO: 添加游戏事件公告
        _addBroadcast(my_account, new_skin_list);
    });
}


//==============================================================================
// private
//==============================================================================

function _addBroadcast(my_account, new_skin_list) {
    const FUNC = TAG + "_addBroadcast() --- ";

    // console.log(FUNC + "nickname:", my_account.nickname);
    // console.log(FUNC + "tempname:", my_account.tempname);
    // console.log(FUNC + "channel_account_name:", my_account.channel_account_name);

    // 玩家新增皮肤ID数组长度大于0则添加广播事件
    var player = my_account.nickname;
    // console.log(FUNC + "player:", player);
    for (var i = 0; i < new_skin_list.length; i++) {
        var skinId = new_skin_list[i];
        var weapon_item = newweapon_weapons_cfg["" + skinId];
        if (weapon_item) {
            var weaponNameId = weapon_item.name;
            var weapon_skin = string_strings_cfg[weaponNameId].cn;
            var charm = my_account.charm_rank && parseInt(my_account.charm_rank) || 0;
            var content = {
                txt: player + ' 获得了皮肤：' + weapon_skin,
                times: 1,
                type: GAME_EVENT_TYPE.SKIN_GOT,
                params: [player, weapon_skin, my_account.vip,charm],
                platform: my_account.platform,
            };
            buzz_cst_game.addBroadcastGameEvent(content);
        }
        else {
            console.error(FUNC + "[ERROR]没有在配置表newweapon_weapons_cfg中找到对应的皮肤ID, 请更新服务器的配置表");
        }
    }
}

// 数据正确返回true.
function _checkSkin(own_old, own_new) {
    for (var i = 0; i < own_old.length; i++) {
        if (own_new.indexOf(own_old[i]) == -1) {
            return false;
        }
    }
    return true;
}

// 获取新购买的武器皮肤ID数组
function _getNewWeaponSkinId(own_old, own_new) {
    var ret = [];
    for (var i = 0; i < own_new.length; i++) {
        if (own_old.indexOf(own_new[i]) == -1) {
            ret.push(own_new[i]);
        }
    }
    return ret;
}

// 获取新购买的皮肤价值(以钻石计算)
function _getPearlCost(new_skin_list) {
    var ret = 0;
    for (var i = 0; i < new_skin_list.length; i++) {
        // newweapon_weapons_cfg需要key为字符串而不能为数字
        var weapon_item = newweapon_weapons_cfg["" + new_skin_list[i]];
        ret += weapon_item["price"];// DONE: 从武器皮肤表中获取皮肤的钻石价格
    }
    return ret;
}

function _insertPearlLog(pool, insert_data) {
    DaoPearl.insert(pool, insert_data);
}