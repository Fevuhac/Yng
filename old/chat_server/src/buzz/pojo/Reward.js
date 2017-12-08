////////////////////////////////////////
// Reward
// 奖励对象
//--------------------------------------
// 如何使用
// var Reward = require('src/buzz/pojo/Reward');
// var reward = new Reward(list);
// reward.func(obj, params...);
////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// POJO对象
//------------------------------------------------------------------------------
var Item = require('./Item').Item;
var ItemType = require('./Item').ItemType;

//------------------------------------------------------------------------------
// utils
//------------------------------------------------------------------------------
//var StringUtil = require('../utils/StringUtil');

//------------------------------------------------------------------------------
// configs
//------------------------------------------------------------------------------
var item_item_cfg = require('../../../cfgs/item_item_cfg');


//==============================================================================
// constant
//==============================================================================
var ERROR = 1;
var DEBUG = 0;

const IDX_ID = 0;
const IDX_NUM = 1;


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
module.exports = Reward;// 奖励对象

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
//----------------------------------------------------------
// Reward
//----------------------------------------------------------
/**
 * 初始化话获得的奖励, 转换ID(特别是skill)
 * @param list 数组对象, 奖励配置.
 */
function Reward(list) {
    // ---- 储存原始奖励字段
    this.list = list;
    
    // ---- 储存解析后的奖励
    this.gold = 0;      // 金币
    this.pearl = 0;     // 钻石
    this.active_point = 0;   // 活跃值
    this.achieve_point = 0;   // 成就点
    this.skill = {};    // 技能
    this.gift = {};     // 礼包
    this.debris = {};   // 碎片
    this.tokens = {};   // 代币
    this.mix = {};      // 合成道具
    
    // ---- 解析奖励
    for (var i in this.list) {
        var item = this.list[i];
        
        var item_id = item[IDX_ID];
        var itemInfo = item_item_cfg[item_id];

        if (DEBUG) console.log("i:", i);
        if (DEBUG) console.log("item:", item);
        if (DEBUG) console.log("item_id:", item_id);
        if (DEBUG) console.log("itemInfo:", itemInfo);

        if (itemInfo) {
            if (DEBUG) console.log("item_type:", itemInfo.type);
            switch (itemInfo.type) {
                case ItemType.GOLD:
                    this.gold = this.gold + item[IDX_NUM];
                    break;

                case ItemType.PEARL:
                    this.pearl = this.pearl + item[IDX_NUM];
                    break;

                case ItemType.SPECIAL:
                    if ("i102" == item_id) {
                        console.log("获得了活跃值-item_id:", item_id);
                        this.active_point = this.active_point + item[IDX_NUM];
                    }
                    if ("i103" == item_id) {
                        console.log("获得了成就点-item_id:", item_id);
                        this.achieve_point = this.achieve_point + item[IDX_NUM];
                    }
                    break;

                case ItemType.SKILL:
                    createOrAdd(this.skill, "" + itemInfo.id, item[IDX_NUM]);
                    break;

                case ItemType.GIFT:
                    createOrAdd(this.gift, item_id, item[IDX_NUM]);
                    break;

                case ItemType.DEBRIS:
                    createOrAdd(this.debris, item_id, item[IDX_NUM]);
                    break;

                case ItemType.TOKENS:
                    createOrAdd(this.tokens, item_id, item[IDX_NUM]);
                    break;

                case ItemType.MIX:
                    createOrAdd(this.mix, item_id, item[IDX_NUM]);
                    break;
            }
        }
        else {
            if (ERROR) console.error("错误的物品, 物品信息如下:");
            if (ERROR) console.error("----item:", item);
            if (ERROR) console.error("----item_id:", item_id);
            if (ERROR) console.error("----itemInfo:", itemInfo);
        }
    }
}

/**
 * 验证对象obj是否包含某个属性key, 没有则创建并赋值num, 有的话则在原值上加num.
 * @param obj 操作对象.
 * @param key 验证的属性名.
 * @param num 属性的加值.
 */
function createOrAdd(obj, key, num) {
    if (obj[key] == null) {
        obj[key] = num;
    }
    else {
        obj[key] = obj[key] + num;
    }
}