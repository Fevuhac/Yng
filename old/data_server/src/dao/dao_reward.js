////////////////////////////////////////////////////////////
// Ai Related
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// POJO对象
//------------------------------------------------------------------------------
var Reward = require('../buzz/pojo/Reward');

//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------
var utils = require('../buzz/utils');
var DateUtil = require('../utils/DateUtil');
var ObjUtil = require('../buzz/ObjUtil');
var StringUtil = require('../utils/StringUtil');
var ArrayUtil = require('../utils/ArrayUtil');
var CstError = require('../buzz/cst/buzz_cst_error');
var ItemTypeC = require('../buzz/pojo/Item').ItemTypeC;
var RedisUtil = require('../utils/RedisUtil');

var CacheAccount = require('../buzz/cache/CacheAccount');

var DaoGold = require('./dao_gold');
var DaoPearl = require('./dao_pearl');
var DaoCommon = require('./dao_common');

let _package = require('./account/update/package');

var _ = require('underscore');

var AccountCommon = require('./account/common');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var active_cdkey_cfg = require('../../cfgs/active_cdkey_cfg');
var item_item_cfg = require('../../cfgs/item_item_cfg');


//==============================================================================
// const
//==============================================================================

const ERROR_CODE = CstError.ERROR_CODE;
const ERROR_OBJ = CstError.ERROR_OBJ;

var DEBUG = 0;
var ERROR = 1;

var TAG = "【dao_reward】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getCommonReward = getCommonReward;
exports.costCommon = costCommon;
exports.getReward = getReward;
exports.cost = cost;// 交换时的代价, 需要从背包中移除的物品
exports.enough = enough;// 交换时的代价, 判断玩家是否拥有足够的物品进行交换

exports.resetMonthSign = resetMonthSign;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 限时道具获得时间，方便计算过期时间
 */
function _setItemGetAt (account, reward) {
    if (reward) {
        let cmds = [];
        let ts = {};
        const HK = _package.LIMIT_ITEM_HK;
        _package.checkItemLimitEnd(account, function (res) {
            if (res) {
                for (var k in res) {
                    let pk = HK + k;
                    ts[pk] = res[k];
                }
            }

            for (let i = 0; i < reward.length; i ++) {
                let tw = reward[i];
                let itemId = tw[0];
                let itemNum = tw[1];
                let IT_CFG = item_item_cfg[itemId];
                if (IT_CFG) {
                    let ltype = IT_CFG.lengthtype;
                    if (ltype === 1 || ltype === 2) {
                        let pk = HK + itemId;
                        if (!ts[pk]) {
                            ts[pk] = [];
                        }
                        console.log('-itemId - itemId = ', itemId);
                        let now = new Date().getTime();
                        let td = [now, itemNum];//领取时间戳、该时间领取的数量
                        ts[pk].push(td);
                    }
                }
            }
            let uid = account.id;
            for (var k in ts) {
                let temp = ts[k];
                if (temp.length > 0) {
                    let val = JSON.stringify(temp);
                    let tt = ['hset', k, uid, val];
                    cmds.push(tt);
                }
            }
            if (cmds.length > 0) {
                RedisUtil.multi(cmds, function (err, result) {
                    if (err) {
                        console.log('限时道具获得时间批量写入失败！');
                    }
                });
            }
        });
    }
}


/**
 * 每月一日重置月签数据
 */
function resetMonthSign(pool, monthSignInitStr, cb) {
    const FUNC = TAG + "resetMonthSign() --- ";

    var sql = "";
    sql += "UPDATE `tbl_account_sign` ";
    sql += "SET month_sign=? ";

    var sql_data = [monthSignInitStr];

    pool.query(sql, sql_data, function(err, result) {
        if (ERROR) console.error(FUNC + "err:", err);
        if (DEBUG) console.log(FUNC + "result:", result);
        cb();
    });
}

/**
 * 获取奖励.
 * @param data 包含两个数据account, reward.
 */
function getCommonReward(pool, data, cb) {
    const FUNC = TAG + "getCommonReward() --- ";

    if (DEBUG) console.log(FUNC + "data:\n", data);

    var account = data.account;
    var reward = data.reward;
    getReward(pool, account, reward, cb);
}

/**
 * 消耗物品.
 * @param data 包含两个数据account, reward.
 */
function costCommon(pool, data, cb) {
    const FUNC = TAG + "costCommon() --- ";

    if (DEBUG) console.log(FUNC + "data:\n", data);

    var account = data.account;
    var reward = data.reward;
    cost(pool, account, reward, cb);
}

/**
 * 获取奖励.
 * @param account 获取奖励的账户.
 * @param reward 获取的奖励字符串(或对象), 需要统一为对象作为Reward的输入.
 *     reward格式为
 */
function getReward(pool, account, reward, cb) {
    const FUNC = TAG + "getReward() --- ";
    var account_id = account.id;
    var level = account.level;
    
    if (DEBUG) console.log(FUNC + 'reward:', reward);
    
    reward = ObjUtil.str2Data(reward);
    //新增限时道具获得时间，方便计算过期时间
    _setItemGetAt(account, reward);
    var rewardInfo = new Reward(reward);
    
    if (DEBUG) console.log(FUNC + 'rewardInfo:', rewardInfo);
    
    var gold = rewardInfo.gold;
    var pearl = rewardInfo.pearl;
    var active_point = rewardInfo.active_point;
    var achieve_point = rewardInfo.achieve_point;
    
    var skill_inc = rewardInfo.skill;
    var debris_inc = rewardInfo.debris;
    var gift_inc = rewardInfo.gift;
    var tokens_inc = rewardInfo.tokens;
    var mix_inc = rewardInfo.mix;
    var skin_inc = rewardInfo.skin;
    var skin_debris_inc = rewardInfo.skin_debris;


    if (DEBUG) console.log(FUNC + "更新缓存中的玩家数据");

    if(gold > 0){
        account.gold = gold;
    }

    if(pearl > 0){
        account.pearl += pearl;
    }

    CacheAccount.addActivePoint(account, active_point);
    CacheAccount.addAchievePoint(account, achieve_point);

    if (DEBUG) console.log(FUNC + "(1)cache_account.skill:", account.skill);
    if (DEBUG) console.log(FUNC + "skill_inc:", skill_inc);

    if (!account.skill) {
        account.skill = {};
    }
    account.skill = ObjUtil.update(account.skill, skill_inc);

    if (DEBUG) console.log(FUNC + "(2)cache_account.skill:", account.skill);

    if (account.package[ItemTypeC.DEBRIS] == null) {
        account.package[ItemTypeC.DEBRIS] = {};
    }
    account.package[ItemTypeC.DEBRIS] = ObjUtil.update(account.package[ItemTypeC.DEBRIS], debris_inc);

    if (account.package[ItemTypeC.GIFT] == null) {
        account.package[ItemTypeC.GIFT] = {};
    }
    account.package[ItemTypeC.GIFT] = ObjUtil.update(account.package[ItemTypeC.GIFT], gift_inc);

    if (account.package[ItemTypeC.TOKENS] == null) {
        account.package[ItemTypeC.TOKENS] = {};
    }
    account.package[ItemTypeC.TOKENS] = ObjUtil.update(account.package[ItemTypeC.TOKENS], tokens_inc);

    if (account.package[ItemTypeC.MIX] == null) {
        account.package[ItemTypeC.MIX] = {};
    }
    account.package[ItemTypeC.MIX] = ObjUtil.update(account.package[ItemTypeC.MIX], mix_inc);


    if (account.package[ItemTypeC.SKIN] == null) {
        account.package[ItemTypeC.SKIN] = {};
    }
    account.package[ItemTypeC.SKIN] = ObjUtil.update(account.package[ItemTypeC.SKIN], skin_inc);

    if (account.package[ItemTypeC.SKIN_DEBRIS] == null) {
        account.package[ItemTypeC.SKIN_DEBRIS] = {};
    }
    account.package[ItemTypeC.SKIN_DEBRIS] = ObjUtil.update(account.package[ItemTypeC.SKIN_DEBRIS], skin_debris_inc);

    account.package = account.package;
    account.commit(function (err, result) {
        // TODO:如果金币和钻石改变量为0则不在写数据库
        if (gold == 0 && pearl == 0) {
            cb(null, 1);
            return;
        }

        // TODO: tbl_gold&tbl_pearl数据入缓存
        cb(null, 1);
    });
}

function cost(pool, account, needitem, cb) {
    const FUNC = TAG + "cost() --- ";

    var account_id = account.id;
    
    if (DEBUG) console.log(FUNC + 'needitem:', needitem);
    
    var rewardInfo = new Reward(needitem);
    
    var gold = rewardInfo.gold;
    var pearl = rewardInfo.pearl;
    
    var skill_inc = rewardInfo.skill;
    var debris_inc = rewardInfo.debris;
    var gift_inc = rewardInfo.gift;
    var tokens_inc = rewardInfo.tokens;
    var mix_inc = rewardInfo.mix;
    var skin_inc = rewardInfo.skin;
    var skin_debris_inc = rewardInfo.skin_debris;

    if (DEBUG) console.log(FUNC + "account.skill:", account.skill);


    doNextWithAccount(account);
    
    // =========================================================================
    // 消耗物品(更新缓存)
    // =========================================================================

    function doNextWithAccount(account) {
        if (DEBUG) console.log(FUNC + "更新缓存中的玩家数据");

        ObjUtil.cost(account.skill, skill_inc, cb);
        ObjUtil.cost(account.package[ItemTypeC.DEBRIS], debris_inc, cb);
        ObjUtil.cost(account.package[ItemTypeC.GIFT], gift_inc, cb);
        ObjUtil.cost(account.package[ItemTypeC.TOKENS], tokens_inc, cb);
        ObjUtil.cost(account.package[ItemTypeC.MIX], mix_inc, cb);
        ObjUtil.cost(account.package[ItemTypeC.SKIN], skin_inc, cb);
        ObjUtil.cost(account.package[ItemTypeC.SKIN_DEBRIS], skin_debris_inc, cb);


        account.skill = account.skill;
        account.package = account.package;
        if (gold > 0) {
            account.gold = -gold;//金币使用增量，等号后面是delta
        }
        if (pearl > 0) {
            account.pearl -= pearl;
        }
        account.commit();
        cb(null, 1);
    }
}

function enough(account, needitem) {
    const FUNC = TAG + "enough() --- ";

    var account_id = account.id;
    
    if (DEBUG) console.log(FUNC + 'needitem: ', needitem);
    
    var rewardInfo = new Reward(needitem);
    
    var gold = rewardInfo.gold;
    var pearl = rewardInfo.pearl;
    
    var skill_inc = rewardInfo.skill;
    var debris_inc = rewardInfo.debris;
    var gift_inc = rewardInfo.gift;
    var tokens_inc = rewardInfo.tokens;
    var mix_inc = rewardInfo.mix;
    var skin_inc = rewardInfo.skin;
    var skin_debris_inc = rewardInfo.skin_debris;
    
    // =========================================================================
    // 兑换中消耗物品
    // =========================================================================
    var skill_old = ObjUtil.str2Data(account.skill == null ? {} : account.skill);
    var pack_old = ObjUtil.str2Data(account.package == null ? {} : account.package);
    
    if (DEBUG) console.log(FUNC + "skill_old: ", skill_old);
    //if (DEBUG) console.log(FUNC + "pack_old: ", pack_old);
    
    var notEnough = {};
    
    // 技能
    if (!ObjUtil.isEmpty(skill_inc)) {
        if (DEBUG) console.log(FUNC + "验证技能!");
        var diff = ObjUtil.enough(skill_old, skill_inc);
        if (ObjUtil.length(diff) > 0) notEnough["skill"] = diff;
    }
    // 碎片
    if (!ObjUtil.isEmpty(debris_inc)) {
        if (DEBUG) console.log(FUNC + "验证碎片!");
        pack_old[ItemTypeC.DEBRIS] = ObjUtil.noNull(pack_old[ItemTypeC.DEBRIS]);
        var diff = ObjUtil.enough(pack_old[ItemTypeC.DEBRIS], debris_inc);
        if (ObjUtil.length(diff) > 0) notEnough[ItemTypeC.DEBRIS] = diff;
    }
    // 礼包
    if (!ObjUtil.isEmpty(gift_inc)) {
        if (DEBUG) console.log(FUNC + "验证礼包!");
        pack_old[ItemTypeC.GIFT] = ObjUtil.noNull(pack_old[ItemTypeC.GIFT]);
        var diff = ObjUtil.enough(pack_old[ItemTypeC.GIFT], gift_inc);
        if (ObjUtil.length(diff) > 0) notEnough[ItemTypeC.GIFT] = diff;
    }
    // 代币
    if (!ObjUtil.isEmpty(tokens_inc)) {
        if (DEBUG) console.log(FUNC + "验证代币!");
        pack_old[ItemTypeC.TOKENS] = ObjUtil.noNull(pack_old[ItemTypeC.TOKENS]);
        var diff = ObjUtil.enough(pack_old[ItemTypeC.TOKENS], tokens_inc);
        if (ObjUtil.length(diff) > 0) notEnough[ItemTypeC.TOKENS] = diff;
    }
    // 合成物品
    if (!ObjUtil.isEmpty(mix_inc)) {
        if (DEBUG) console.log(FUNC + "验证合成物品!");
        pack_old[ItemTypeC.MIX] = ObjUtil.noNull(pack_old[ItemTypeC.MIX]);
        var diff = ObjUtil.enough(pack_old[ItemTypeC.MIX], mix_inc);
        if (ObjUtil.length(diff) > 0) notEnough[ItemTypeC.MIX] = diff;
    }
    // 武器皮肤
    if (!ObjUtil.isEmpty(skin_inc)) {
        if (DEBUG) console.log(FUNC + "验证武器皮肤!");
        pack_old[ItemTypeC.SKIN] = ObjUtil.noNull(pack_old[ItemTypeC.SKIN]);
        var diff = ObjUtil.enough(pack_old[ItemTypeC.SKIN], skin_inc);
        if (ObjUtil.length(diff) > 0) notEnough[ItemTypeC.SKIN] = diff;
    }
    // 武器皮肤碎片
    if (!ObjUtil.isEmpty(skin_debris_inc)) {
        if (DEBUG) console.log(FUNC + "验证武器皮肤碎片!");
        pack_old[ItemTypeC.SKIN_DEBRIS] = ObjUtil.noNull(pack_old[ItemTypeC.SKIN_DEBRIS]);
        var diff = ObjUtil.enough(pack_old[ItemTypeC.SKIN_DEBRIS], skin_debris_inc);
        if (ObjUtil.length(diff) > 0) notEnough[ItemTypeC.SKIN_DEBRIS] = diff;
    }
    // =========================================================================
    // 金币
    if (!ObjUtil.isEmpty(gold)) {
        if (DEBUG) console.log(FUNC + "验证金币!");
        if (account.gold < gold) notEnough[ItemTypeC.GOLD] = 1;
    }
    // 验证钻石
    if (!ObjUtil.isEmpty(pearl)) {
        if (DEBUG) console.log(FUNC + "验证钻石!");
        if (account.pearl < pearl) notEnough[ItemTypeC.PEARL] = 1;
    }

    if (DEBUG) console.log(FUNC + 'notEnough: ', notEnough);

    return ObjUtil.length(notEnough) == 0;
}

//==============================================================================
// private
//==============================================================================

// 100这种场景就是获得奖励时的场景.

function _addGoldLog(pool, uid, gain, cost, total, level) {
    const FUNC = TAG + "_addGoldLog() --- ";

    var data = {
        account_id : uid,
        gain : gain,
        cost : cost,
        total : total,
        duration : 0,
        scene : 100,
        nickname : 0,
        level : level,
    };
    DaoGold.insert(pool, data, function(err, result) {
        if (err) {
            if (ERROR) console.error(FUNC + "[ERROR][uid:" + uid + "]err:", err);
            return;
        }
        if (DEBUG) console.log(FUNC + "result:", result);
    });
}

function _addPearlLog(pool, uid, gain, cost, total) {
    const FUNC = TAG + "_addPearlLog() --- ";

    var data = {
        account_id : uid,
        gain : gain,
        cost : cost,
        total : total,
        scene : 100,
        nickname : 0,
    };
    DaoPearl.insert(pool, data,function(err, result) {
        if (err) {
            if (ERROR) console.error(FUNC + "[ERROR][uid:" + uid + "]err:", err);
            return;
        }
        if (DEBUG) console.log(FUNC + "result:", result);
    });
}
