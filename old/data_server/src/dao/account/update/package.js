////////////////////////////////////////////////////////////////////////////////
// Account Update Package
// 背包更新
// update
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var utils = require('../../../buzz/utils');
var ObjUtil = require('../../../buzz/ObjUtil');
var StringUtil = require('../../../utils/StringUtil');
var BuzzUtil = require('../../../utils/BuzzUtil');
var AccountCommon = require('../common');
var CacheAccount = require('../../../buzz/cache/CacheAccount');
var item_item_cfg = require('../../../../cfgs/item_item_cfg');
var drop_droplist_cfg = require('../../../../cfgs/drop_droplist_cfg');
var DaoReward = require('../../dao_reward');
var newweapon_weapons_cfg = require('../../../../cfgs/newweapon_weapons_cfg');
var weapon_skin = require('./weapon_skin');
var RedisUtil = require('../../../utils/RedisUtil');

var Item = require('../../../buzz/pojo/Item'),
    ItemType = Item.ItemType,
    ItemTypeC = Item.ItemTypeC;

const SCENE = require('../../../../cfgs/common_log_const_cfg');


//==============================================================================
// const
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
const LIMIT_ITEM_HK = 'limit_item_at:uid:';
exports.LIMIT_ITEM_HK = LIMIT_ITEM_HK;

var TAG = "【dao/account/update/package】";

let LIMIT_ITEM_IDS = []; //限时道具id
for (var k in item_item_cfg) {
    let cfg = item_item_cfg[k];
    let ltype = cfg.lengthtype;
    if (ltype === 1 || ltype === 2) {
        LIMIT_ITEM_IDS.push(k);
    }
}
exports.LIMIT_ITEM_IDS = LIMIT_ITEM_IDS;

//==============================================================================
// public
//==============================================================================
/**
 * 剔除限时道具
 */
function _clearLimitItem (uid, itemId, gotAt, clearCount, doneFunc) {
    let pk = LIMIT_ITEM_HK + itemId;
    RedisUtil.hget(pk, uid, function (err, ret) {
        if (ret) {
            ret = JSON.parse(ret);
            let newData = [];
            let doneC = 0;
            for (var i = 0; i < ret.length; i ++) {
                let td = ret[i];
                let isChanged = false;
                let at = td[0];
                let ownCount = td[1];
                if (at == gotAt) {
                    ownCount -= clearCount;
                    if (ownCount < 0) {
                        ownCount = 0;
                    }
                    isChanged = ownCount == 0; //数量为0，则直接剔除
                    td[1] = ownCount;
                    doneC ++;
                }
                if (!isChanged) {
                    newData.push(td);
                }
            }
            if (!doneC) {
                doneFunc && doneFunc();
                return;
            }
            if (newData.length > 0) {
                newData = JSON.stringify(newData);
                RedisUtil.hset(pk, uid, newData, function (err, res) {
                    if (err) {
                        console.log('剔除失败！', pk, uid);
                    }else{
                        console.log("----剔除done!");
                    }
                    doneFunc && doneFunc();
                })
            }else{
                RedisUtil.hdel(pk, uid, function (err, ret) {
                    if (err) {
                        console.log('---剔除至0，删除失败！', pk, uid);
                    }else{
                        console.log("---剔除至0，删除done!");
                    }
                    doneFunc && doneFunc();
                });
            }
        }else{
            doneFunc && doneFunc();
        }
    });
};

/**
 * 某个道具限时剩余时间
 */
function _getItemLimitLeft(itemId, gotAt) {
    let IT_CFG = item_item_cfg[itemId];
    if (!IT_CFG) {
        return -3;
    }
    let ltype = IT_CFG.lengthtype;
    if (ltype !== 1 &&ltype !== 2) {
        return -1;
    }
    let lengthtime = IT_CFG.lengthtime; //过期时长，单位秒
    if (ltype === 2) {
        //将天数转换成秒,减去领取时距离第二天0点已过的秒数
        lengthtime = lengthtime*24*60*60;
        var theDate = new Date(gotAt);
        var hours = theDate.getHours();
        var minutes = theDate.getMinutes();
        var sec = theDate.getSeconds();
        let from0Seconds = hours*60*60 + minutes*60 + sec;
        lengthtime -= from0Seconds;
    }
    lengthtime *= 1000;//最终成毫秒

    let now = new Date().getTime();
    let pass = now - gotAt;
    if (pass >= 0) {
        pass = Math.ceil(pass);
        let left = lengthtime - pass;
        if (left <= 0) {
            left = 0;
        }
        return left;
    }else{
        return -2;
    }
};

/**
 * 检查限时道具是否到期,并及时清理
 */
exports.checkItemLimitEnd = function (account, cb) {
    let cmds = [];
    let ids = [];
    let uid = account.id;
    for (var i = 0; i < LIMIT_ITEM_IDS.length; i ++) {
        let itemId = LIMIT_ITEM_IDS[i];
        let pk = LIMIT_ITEM_HK + itemId;
        let temp = ['hget', pk, uid];
        cmds.push(temp);
        ids.push(itemId);
    }
    if (cmds.length > 0) {
        RedisUtil.multi(cmds, function (err, result) {
            if (err) {
                console.log('限时道具领取时间批量读取失败！');
                cb && cb(null);
            }else{
                if (result) {
                    let ret = {};
                    let clear = {};
                    for (var i  = 0; i < result.length; i ++) {
                        let one = result[i];
                        if (one) {
                            let itemId = ids[i];
                            let td = JSON.parse(one);
                            let newData = [];
                            for (var j = 0; j < td.length; j ++) {
                                let info = td[j];
                                let at = info[0];//获得时间
                                //判定该获得是否过期，过期则筛选出数据，待剔除
                                let left = _getItemLimitLeft(itemId, at);
                                if (left <= 0) {
                                    if (!clear[itemId]) {
                                        clear[itemId] = [];
                                    }
                                    clear[itemId].push(info);
                                }else{
                                    newData.push(info);
                                }
                            }
                            if (newData.length > 0) {
                                ret[itemId] = newData;
                            }
                        }
                    }
                    //剔除过期，重写剩余值
                    if (clear && Object.keys(clear).length > 0) {
                        let curPackage = account.package;
                        let isDone = false;
                        let ncmds = [];
                        for (var k in clear) {
                            let itemId = k;
                            let val = ret[itemId];
                            let pk = LIMIT_ITEM_HK + itemId;
                            if (val) {
                                val = JSON.stringify(val);
                                let temp = ['hset', pk, uid, val];
                                ncmds.push(temp);
                            }else{
                                RedisUtil.hdel(pk, uid, function (err, res) {
                                    if (err) {
                                        console.log('---删除失败！', pk, uid);
                                    }
                                });
                            }
                            let IT_CFG = item_item_cfg[itemId];
                            if (IT_CFG) {
                                let infos = clear[k];
                                let itc = 0;
                                for (var i = 0; i < infos.length; i ++) {
                                    let tf = infos[i];
                                    let num = tf[1]; //该时间获得的数量
                                    itc += num;
                                }
                                let tp = curPackage[IT_CFG.type];
                                if (tp) {
                                    tp[itemId] -= itc;
                                    if (tp[itemId] < 0) {
                                        tp[itemId] = 0;
                                    }
                                    isDone = true;
                                }
                            }
                        }
                        if (isDone) {
                            //重写背包
                            CacheAccount.setPack(uid, curPackage);
                        }
                        if (ncmds.length > 0) {
                            RedisUtil.multi(ncmds, function (err, result) {
                                if (err) {
                                    console.log('限时道具过期筛选结果批量写入失败！');
                                }
                            });
                        }
                    }
                    //返回查询结果
                    cb && cb(ret);
                }else{
                    cb && cb(null);
                }
            }
        });
    }else{
        cb && cb(null);
    }
};

/**
 * 限时剩余时间，非限时道具返回-1，0标识已过期，>0 即剩余时间，单位毫秒;-2时间戳有误;-3不存在
 */
exports.getLimitLeft = function (uid, itemId, gotAt, cb) {
    let left = _getItemLimitLeft(itemId, gotAt);
    if (left < 0) {
        cb && cb(left);
        return;
    }
    let pk = LIMIT_ITEM_HK + itemId;
    RedisUtil.hget(pk, uid, function (err, ret) {
        if (ret) {
            ret = JSON.parse(ret);
            let isExist = false;
            if (ret && ret.length > 0) {
                for (var i = 0; i < ret.length; i ++) {
                    let td = ret[i];
                    if (td[0] == gotAt) {
                        isExist = true;
                        break;
                    }
                }
            }
            if (isExist) {
                cb && cb(left);
            }else{
                cb && cb(-3);
            }
        }else{
            cb && cb(0);
        }
    });  
};

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.update = update;

//// FOR TEST
exports.rewardProbabilityItems = _rewardProbabilityItems;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 账户数据更新(每日任务完成度).
 */
function update(pool, data, cb, account) {
    const FUNC = TAG + "update() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");

    var package_param = data['package'];
        
    // 使用物品
    if (package_param.use) {
        if (DEBUG) console.log("使用物品");
        _use(pool,package_param, account, cb);
    }
    else {
        if (DEBUG) console.log("替换背包的全部数据");
        _replace(pool,package_param, account, cb);
    }
}


function _checkSkinExist(mySkin, skin_id) {

    if(mySkin.equip == skin_id){
        return true;
    }

    for(let i = 0; i< mySkin.own.length; ++i){
        if(mySkin.own[i] == skin_id){
            return true;
        }
    }

    return false;

}


//==============================================================================
// private
//==============================================================================

//todo:linyng
// function _use(pool, cb, account_id, token, used_item, pack, my_account) {
function _use(pool,used_item, account, cb) {
    const FUNC = TAG + "_use() --- ";

    if (StringUtil.isString(used_item)) {
        used_item = ObjUtil.str2Data(used_item);
    }

    let item_id = used_item.id;
    let cost = used_item.cost;
    let total = used_item.total;
    let itemGotAt = used_item.gotAt;

    let pack = account.package;

    console.log(pack);

    
    // if (DEBUG) console.log(FUNC + 'pack:', pack);
    if (DEBUG) console.log(FUNC + 'used_item:', used_item);
    if (DEBUG) console.log(FUNC + 'item_id:', item_id);
    if (DEBUG) console.log(FUNC + 'total:', total);

    if (!pack) {
        var err_info = "服务器记录的背包数据为空";
        if (ERROR) console.error(err_info);
        cb(new Error(err_info));
        return;
    }

    var item_info = item_item_cfg[item_id];
    if (item_info && item_info.saleprice > 0) {
        console.log(FUNC + "item_info:", item_info);
        // 出售物品(技能除外, 技能出售在dao_skill中进行处理)
        sellItem(pool, cost, item_id, item_info, account, cb);
    }
    else {

        //道具兑换皮肤
        let item_type = item_info.type;
        if(item_type === ItemType.SKIN){
            let itemList = pack[ItemTypeC.SKIN];
            if (!itemList[item_id]) {
                errNotEnough(cost, 0, cb);
                return;
            }

            let mySkin = account.weapon_skin;
            let skin_id = item_info.dropid;
            if (_checkSkinExist(mySkin, skin_id)){
                //如果存在，则写入相应的碎片，增加对应碎片数量，扣除道具数量

                //写入皮肤碎片信息
                let skin_info = newweapon_weapons_cfg[skin_id];
                let piece_info = skin_info.piece;

                console.log(FUNC + "--------------------1.piece_info:", piece_info);
                if (!pack[ItemTypeC.SKIN_DEBRIS]) {
                    pack[ItemTypeC.SKIN_DEBRIS] = {};
                }
                if (!pack[ItemTypeC.SKIN_DEBRIS][piece_info[0]]) {
                    pack[ItemTypeC.SKIN_DEBRIS][piece_info[0]] = 0;
                }
                pack[ItemTypeC.SKIN_DEBRIS][piece_info[0]] += piece_info[1];

            }
            else {
                //如果不存在,则增加一款皮肤，扣除相应道具数量
                // console.log(FUNC + "skin_id:", skin_id);
                // console.log(FUNC + "--------------------1.mySkin:", mySkin);
                mySkin.own.push(parseInt(skin_id));
                // console.log(FUNC + "--------------------2.mySkin:", mySkin);
                CacheAccount.setWeaponSkin(account, mySkin);
            }

            pack[item_type][item_id] -= 1;

            account.package = pack;
            account.commit();
            console.log(FUNC + "返回客户端用户数据");
            cb && cb(null, [account]);
            return;
        }

        let itemList = pack[ItemTypeC.GIFT];
        if (!itemList[item_id]) {
            errNotEnough(cost, 0, cb);
            return;
        }

        for (var itemKey in itemList) {
            if (itemKey == item_id) {
                
                // 处理对应id的物品
                var count = itemList[itemKey];
                if (count < cost) {
                    errNotEnough(cost, count, cb);
                    return;
                }
                if (count - cost != total) {
                    var err_info = "物品数据不匹配：" + count + " - " + cost + " != " + total;
                    if (ERROR) console.error(err_info);
                }
                // 以count - cost为准
                itemList[itemKey] = count - cost;
                pack['7'] = itemList;
                // 处理使用物品后的效果
                let doneFunc = function () {
                    _afterUse(pool, account, item_id, cost, function (err, results) {
                        if (err) {
                            if (DEBUG) console.log('[ERROR] package._afterUse()');
                            if (DEBUG) console.log(JSON.stringify(err));
                            cb(err);
                        } else {
                            account.package = pack;
                            account.commit();

                            _replace(pool, account, cb);
                        }
                    });
                };
                //使用成功，若是限时道具，则及时剔除
                let ltype = item_info.lengthtype;
                if (ltype === 1 || ltype === 2) {
                    _clearLimitItem(account.id, item_id, itemGotAt, cost, function () {
                        doneFunc();
                    });
                }else{
                    doneFunc();
                }
                break;
            }
        }
    }
}

/**
 * 出售物品.
 * @param cost 出售物品的个数.
 * @param item_id 出售物品的ID, 用于验证玩家物品是否足够和改变背包数据.
 * @param item_info 物品信息, 直接传入减少一次查表操作.
 * @param my_account 玩家信息.
 */
// function sellItem(pool, uid, cost, item_id, item_info, my_account, cb) {
function sellItem(pool, cost, item_id, item_info, account, cb) {
    const FUNC = TAG + "sellItem() --- ";

    // 验证物品是否足够
    var item_type = item_info.type;
    var item_i_have = account.package['' + item_type][item_id];
    if (cost > item_i_have) {
        errNotEnough(cost, item_i_have, cb);
        return;
    }

    var total_sell_price = item_info.saleprice * cost;
    if (DEBUG) console.log(FUNC + "总售价——total_sell_price:", total_sell_price);
    if (DEBUG) console.log(FUNC + "当前玩家拥有金币数量——current account gold:", account.gold);
    
    if (DEBUG) console.log(FUNC + "使用前package:", account.package);

    account.package['' + item_type][item_id] -= cost;
    account.package = account.package;
    //越南版：背包出售获得钻石不是金币
    //account.gold = total_sell_price;
    // // yDONE: 金币数据记录(售出物品增加金币总量)
    // logGold.push({
    //     account_id: account.id,
    //     log_at: new Date(),
    //     gain: total_sell_price,
    //     cost: 0,
    //     duration: 0,
    //     total: account.gold,
    //     scene: SCENE.SELL,
    //     nickname: 0,
    //     level: account.level,
    // });

    account.pearl += total_sell_price;

    logDiamond.push({
        account_id: account.id,
        log_at: new Date(),
        gain: total_sell_price,
        cost: 0,
        total: account.pearl,
        scene: SCENE.SELL,
        nickname: 0,
    });

    if (DEBUG) console.log(FUNC + "使用后package:", account.package);

    account.commit();
    cb(null, [account]);
}

function errNotEnough(cost, count, cb) {
    var err_info = "物品数量不够，需要使用" + cost + "个，实际拥有" + count + "个";
    if (ERROR) console.error(err_info);
    cb(new Error(err_info));
}
// pool, account, item_id, cost,
function _afterUse(pool, account, item_id, cost, cb) {
    const FUNC = TAG + "_afterUse() --- ";
    
    var item_info = item_item_cfg[item_id];
    
    var reward = [];
    while (cost-- > 0) {
        var droplist = drop_droplist_cfg[item_info.dropid].drop_id;
        var probability = drop_droplist_cfg[item_info.dropid].probability;
        
        // 需要根据probability的不同获取物品
        var drop_reward = _rewardProbabilityItems(droplist, probability);
        
        if (drop_reward == null) {
            drop_reward = [];
        }
        for (var i = 0; i < drop_reward.length; i++) {
            var drop_key = drop_reward[i];
            var drop_info = BuzzUtil.getDropInfoFromDropKey(drop_key);
            
            if (DEBUG) console.log(FUNC + "drop_key:", drop_key);
            if (DEBUG) console.log(FUNC + "drop_info:", drop_info);

            // 需要处理有概率掉落的物品使用
            if (drop_info.item_probability.length > 1) {
                var drop_list = [[drop_key]];
                var ret = BuzzUtil.checkDrop(account, drop_list);
                if (DEBUG) console.log(FUNC + "ret:", ret);

                if (ret != 0 && ret.length > 0) {
                    reward.push([drop_info.item_id, drop_info.item_num]);
                }
            }
            else {
                reward.push([drop_info.item_id, drop_info.item_num]);
            }
        }
    }
    reward = _sortReward(reward);
    if (DEBUG) console.log(FUNC + "reward:", reward);
    
    DaoReward.getReward(pool, account, reward, function (err, results) {
        if (DEBUG) console.log(FUNC + "err:", err);
        if (DEBUG) console.log(FUNC + "results:", results);
        cb(err, results);

        // yDONE: 金币数据记录(使用某些特殊物品后获得金币)
        let gain = 0;
        for (let i = 0; i < reward.length; i++) {
            if ('i001' == reward[i][0]) {
                gain = reward[i][1];
            }
        }
        if (gain > 0) {
            logGold.push({
                account_id: account.id,
                log_at: new Date(),
                gain: gain,
                cost: 0,
                duration: 0,
                total: account.gold,
                scene: SCENE.USE,
                nickname: 0,
                level: account.level,
            });
        }

    });
}

/**
 * 将冗余的奖品获得进行整理, 同样的都放在一个数组元素中.
 */
function _sortReward(input) {
    var output = [];
    var temp = {};
    for (var i = 0; i < input.length; i++) {
        var one_reward = input[i];
        var id = one_reward[0];
        var count = one_reward[1];
        if (!temp[id]) {
            temp[id] = count;
        }
        else {
            temp[id] += count;
        }
    }
    for (var idx in temp) {
        output.push([idx, temp[idx]]);
    }
    return output;
}

/**
 * 获取一个随机物品.
 */
function _rewardProbabilityItems(droplist, probability) {
    const FUNC = TAG + "_rewardProbabilityItems() --- ";

    var total = 0;
    for (var i = 0; i < probability.length; i++) {
        total += probability[i];
    }
    if (DEBUG) console.log(FUNC + "total:", total);

    var random = utils.randomInt(total);
    if (DEBUG) console.log(FUNC + "random:", random);
    
    total = 0;
    var idx = 0;
    for (var i = 0; i < probability.length; i++) {
        total += probability[i];
        if (total >= random) {
            idx = i;
            break;
        }
    }
    if (DEBUG) console.log(FUNC + "reward:", droplist[idx]);
    return droplist[idx];
}

function _replace(pool, account, cb) {
    const FUNC = TAG + "_replace() --- ";
    //--------------------------------------------------------------------------
    // 更新缓存中的数据(重要:数据库操作将会被删除)
    //--------------------------------------------------------------------------
    account.package = account.package;
    account.commit();
    //--------------------------------------------------------------------------
    cb(null, [account]);
}
