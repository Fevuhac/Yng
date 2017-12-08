////////////////////////////////////////////////////////////
// Pay Related
////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================

//------------------------------------------------------------------------------
// 工具
//------------------------------------------------------------------------------
var _ = require('underscore');
var utils = require('./utils');
var CommonUtil = require('./CommonUtil');
var DateUtil = require('../utils/DateUtil');
var ObjUtil = require('./ObjUtil');
var StringUtil = require('../utils/StringUtil');
var ArrayUtil = require('../utils/ArrayUtil');
var BuzzUtil = require('../utils/BuzzUtil');
var CstError = require('./cst/buzz_cst_error');
var GameLog = require('../log/GameLog');

//------------------------------------------------------------------------------
// 对象(POJO)
//------------------------------------------------------------------------------
var Reward = require('./pojo/Reward');

//------------------------------------------------------------------------------
// 业务
//------------------------------------------------------------------------------
var buzz_cst_sdk = require('./cst/buzz_cst_sdk');
var CHANNEL_ID = buzz_cst_sdk.CHANNEL_ID;
var buzz_call_sdk_api = require('./buzz_call_sdk_api');
var buzz_sdk_tencent = require('./sdk/tencent');
//var buzz_sdk_egret = require('./sdk/egret');

//------------------------------------------------------------------------------
// DAO
//------------------------------------------------------------------------------
var DaoCommon = require('../dao/dao_common');
var dao_gold = require('../dao/dao_gold');

//------------------------------------------------------------------------------
// 缓存
//------------------------------------------------------------------------------
var CacheAccount = require('./cache/CacheAccount');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var ITEM_TYPE = require('../../cfgs/shop_itemtype_const_cfg');
var common_log_const_cfg = require('../../cfgs/common_log_const_cfg');
var shop_shop_buy_type_cfg = require('../../cfgs/shop_shop_buy_type_cfg');

//==============================================================================
// const
//==============================================================================

const ERROR_CODE = CstError.ERROR_CODE;
const ERROR_OBJ = CstError.ERROR_OBJ;

var DEBUG = 0;
var ERROR = 1;

var TAG = "【buzz_pay】";

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.buy = buy;
exports.VietnamPay = VietnamPay;
exports.getGameOrder = getGameOrder;

exports.sig = sig;
exports.sort = sort;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
let payChannel = {
    TEST: 1000, //测试支付
    QQ: 1001, //qq支付
    WECHAT: 1002, //微信支付
    YUENAN_CARD: 1003, //越南卡支付
    ALIPAY: 1004, //支付宝
};

let pro = {
    payChannel: 1003,
    token: '',
    payData: {
        cardCode: '29356495346552', //卡号
        cardSerial: '36330400022120', //卡序列号
        cardType: 'vnp' //卡类型（运营商）
    }
}

let card_Type = {
    1:'viettel',
    2:'vms',
    3:'vnp'
}

var change_change_cfg = require('../../cfgs/change_change_cfg');

function getCardTypeInfo(cardType_id) {
    for (var idx in change_change_cfg) {
        var record = change_change_cfg[idx];
        if (Number(record.type2) == Number(cardType_id)) {
            return record;
        }
    }
    return null;
}

const VietnamPay1 = require('./sdk/VietnamPay');

/**
 * 越南卡支付
 * @param {*} req_client 
 * @param {*} data 
 * @param {*} cb 
 */
function VietnamPay(req_client, data, cb) {
    const FUNC = 'VietnamPay--------------- ';
    let payData = data.payData;
    let cardCode = payData.cardCode;
    let cardSerial = payData.cardSerial;
    let cardTypeInfo = getCardTypeInfo(payData.cardType);

    let cardType = cardTypeInfo.business;
    let token = data.token;
    let uid = token.split("_")[0];

    CacheAccount.getAccountById(uid, function (err, account) {
        if (err || !account) {
            cb(ERROR_OBJ.UID_INVALID);
            return;
        }

        data["itemid"] = payChannel.YUENAN_CARD;
        getGameOrder(req_client, data, function (err, game_order) {
            if (err) {
                console.log('订单生成失败');
                cb(ERROR_OBJ.ORDER_CREATE_FAIL);
                return;
            }
            let game_order_id = game_order.game_order_id;
            VietnamPay1.useCard(cardCode, cardSerial, cardType,account.id.toString() + account.nickname, function (err, amount) {
                if (err) {
                    console.log('-----------------支付异常：', err);
                    cb(err);
                    return;
                }

                console.log('-----------------支付成功卡余额：', amount);

                account.recharge = amount;
                //TODO: 生成订单信息
                let shop_gold = BuzzUtil.getShopGoldByAmount(amount);
                let succ_chunk = {};

                if (!shop_gold) {
                    succ_chunk = {
                        code: -1,
                        message: '面额异常',
                        game_order_id:game_order_id //给客户端返回game_order_id
                    }

                    var cdata = {
                        channel: payChannel.YUENAN_CARD,
                        channel_cb: succ_chunk,
                        game_order_id: game_order_id,
                        goods_id: channelItemId, // 平台道具ID
                        goods_number: 1, // 购买数量总是为1
                        channel_account_id: data.openid,
                        money: shop_gold.item,
                    };
                    req_client.dao.setOrderFail(cdata, function (err, results) {
                        cb(null, succ_chunk);
                    });
    
                    return;
                }

                // 购买成功, 记录到数据库.
                console.log(FUNC + "购买成功, 记录到数据库");
                console.log(FUNC + "succ_chunk:", succ_chunk);
                /**
                    chunk: {
                    code: 0,
                    subcode: 0,
                    message: '',
                    default: 0,
                    data: [ { billno: '-8957_A500009_1_1490345431_45919313', cost: 2 } ] }
                    */
                // 一个积分是0.1元
                var cdata = {
                    channel: cardType,
                    channel_cb: {
                        orderId: cardCode,
                        id: account.openid,
                        money: shop_gold.price, //价格: 元
                        goodsId: shop_gold.id, // 平台道具ID
                        goodsNumber: 1, // 购买数量总是为1
                    },
                    game_order_id: game_order_id
                };

                req_client.dao.changeOrderStatus(cdata, function (err, results) {
                    buySuccess(req_client, account, uid, token, shop_gold.id, game_order_id, function (err, item_info) {
                        if (err) {
                            cb(err);
                            return;
                        }
                        var ret = ObjUtil.merge(succ_chunk, item_info);

                        // account.gold = shop_gold.item;
                        // account.commit();

                        cb(null, ret);
                    });
                });    
            });

        });
    })
}
/**
 * 支付
 */
function buy(req_client, data, cb) {
    const FUNC = TAG + "buy() --- ";

    // 1. 参数验证
    if (!_prepare(data, cb)) return;
    
    var token = data["token"];
    var uid = token.split("_")[0];
    var channelid = data["channelid"];
    var itemid = data["itemid"];
    var itemtype = data["itemtype"];
    var channelItemId = itemid;

    CacheAccount.getAccountById(uid, function (err, account) {
        switch (channelid) {
            case CHANNEL_ID.WANBA:
                var zoneid = data.zoneid ? data.zoneid : 1;// 默认值
                channelItemId = buzz_sdk_tencent.getFunId(itemid, itemtype, zoneid);
                break;
        }
        data["itemid"] = channelItemId;
        data["id"] = itemid;

        console.log(FUNC + "itemid:", itemid);
        console.log(FUNC + "itemtype:", itemtype);
        console.log(FUNC + "玩吧配置的道具ID:", data.itemid);

        // 2. 订单生成
        getGameOrder(req_client, data, function (err, ret){
            if (err) {
                cb(err);
                return;
            }
            if (ret == null) {
                // cb(new Error("订单生成失败"));
                cb(ERROR_OBJ.ORDER_CREATE_FAIL);
                return;
            }
            var game_order_id = ret.game_order_id;
            // 3. 第三方接口调用
            _callBuyApi(data, req_client, function (err, succ_chunk) {
                // 假数据: 可以跳过向支付服的请求
                // succ_chunk = {
                //     code:0,
                //     data:[
                //         {cost:1,billno:"test001"}
                //     ]
                // };
                // err = null;
                if (err) {
                    err.game_order_id = game_order_id;
                    console.log(FUNC + "购买失败, 记录到数据库, 可能是openid不合法");
                    cb(err);
                    return;
                }

                succ_chunk.game_order_id = game_order_id;//给客户端返回game_order_id
                if (succ_chunk.code != 0) {
                    console.log(FUNC + "购买失败, 记录到数据库");

                    // 购买失败, 记录到数据库.
                    var cdata = {
                        channel: channelid,
                        channel_cb: succ_chunk,
                        game_order_id: game_order_id,
                        goods_id: channelItemId,// 平台道具ID
                        goods_number: 1,// 购买数量总是为1
                        channel_account_id: data.openid,
                        money: 0,
                    };
                    req_client.dao.setOrderFail(cdata, function (err, results) {
                        cb(null, succ_chunk);
                    });
                }
                else {
                    // 购买成功, 记录到数据库.
                    console.log(FUNC + "购买成功, 记录到数据库");
                    console.log(FUNC + "succ_chunk:", succ_chunk);
                    /**
                     chunk: {
code: 0,
subcode: 0,
message: '',
default: 0,
data: [ { billno: '-8957_A500009_1_1490345431_45919313', cost: 2 } ] }
                     */
                        // 一个积分是0.1元
                    var money = succ_chunk.data[0].cost;
                    var billno = succ_chunk.data[0].billno;

                    var cdata = {
                        channel: channelid,
                        channel_cb: {
                            orderId: billno,
                            id: data.openid,
                            money: money, //价格: 元
                            goodsId: channelItemId,// 平台道具ID
                            goodsNumber: 1,// 购买数量总是为1
                        },
                        game_order_id: game_order_id
                    };

                    req_client.dao.changeOrderStatus(cdata, function (err, results) {
                        buySuccess(req_client, account, uid, token, itemid, game_order_id, function(err, item_info) {
                            if (err) {
                                cb(err);
                                return;
                            }
                            var ret = ObjUtil.merge(succ_chunk, item_info);
                            cb(null, ret);
                        });
                    });
                }
            });
        });
    });


}

/**
 * 获取订单号
 */
function getGameOrder(req, dataObj, cb) {

    const FUNC = TAG + "equip() --- ";
    //----------------------------------
    if (dataObj.itemid) {
        dataObj.id = dataObj.itemid;
    }
    if (!lPrepare(dataObj)) return;
    BuzzUtil.cacheLinkDataApi(dataObj, "get_game_order");

    _getGameOrder(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'id'], "buzz_pay", cb);
    }

    // req_client.dao.getGameOrder(data, function (err, game_order_id) {
    //     if (err) {
    //         console.error("获取玩家订单失败");
    //         cb(err);
    //         return;
    //     }
    //     console.log("获取玩家订单成功");
    //     cb(null, game_order_id);
    // });
}

function _getGameOrder(req, dataObj, cb) {
    const FUNC = TAG + "_getGameOrder() --- ";
    var uid = dataObj.uid;
    var token = dataObj.token;
    var shop_id = dataObj.id;
    var test = dataObj.test;
    var pool = req.pool;
    console.log(FUNC + "test:", test);

    DaoCommon.checkAccount(pool, token, function(error, account) {
        if (error) {
            cb(error);
            return;
        }
        doNextWithAccount(account);
    });

    function doNextWithAccount(account) {
        req.dao.getGameOrder(dataObj, function (err, game_order_id) {
            if (err) {
                console.error("获取玩家订单失败");
                cb(err);
                return;
            }
            console.log("获取玩家订单成功");

            if (test) {
                buySuccess(req, account, uid, token, shop_id, game_order_id, cb);
            }
            else {
                console.log(FUNC + "game_order_id:", game_order_id);
                var ret = {game_order_id: game_order_id};
                cb(null, ret);
            }
        });
    }
}

/**
 * 购买成功, 调用此方法获取物品
 */
function buySuccess(req, account, uid, token, shop_id, game_order_id, cb) {
    const FUNC = TAG + "buySuccess() --- ";
    var item_type = ITEM_TYPE.IT_PEARL;
    var item_amount = 0;
    var total = 0;
    var item_list = [];
    var pool = req.pool;

    if (shop_id < 100) {
        var shop_pearl = BuzzUtil.getShopPearlById(shop_id);
        if (null == shop_pearl) {
            cb(ERROR_OBJ.BUY_WRONG_SHOP_ID);
            return;
        }

        item_type = ITEM_TYPE.IT_PEARL;
        total = account.pearl;
        item_amount = shop_pearl.item;

        // first_buy判定进行首次充值的双倍发放.
        var first_buy = account.first_buy;
        if (first_buy["" + shop_id] == undefined) {
            first_buy["" + shop_id] = 0;
        }
        if (first_buy["" + shop_id] == 0) {
            // 玩家为首次购买
            item_amount *= 2;
            first_buy["" + shop_id] = 1;
        }

        total += item_amount;

        // yDONE: 取出对象操作后赋值给原数据.
        account.first_buy = first_buy;

        item_list = [{
            item_id: shop_shop_buy_type_cfg.BUY_RMB.id,
            item_num: item_amount,
        }];

        // first_buy_gift需要设置
    }
    else if (shop_id >= 100 && shop_id < 1000) {
        var shop_card = BuzzUtil.getShopCardById(shop_id);
        if (null == shop_card) {
            cb(ERROR_OBJ.BUY_WRONG_SHOP_ID);
            return;
        }

        item_type = ITEM_TYPE.IT_CARD;
        total = account.pearl;
        item_list = [{
            item_id: "i002",
            item_num: shop_card.diamond,
        }];
        item_amount = 1;//shop_card.diamond;
        total += shop_card.diamond;
    }
    else if (shop_id >= 1000 && shop_id < 10000) {
        var shop_fund = BuzzUtil.getShopFundById(shop_id);
        if (null == shop_fund) {
            cb(ERROR_OBJ.BUY_WRONG_SHOP_ID);
            return;
        }
        let accountComeback = ObjUtil.str2Data(account.comeback);
        var cb_id = accountComeback['cb_id'];
        if (cb_id) {
            cb(ERROR_OBJ.BUY_FUND_ALREADY);
            return;
        }

        var hitrate = shop_fund.hitrate;
        accountComeback.cb_id = shop_id;
        accountComeback.hitrate = hitrate;

        item_type = ITEM_TYPE.IT_FUND;
        total = account.gold;
        item_list = [{
            item_id: "i001",
            item_num: shop_fund.gold,
        }];
        item_amount = shop_fund.gold;
        total += shop_fund.gold;
        account.comeback = accountComeback;
        account.commit();
    }
    else if (shop_id >= 10000) {
        var shop_gift = BuzzUtil.getShopGiftById(shop_id);
        if (null == shop_gift) {
            cb(ERROR_OBJ.BUY_WRONG_SHOP_ID);
            return;
        }

        var cur_time = new Date().getTime();
        var start_time = new Date(shop_gift.starttime).getTime();
        var end_time = new Date(shop_gift.endtime).getTime();
        if (cur_time < start_time || cur_time > end_time) {
            cb(ERROR_OBJ.BUY_WRONG_GIFT_TIME);
            return;
        }

        var buycount = shop_gift.buycount;
        let activityGift = account.activity_gift;
        if (activityGift["" + shop_id] == undefined) {
            activityGift["" + shop_id] = {
                buycount: 0,
                version: 1,
            };
        }
        var my_buycount = activityGift["" + shop_id].buycount;
        if (my_buycount >= buycount) {
            cb(ERROR_OBJ.BUY_GIFT_COUNT_MAX);
            return;
        }
        var shop_gift_reward = shop_gift.item;
        item_type = ITEM_TYPE.IT_GIFT;
        if (shop_gift_reward && shop_gift_reward.length > 0) {
            item_list = BuzzUtil.getItemList(shop_gift_reward);
        }else{
            cb && cb(ERROR_OBJ.BUY_GIFT_CFG_ERR);
            return;
        }
        item_amount = shop_gift_reward;
        activityGift["" + shop_id].buycount += 1;
        // yDONE: 取出activity_gift再赋值回原数据
        account.activity_gift  = activityGift;
    }

    var log_data = {
        account_id: uid,
        token: token,
        item_id: shop_id,
        item_type: item_type,
        item_amount: item_amount,
        total: total,
        game_order_id: game_order_id,
    };


    console.log(FUNC + 'account.vip:', account.vip);
    console.log(FUNC + 'account.rmb:', account.rmb);

    req.dao.addShopLog(log_data, account, function(err, _account) {
        if (err) {
            cb(err);
            return;
        }

        let account = _account[0];

        account.commit();

        console.log('----result--DD---charmPoint = ');
        // 注意: addShopLog已经将购买的物品放入背包, 无需调用BuzzUtil.puIntoPack()
        var change = BuzzUtil.getChangeFromItemList(account, item_list);
        if (DEBUG) console.log(FUNC + "change1:", change);
        change.vip = account.vip;
        change.rmb = account.rmb;
        change.vip_gift = account.vip_gift;
        change.vip_daily_reward = account.vip_daily_reward;
        change.card = account.card;
        change.get_card = account.get_card;
        change.first_buy = account.first_buy;
        change.activity_gift = account.activity_gift;
        change.gold_shopping = account.gold_shopping;
        change.charm_point = account.charm_point;
        change.charm_rank = account.charm_rank;
        change.comeback = account.comeback;

        if (DEBUG) console.log(FUNC + "change2:", change);
        var ret = {
            game_order_id: game_order_id,
            item_list: item_list,
            change: change,
            itemId: shop_id,
            itemType: item_type,
        };
        cb(null, ret);

        let scene = common_log_const_cfg.TIMEGIFT_BUY;
        if (ITEM_TYPE.IT_FUND == item_type) scene = common_log_const_cfg.FUND_BUY;
        if (ITEM_TYPE.IT_PEARL == item_type) scene = common_log_const_cfg.STORE;
        if (ITEM_TYPE.IT_CARD == item_type) scene = common_log_const_cfg.BUY_CARD;
        let hint = '商城购买时获取';

        // yDONE: 金币数据记录
        var gain = 0;
        for (var i = 0; i < item_list.length; i++) {
            var item = item_list[i];
            var item_id = item.item_id;
            var item_num = item.item_num;
            if ('i001' == item_id) {
                gain += item_num;
            }
        }
        if (gain > 0) {
            GameLog.addGameLog(item_list, account, scene, hint);
        }

        // yDONE: 钻石数据记录
        var diamondGain = 0;
        for (var i = 0; i < item_list.length; i++) {
            var item = item_list[i];
            var item_id = item.item_id;
            var item_num = item.item_num;
            if ('i002' == item_id) {
                diamondGain += item_num;
            }
        }
        if (diamondGain > 0) {
            GameLog.addGameLog(item_list, account, scene, hint);
        }
    });
}

//==============================================================================
// private
//==============================================================================

function _prepare(data, cb) {
    const FUNC = TAG + "_prepare() --- ";

    if (DEBUG) console.log(FUNC + "data:", data);

    var channelid = data["channelid"];
    var itemid = data["itemid"];
    var itemtype = data["itemtype"];
    var openid = data["openid"];
    var openkey = data["openkey"];
    var zoneid = data["zoneid"];

    
    if (!CommonUtil.isParamExist("buzz_pay", channelid, "接口调用请传参数channelid(渠道ID, 用于选择渠道参数)", cb)) return false;
    if (!CommonUtil.isParamExist("buzz_pay", itemid, "接口调用请传参数itemid(物品ID, 玩吧需要映射到平台道具ID)", cb)) return false;
    if (!CommonUtil.isParamExist("buzz_pay", itemtype, "接口调用请传参数itemtype(物品类型, 决定了需要查找的配置表)", cb)) return false;
    if (channelid == buzz_cst_sdk.CHANNEL_ID.WANBA) {
        if (!CommonUtil.isParamExist("buzz_pay", openid, "接口调用请传参数openid(玩家在平台的唯一标识)", cb)) return false;
        if (!CommonUtil.isParamExist("buzz_pay", openkey, "接口调用请传参数openkey(玩家身份验证)", cb)) return false;
        if (!CommonUtil.isParamExist("buzz_pay", zoneid, "接口调用请传参数zoneid(Android-1, iOS-2)", cb)) return false;
    }
    else {
        // do nothing
    }
    
    return true;

}

function _callBuyApi(data, req_client, cb) {

    var channelid = data["channelid"];

    if (channelid == buzz_cst_sdk.CHANNEL_ID.WANBA) {
        //_callBuyApi_buy_playzone_item(data, req_client, cb);
        buzz_sdk_tencent.callBuyApi(data, req_client, cb);
    }
    else {
        // do nothing
    }
}

function sig(data, path) {
    
    buzz_sdk_tencent.sig(data, path);
}

/**
 * 输入: {key2:value2, key1:value1}
 * 输出: [[key1, value1], [key2, value2]]
 */
function sort(data) {

    // 对象转数组(_.pairs)
    // 数组排序(_.sortBy)
    return _.sortBy(_.pairs(data), function (item) {
        return item[0];
    });

}

