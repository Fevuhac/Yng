////////////////////////////////////////////////////////////
// Aquarium Related
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------
var utils = require('./utils');
var CommonUtil = require('./CommonUtil');
var DateUtil = require('../utils/DateUtil');
var BuzzUtil = require('../utils/BuzzUtil');
var ObjUtil = require('./ObjUtil');
var StringUtil = require('../utils/StringUtil');
var ArrayUtil = require('../utils/ArrayUtil');
var CstError = require('./cst/buzz_cst_error');
var CacheAccount = require('./cache/CacheAccount');

var _ = require('underscore');
var buzz_account = require('./buzz_account');
var account_common = require('../dao/account/common');

var shop_card_cfg = require('../../cfgs/shop_card_cfg');
var common_log_const_cfg = require('../../cfgs/common_log_const_cfg');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------

//==============================================================================
// const
//==============================================================================

const ERROR_CODE = CstError.ERROR_CODE;
const ERROR_OBJ = CstError.ERROR_OBJ;

var DEBUG = 0;
var ERROR = 1;

const TAG = "【buzz_update】";

const UPDATE_TYPE = {
    LEVEL_AND_EXP: 0,// 更新玩家经验值和等级
    LEVEL_MISSION: 1,// 更新玩家关卡数据
    MISSION_DAILY_RESET: 2,// 更新每日会重置的任务完成状态
    MISSION_ONLY_ONCE: 3,// 更新只能进行一次的任务状态
    FIRST_BUY: 4,// 更新玩家各档次首充状态
    ACTIVITY_GIFT: 5,// 更新活动礼包购买状态
    HEART_BEAT: 6,// 更新心跳
    ACHIEVE_POINT: 7,// 更新成就点
    GOLD_SHOPPING: 8,// 每日购买金币的次数
    WEAPON_SKIN: 9,// 武器皮肤
    BONUS: 10,// 奖金
    DROP: 11,// 掉落物品更新
    COMEBACK: 12,// 翻盘基金购买
    VIP_GIFT: 13,// VIP礼包购买情况
    WEAPON_ENERGY: 14,// 武器充能记录
    PIRATE: 15,// 海盗任务
    GET_CARD: 16,// 月卡每日领取
    FIRST_BUY_GIFT: 17,// 首充大礼包是否已经领取
    PACKAGE: 18,// 玩家的背包数据
    ALL: 19,// 在退出游戏场景时调用，一次更新所有必要的数据
    GUIDE: 20,// 记录玩家是否完成了新手教学任务
    ACTIVE: 21,// 更新玩家的活动任务数据(传差量)
    ROIPCT_TIME: 22,// 更新玩家的ROIPCT_TIME
    DEFEND_GODDESS: 23,// 更新玩家的守卫女神数据
};


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.updateAccount = updateAccount;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 获取初始化的女神数据
 */
function updateAccount(req, data, cb) {
    const FUNC = TAG + "updateAccount() --- ";
    if (DEBUG) console.DEBUG(FUNC + "CALL...");
    //----------------------------------

    if (!_prepare(data, cb)) return;

    var token = data['token'];
    var type = data['type'];

    buzz_account.getAccountByToken(req, token, function (err, account) {
        if (err) {
            cb(err);
        }
        else {
            // req.dao.updateAccount(data, account, function (err, results) {
            //     cb(err, results);
            // });
            // 仅新版走以下的逻辑
            if (UPDATE_TYPE.GET_CARD == type) {
                _updateGetCard(req, data, cb, account);
            }
            else {
                req.dao.updateAccount(data, account, function (err, results) {
                    cb(err, results);
                });
            }
        }
    });
}


//==============================================================================
// private
//==============================================================================

function _prepare(data, cb) {

    var token = data['token'];
    var type = data['type'];

    if (DEBUG) console.log("token:", token);

    if (!CommonUtil.isParamExist("buzz_update", token, "接口调用请传参数token, 更新类型:" + type, cb)) {
        if (ERROR) console.error("接口调用请传参数token, 更新类型:", type);
        return false;
    }

    return true;

}

function _updateGetCard(req, data, cb, account) {
    var FUNC = TAG + "_updateGetCard() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");

    var uid = data['account_id'];
    var token = data['token'];
    var get_card_new = ObjUtil.str2Data(data['get_card']);
    var get_card_old = ObjUtil.str2Data(account['get_card']);
    var card = ObjUtil.str2Data(account['card']);

    console.log(FUNC + "get_card_new: ", get_card_new);
    console.log(FUNC + "get_card_old: ", get_card_old);
    console.log(FUNC + "card: ", card);

    // var everyday = 0;
    let reward = [];
    let item_list = [];

    // TODO: 判断card.normal
    if (get_card_new['normal']) {// 更新的是normal
        if (card['normal']) {
            console.log(FUNC + "玩家的普通月卡有效");
            if (get_card_old['normal']) {
                var err = FUNC + '[ERROR] 玩家今天已经领取了普通月卡奖励, 请勿重复领取';
                if (ERROR) console.error(err);
                cb(err);
                return;
            }
            else {
                // 重写get_card_old
                get_card_old['normal'] = true;
                // new version: 使用[["i001", 1], ["i002", 100]]格式表示月卡领取
                reward = shop_card_cfg[0]['everyday'];
            }
        }
        else {
            var err = FUNC + '[ERROR] 玩家没有购买普通月卡';
            if (ERROR) console.error(err);
            cb(err);
            return;
        }
    }

    // TODO: 判断card.senior
    if (get_card_new['senior']) {// 更新的是senior
        console.log(FUNC + "更新玩家的壕月卡领取状态");
        console.log(FUNC + "card['senior']: ", card['senior']);
        if (card['senior']) {
            console.log(FUNC + "玩家的壕月卡有效");
            if (get_card_old['senior']) {
                var err = FUNC + '[ERROR] 玩家今天已经领取了壕月卡奖励, 请勿重复领取';
                if (ERROR) console.error(err);
                cb(err);
                return;
            }
            else {
                // 重写get_card_old
                console.log(FUNC + "领取壕月卡奖励，改变get_card字段的值");
                get_card_old['senior'] = true;
                // new version: 使用[["i001", 1], ["i002", 100]]格式表示月卡领取
                reward = shop_card_cfg[1]['everyday'];

            }
        }
        else {
            var err = FUNC + '[ERROR] 玩家没有购买壕月卡';
            if (ERROR) console.error(err);
            cb(err);
            return;
        }
    }

    get_card_old = JSON.stringify(get_card_old);

    account.get_card = get_card_old;
    account.commit();

    for (let i = 0; i < reward.length; i++) {
        let item_info = reward[i];
        item_list.push({
            item_id: item_info[0],
            item_num: item_info[1],
        });
    }

    BuzzUtil.putIntoPack(req, account, item_list, function (reward_info) {
        let change = BuzzUtil.getChange(account, reward_info);
        change.card = account.card;
        change.get_card = account.get_card;
        var ret = {
            item_list: item_list,
            change: change,
        };
        cb(null, [ret]);
        addGameLog(item_list, account, common_log_const_cfg.CARD_REWARD, '领取月卡发放的');
    });
}

/**
 * 通用方法.
 */
function addGameLog(item_list, account, scene, hint) {
    var FUNC = TAG + "addGameLog() --- ";

    console.log(FUNC + "item_list:", item_list);
    let goldGain = 0;
    let diamondGain = 0;
    let huafeiGain = 0;
    for (let i = 0; i < item_list.length; i++) {
        let item = item_list[i];
        let item_id = item.item_id;
        let item_num = item.item_num;
        if ('i001' == item_id) {
            goldGain += item_num;
        }
        if ('i002' == item_id) {
            diamondGain += item_num;
        }
        if ('i003' == item_id) {
            huafeiGain += item_num;
        }
    }
    let uid = account.id;
    if (goldGain > 0) {
        // yDONE: 金币记录日志
        console.log(FUNC + uid + hint + '金币');
        logGold.push({
            account_id: uid,
            log_at: new Date(),
            gain: goldGain,
            cost: 0,
            duration: 0,
            total: account.gold,
            scene: scene,
            nickname: 0,
            level: account.level,
        });
    }
    if (diamondGain > 0) {
        // yDONE: 钻石记录日志
        console.log(FUNC + uid + hint + '钻石');
        logDiamond.push({
            account_id: uid,
            log_at: new Date(),
            gain: diamondGain,
            cost: 0,
            total: account.pearl,
            scene: scene,
            nickname: 0,
        });
    }
    if (huafeiGain > 0) {
        // yDONE: 话费券记录日志
        console.log(FUNC + uid + hint + '话费券');
        let total = account.package['9']['i003'];
        logHuafei.push({
            uid: uid,
            gain: huafeiGain,
            cost: 0,
            total: total,
            scene: scene,
            comment: "'月卡发放话费券'",
            time: new Date(),
        });
    }
}
