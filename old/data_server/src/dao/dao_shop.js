////////////////////////////////////////////////////////////
// Shop Data Related
// 商城数据
////////////////////////////////////////////////////////////
var _ = require('underscore');
var utils = require('../buzz/utils');
var StringUtil = require('../utils/StringUtil');
var BuzzUtil = require('../utils/BuzzUtil');
var CacheAccount = require('../buzz/cache/CacheAccount');
//var CstError = require('../buzz/cst/buzz_cst_error');

var AccountCommon = require('./account/common');

var DateUtil = require('../utils/DateUtil');
var RedisUtil = require('../utils/RedisUtil');
var DaoUtil = require('./dao_utils');
var DaoCommon = require('./dao_common');
var DaoAccount = require('./dao_account');
var DaoMail = require('./dao_mail');
var ITEM_TYPE = require('../../cfgs/shop_itemtype_const_cfg');
var shop_shop_buy_type_cfg = require('../../cfgs/shop_shop_buy_type_cfg');
var buzz_cst_sdk = require('../buzz/cst/buzz_cst_sdk');
var sdk_egret = require('../buzz/sdk/egret');
var dao_reward = require('./dao_reward');

var DEBUG = 0;
var ERROR = 1;

var TAG = "【dao_shop】";

var MAIL_TYPE = DaoMail.MAIL_TYPE;

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getGameOrder = _getGameOrder;
exports.checkOrderStatus = _checkOrderStatus;
exports.changeOrderStatus = _changeOrderStatus;
exports.setOrderFail = setOrderFail;

exports.addShopLog = addShopLog;


//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 获取订单.
 */
function _getGameOrder(pool, data, cb) {
    //var account_id = data['account_id'];
    var token = data['token'];

    // 错误检验
    //if (account_id == null) {
    //    cb(new Error('接口调用请传参数account_id(玩家ID)'));
    //    return;
    //}
    if (token == null) {
        console.error("接口调用请传参数token");
        cb(new Error('接口调用请传参数token'));
        return;
    }
    
    // 检查账户的合法性
    DaoCommon.checkAccount(pool, token, function (err, account) {
        if (err) {
            cb(err);
            return;
        }
            
        _didGetGameOrder(pool, data, cb);
    });
}

// 查询当日最大序列号(sn), 并在此基础上+1作为新的序列号(订单号是日期字符串加上序列号，有唯一性约束)
function _didGetGameOrder(pool, data, cb) {
    
    var token = data['token'];
    var shop_id = data['id'];
    var uid = token.split("_")[0];
    
    var sql = '';
    sql += 'SELECT MAX(`sn`) AS max_sn ';
    sql += 'FROM `tbl_order` ';
    sql += 'WHERE TO_DAYS(NOW()) = TO_DAYS(`created_at`)';

    var sql_data = [];

    console.log('sql: ', sql);
    console.log('sql_data: ', sql_data);
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log('[ERROR] dao_shop._didGetGameOrder()');
            console.log(JSON.stringify(err));
            cb(err);
        } else {
            console.log('result: ', result);
            
            var sn = 0;
            
            // 今日有订单
            if (result.length > 0) {
                sn = result[0]["max_sn"] + 1;
            }
            console.log("sn: " + sn);

            _insertOrder(pool, uid, shop_id, sn, cb);

        }
    });
}

// 在tbl_order表中插入一条订单数据
function _insertOrder(pool, uid, shop_id, sn, cb) {
    const FUNC = TAG + "_insertOrder() --- ";
    var game_order_id = BuzzUtil.getOrderId(sn);

    var sql = '';
    sql += 'INSERT INTO `tbl_order` ';
    sql += '(`game_account_id`, `sn`, `game_order_id`) ';
    sql += 'VALUES (?,?,?)';
    var sql_data = [uid, sn, game_order_id];

    console.log(FUNC + 'sql:\n', sql);
    console.log(FUNC + 'sql_data:\n', sql_data);
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log(FUNC + '[ERROR] err:\n', err);
            cb(err);
        } else {
            console.log(FUNC + 'game_order_id:', game_order_id);
            cb(null, game_order_id);
        }
    });
}

/**
 * 检测订单状态
 */
function _checkOrderStatus(pool, data, cb) {
    // var account_id = data['account_id'];
    var token = data['token'];
    var game_order_id = data['game_order_id'];
    
    // 错误检验
    // if (account_id == null) {
    //     cb(new Error('接口调用请传参数account_id(玩家ID)'));
    //     return;
    // }
    if (token == null) {
        cb(new Error('接口调用请传参数token'));
        return;
    }
    if (game_order_id == null) {
        cb(new Error('接口调用请传参数game_order_id'));
        return;
    }
    
    // 检查账户的合法性
    DaoCommon.checkAccount(pool, token, function (err, account) {
        if (err) {
            cb(err);
            return;
        }
        
        _didCheckOrderStatus(pool, data, account, cb);
    });
}

// 参数检查完毕后进行订单状态查询
function _didCheckOrderStatus(pool, data, account, cb) {
    var token = data['token'];
    var account_id = token.split("_")[0];
    var game_order_id = data['game_order_id'];
    
    var sql = '';
    sql += 'SELECT * ';
    sql += 'FROM `tbl_order` ';
    sql += 'WHERE game_order_id=? AND game_account_id=?';
    console.log('sql: ', sql);
    
    var sql_data = [game_order_id, account_id];

    console.log('game_order_id: ', game_order_id);
    console.log('account_id: ', account_id);
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log('[ERROR] dao_shop._didCheckOrderStatus()');
            console.log(JSON.stringify(err));
            cb(err);
        } else {
            console.log('result: ', result);
            
            // 订单存在，返回订单状态
            if (result.length > 0) {
                var result = result[0];
                if (0 == result.status) {
                    var change = {};
                    change.gold = account.gold;
                    change.pearl = account.pearl;
                    change.vip = account.vip;
                    change.rmb = account.rmb;
                    change.vip_gift = account.vip_gift;
                    change.card = account.card;
                    change.get_card = account.get_card;
                    change.first_buy = account.first_buy;
                    change.activity_gift = account.activity_gift;
                    change.gold_shopping = account.gold_shopping;
                    change.comeback = account.comeback;

                    result.change = change;
                    result.itemId = result.goods_id;
                }
                cb(null, result);
            }
            // 订单不存在，返回错误信息
            else {
                var err_order_not_exist = new Error("订单不存在(订单号:" + game_order_id + ",订单账号:" + account_id + ")");
                cb(err_order_not_exist);
            }

        }
    });
}

/**
 * 改变订单状态
 */
function _changeOrderStatus(pool, data, cb) {
    var channel_cb = data['channel_cb'];
    var game_order_id = data['game_order_id'];
    
    // 错误检验
    if (channel_cb == null) {
        cb(new Error('接口调用请传参数channel_cb(渠道的回调信息)'));
        return;
    }
    if (game_order_id == null) {
        cb(new Error('接口调用请传参数game_order_id(游戏订单ID)'));
        return;
    }
        
    _didChangeOrderStatus(pool, data, cb);
}

function setOrderFail(pool, data, cb) {
    const FUNC = TAG + "setOrderFail() --- ";

    var channel_cb = data['channel_cb'];
    var game_order_id = data['game_order_id'];
    var channel = data['channel'];
    var goods_id = data['goods_id'];
    var goods_number = data['goods_number'];
    var channel_account_id = data['channel_account_id'];
    var money = data['money'];
    
    if (channel == buzz_cst_sdk.CHANNEL_ID.WANBA) {
        var sql = '';
        sql += 'UPDATE `tbl_order` ';
        sql += 'SET `status`=?, `channel_cb`=?, `channel`=?, `goods_id`=?, `goods_number`=?, `channel_account_id`=?, `money`=? ';
        sql += 'WHERE game_order_id=?';
        if (DEBUG) console.log(FUNC + 'sql: ', sql);

        var sql_data = [
            1,
            JSON.stringify(channel_cb),
            channel,
            goods_id,
            goods_number,
            channel_account_id,
            money,
            game_order_id
        ];

        pool.query(sql, sql_data, function (err, result) {
            if (err) {
                if (ERROR) console.error(FUNC + '[ERROR] err:', err);
                return;
            }
            if (DEBUG) console.log('result: ', result);
            cb(null, "ok");
            return;
        });
    }
    else {
        cb(new Error("not supported channel!!"));
    }
}

// 参数检查完毕后进行订单状态更新
function _didChangeOrderStatus(pool, data, cb) {
    const FUNC = TAG + "_didChangeOrderStatus() --- ";

    var channel_cb = data['channel_cb'];
    var game_order_id = data['game_order_id'];
    var channel = data['channel'];
    
    // 从channel_cb中获取的参数
    var channel_order_id = channel_cb.orderId;
    var channel_account_id = channel_cb.id;
    var money = channel_cb.money;
    var time = channel_cb.time;
    var serverId = channel_cb.serverId;
    var goods_id = channel_cb.goodsId;
    var goods_number = channel_cb.goodsNumber;
    var sign = channel_cb.sign;
    
    console.log(FUNC + "orderId: " + channel_order_id);
    console.log(FUNC + "id: " + channel_account_id);
    console.log(FUNC + "money: " + money);
    console.log(FUNC + "time: " + time);
    console.log(FUNC + "serverId: " + serverId);
    console.log(FUNC + "goodsId: " + goods_id);
    console.log(FUNC + "goodsNumber: " + goods_number);
    console.log(FUNC + "sign: " + sign);
    
    var sql = '';
    sql += 'UPDATE `tbl_order` ';
    sql += 'SET `status`=?, `channel_order_id`=?, `channel_account_id`=?, `goods_id`=?, `goods_number`=?, `money`=?, `channel_cb`=?, `channel`=? ';
    sql += 'WHERE game_order_id=?';
    console.log(FUNC + 'sql: ', sql);
    
    var sql_data = [
        0,
        channel_order_id,
        channel_account_id,
        goods_id,
        goods_number,
        money,
        JSON.stringify(channel_cb),
        channel,
        game_order_id
    ];
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.error(FUNC + '[ERROR] err:', err);
        } else {
            console.log(FUNC + 'result: ', result);
            cb(null, "ok");
            sdk_egret.notifyPayment(channel_account_id, channel_order_id, money/10);
        }
    });
}

/**
 * 增加一条商城流水记录
 */
function addShopLog(pool, data,account, cb) {
    const FUNC = TAG + "addShopLog() --- ";
    var account_id = data['account_id'];
    var token = data['token'];
    var item_id = data['item_id'];
    var item_type = data['item_type'];
    var item_amount = data['item_amount'];
    var total = data['total'];
    var game_order_id = data['game_order_id'];
    
    // 错误检验
    if (account_id == null) {
        cb(new Error('接口调用请传参数account_id(玩家ID)'));
        return;
    }
    if (token == null) {
        cb(new Error('接口调用请传参数token'));
        return;
    }
    if (item_id == null) {
        cb(new Error('接口调用请传参数item_id(商品ID)'));
        return;
    }
    if (item_type == null) {
        var err_msg = '接口调用请传参数item_type(商品类型';
        err_msg += ': 礼品-' + ITEM_TYPE.IT_GIFT;
        err_msg += ', 金币-' + ITEM_TYPE.IT_GOLD;
        err_msg += ', 钻石-' + ITEM_TYPE.IT_PEARL;
        err_msg += ', 月卡-' + ITEM_TYPE.IT_CARD;
        err_msg += ', 翻盘-' + ITEM_TYPE.IT_FUND;
        err_msg += ')';
        cb(new Error(err_msg));
        return;
    }
    if (item_amount == null) {
        cb(new Error('接口调用请传参数item_amount(商品数量)'));
        return;
    }
    if (total == null) {
        cb(new Error('接口调用请传参数total(当前拥有的该类商品总量，用于校验)'));
        return;
    }
    //if (game_order_id == null) {
    //    cb(new Error('接口调用请传参数game_order_id(游戏订单号, 用于和订单表进行一一对应)'));
    //    return;
    //}

    item_id = parseInt(item_id);
    item_type = parseInt(item_type);
    item_amount = parseInt(item_amount);
    total = parseInt(total);
            
    if (isNaN(item_id)) {
        cb(new Error('item_id字段请勿输入非数值'));
        return;
    }
    if (isNaN(item_type)) {
        cb(new Error('item_type字段请勿输入非数值'));
        return;
    }
    if (item_type != ITEM_TYPE.IT_GIFT) {
        // 非礼包才判断是否为数值
        if (isNaN(item_amount)) {
            cb(new Error('item_amount字段请勿输入非数值'));
            return;
        }
        if (isNaN(total)) {
            cb(new Error('total字段请勿输入非数值'));
            return;
        }
    }
    
    // 检查账户的合法性
    console.log(FUNC + "card:", account.card);
    _didAddShopLog(pool, data, account, cb);
};

// 根据传入的item_type获取配置文件的导入路径
function _getCfgPath(item_type) {
    const FUNC = TAG + "_getCfgPath() --- ";

    var cfg_path = '../../cfgs/';
    switch (item_type) {
        case ITEM_TYPE.IT_GIFT:
            console.log(FUNC + "ITEM_TYPE.IT_GIFT");
            cfg_path += 'shop_gift_cfg';
            break;
        case ITEM_TYPE.IT_GOLD:
            console.log(FUNC + "ITEM_TYPE.IT_GOLD");
            cfg_path += 'shop_gold_cfg';
            break;
        case ITEM_TYPE.IT_PEARL:
            console.log(FUNC + "ITEM_TYPE.IT_PEARL");
            cfg_path += 'shop_pearl_cfg';
            break;
        case ITEM_TYPE.IT_CARD:
            console.log(FUNC + "ITEM_TYPE.IT_CARD");
            cfg_path += 'shop_card_cfg';
            break;
        case ITEM_TYPE.IT_FUND:
            console.log(FUNC + "ITEM_TYPE.IT_FUND");
            cfg_path += 'shop_fund_cfg';
            break;
        default:
            console.log(FUNC + "item_type错误, 默认使用shop_pearl_cfg...");
            cfg_path += 'shop_pearl_cfg';
            break;
    }
    console.log(FUNC + "item_type:", item_type);
    console.log(FUNC + "cfg_path:", cfg_path);
    return cfg_path;
}

// 验证后加入一条log
function _didAddShopLog(pool, data, account, cb) {
    const FUNC = TAG + "_didAddShopLog() --- ";
    
    var nickname = (account.nickname != null);

    var account_id = data['account_id'];
    var item_id = data['item_id'];
    var item_type = data['item_type'];
    var item_amount = data['item_amount'];
    var total = data['total'];
    var game_order_id = data['game_order_id'];
    
    item_id = parseInt(item_id);
    item_type = parseInt(item_type);
    item_amount = parseInt(item_amount);
    if (isNaN(item_amount)) {
        // 组合礼包直接将此字段设置为1
        item_amount = 1;
    }
    total = parseInt(total);

    // TODO: 从shop_gold_cfg中查询对应ID的物品价格
    var price = 0;
    var cfg_list = require(_getCfgPath(item_type));
    for (var i = 0; i < cfg_list.length; i++) {
        var item = cfg_list[i];
        if (item.id == item_id) {
            price = item.price * 100;// 配置表中的单位是元，转换到数据库中使用分为单位(INT)
        }
    }
    
    var sql = '';
    sql += 'INSERT INTO `tbl_shop_log` ';
    sql += '(`account_id`,`item_id`,`item_type`,`item_amount`, `price`, `nickname`, `order_id`) ';
    sql += 'VALUES (?,?,?,?,?,?,?)';
    if (DEBUG) console.log(FUNC + 'sql: ', sql);

    var sql_data = [account_id, item_id, item_type, item_amount, price, nickname, game_order_id];
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            if (ERROR) console.error(FUNC + '[ERROR] err:\n', err);
            cb(err);
        } else {
            if (DEBUG) console.log(FUNC + 'result: ', result);

            _updateAccountRmb(pool, account_id, price, account, function (err_update_rmb, result_update_rmb, charmPoint, charmRank) {
                console.log('------DD---charmPoint = ', charmPoint, charmRank);
                if (err_update_rmb) {
                    if (DEBUG) console.log(FUNC + "err_update_rmb");
                    cb(err_update_rmb);
                    return;
                }
                if (DEBUG) console.log(FUNC + "item_type: " + item_type);
                
                if (item_type == ITEM_TYPE.IT_GIFT) {
                    _updateItem(pool, data, account, cb);
                }
                else if (item_type == ITEM_TYPE.IT_GOLD) {
                    _updateGoldTable(pool, data, account, cb);
                }
                else if (item_type == ITEM_TYPE.IT_PEARL) {
                    _updatePearlTable(pool, data, account, cb);
                    //给邀请者发邮件奖励(10%)
                    _mailMyInvitorWhenChargeSuccess(pool, data, cfg_list, account);
                }
                else if (item_type == ITEM_TYPE.IT_CARD) {
                    _updateCardData(pool, data, account, cfg_list, cb);
                }
                else if (item_type == ITEM_TYPE.IT_FUND) {
                    _updateFundData(pool, data, account, cb);
                }
                else {
                    var errInfo = "不支持的商品类型(";
                    errInfo += "礼品-" + ITEM_TYPE.IT_GIFT;
                    errInfo += "|金币-" + ITEM_TYPE.IT_GOLD;
                    errInfo += "|珍珠-" + ITEM_TYPE.IT_PEARL;
                    errInfo += "|月卡-" + ITEM_TYPE.IT_CARD;
                    errInfo += "|翻盘-" + ITEM_TYPE.IT_FUND;
                    errInfo += ")";
                    if (DEBUG) console.log(FUNC + errInfo);
                    cb(new Error(errInfo));
                }
            });
        }
    });
};

/**
 * 当我充值成功时, 向我的邀请者发送一封奖励邮件(10%我充值的钻石数).
 * @param data 可获取uid, item_id
 */
function _mailMyInvitorWhenChargeSuccess(pool, data, shop_pearl_cfg, account) {
    const FUNC = TAG + "_mailMyInvitorWhenChargeSuccess() --- ";
    var preDebug = DEBUG;
    DEBUG = 0;// 开启方法级别的DEBUG输出.
    //--------------------------------------------------------------------------

    if (account.who_invite_me != 0) {
        var who_invite_me = account.who_invite_me;
        var uid = data['account_id'];
        var item_id = data['item_id'];

        var item = getItemFromShopCfg(item_id, shop_pearl_cfg);
        if (item) {
            var pearl_num = item.item;
            var pearl_num_mail = pearl_num / 10;
            // 向who_invite_me发送邮件.
            if (DEBUG) console.log("向玩家" + who_invite_me + "发送奖励邮件");

            data = {
                title: "奖励邮件",
                content: "你的好友充值" + pearl_num + "钻, 你作为邀请者获得奖励" + pearl_num_mail + "钻",
                reward: '[["i002",' + pearl_num_mail + ']]',
                type: MAIL_TYPE.SPECIFY,
                player_list: "" + who_invite_me,
            };
            DaoMail.sendMail(pool, data, function(err, result) {
                if (DEBUG) console.log(FUNC + "err:", err);
                if (DEBUG) console.log(FUNC + "result:", result);
                DEBUG = preDebug;
            });
        }
        else {
            DEBUG = preDebug;
        }
    }
    else {
        if (DEBUG) console.log("没有邀请者, 什么都不用做");
        DEBUG = preDebug;
    }
}

/**
 * 查询shop表中的元素.
 */
function getItemFromShopCfg(item_id, cfg) {
    for (var idx in cfg) {
        var item = cfg[idx];
        if (item.id == item_id) {
            return item;
        }
    }
    return null;
}

// 更新tbl_account中的rmb字段
function _updateAccountRmb(pool, uid, price, account, cb) {
    const FUNC = TAG + "_updateAccountRmb() --- ";
    if (DEBUG) console.log(FUNC + "price:", price);

    var vip_vip_cfg = require('../../cfgs/vip_vip_cfg');
    
    _getAccountRmb(pool, uid, function (err_get_rmb, result_get_rmb) {
        if (err_get_rmb) {
            return;
        }
        
        var prev_vip = 0;
        var prev_rmb = 0;
        var prev_pfft = null;
        if (result_get_rmb.length > 0) {
            prev_vip = result_get_rmb[0].vip;
            prev_rmb = result_get_rmb[0].rmb;
            prev_pfft = result_get_rmb[0].pfft_at;
        }
        
        var curr_rmb = prev_rmb + price;
        var curr_vip = prev_vip;
        for (let key in vip_vip_cfg) {
            var value = vip_vip_cfg[key];
            if (value.vip_unlock * 100 <= curr_rmb) {
                curr_vip = value.vip_level;
            }
        }
        if (DEBUG) console.log("-------------------------------------");
        if (DEBUG) console.log("curr_vip: " + curr_vip);

        //--------------------------------------------------------------------------
        // 更新缓存中的数据(重要:数据库操作将会被删除)
        //--------------------------------------------------------------------------
        CacheAccount.setRmb(account, curr_rmb);

        var sql = '';
        sql += 'UPDATE `tbl_account` ';
        sql += 'SET `rmb`=?, `vip`=? ';
        if (curr_vip > prev_vip) {
            account.vip_daily_reward = 0;
            account.commit();
            sql += ',`vip_daily_reward`=0 ';
        }
        if (prev_pfft == null) {
            sql += ', `pfft_at`=NOW() ';
        }
        sql += 'WHERE `id`=?';

        var sql_data = [curr_rmb, curr_vip, uid];

        if (DEBUG) console.log('sql: ', sql);
        if (DEBUG) console.log('sql_data: ', sql_data);

        pool.query(sql, sql_data, function (err, result) {
            if (err) {
                if (ERROR) console.error(FUNC + '[ERROR] err:', err);
            }

            // CacheAccount调用更新active字段
            // -_-b没有把分换算成钻(100分=10钻)
            CacheAccount.updateActiveCharge(account, price / 10);

            var cpoint = -1;
            var crank = -1;
            CacheAccount.setVip(account, curr_vip, function (chs) {
                if (chs && chs.length == 2) {
                    chs[0] != null && chs[0] >= 0 && (cpoint = chs[0]);
                    chs[1] != null && chs[1] >= 0 && (crank = chs[1]);
                }
                cb(err, result, cpoint, crank);    
            });
        });
    });
}

function _getAccountRmb(pool, uid, cb) {
    var sql = '';
    sql += 'SELECT `vip`, `rmb`, `pfft_at` ';
    sql += 'FROM `tbl_account` ';
    sql += 'WHERE `id`=?';
    console.log('sql: ', sql);
    
    var sql_data = [uid];
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.log('[ERROR] dao_shop._getAccountRmb()');
            console.log(JSON.stringify(err));
        }
        cb(err, result);
    });
}

/**
 * 更新限时礼包，注意礼包内容可包含金币、钻石、技能等
 */
function _updateItem(pool, data, account, cb) {
    const FUNC = TAG + "_updateItem() --- ";
    var account_id = data['account_id'];
    var item_amount = data['item_amount'];
    if (account && item_amount && item_amount.length > 0) {
        dao_reward.getReward(pool, account, item_amount, function(err, result) {
            if (err) {
                console.log(FUNC + " err:\n", err);
                return;
            }
            cb(null, [account]);
        });
    }else{
        console.log(FUNC + '商城限时礼包数据有误，无法更新缓存数据.');
    }

    
}

// 更新tbl_gold表中的current_total, shop_count, shop_amount字段
function _updateGoldTable(pool, data, account, cb) {
    const FUNC = TAG + "_updateGoldTable() --- ";
    var uid = data['account_id'];
    var item_id = data['item_id'];
    var item_type = data['item_type'];
    var item_amount = data['item_amount'];
    var total = data['total'];
    
    item_id = parseInt(item_id);
    item_type = parseInt(item_type);
    item_amount = parseInt(item_amount);
    total = parseInt(total);
    if (DEBUG) console.log(FUNC + "total: " + total);

    //--------------------------------------------------------------------------
    // 更新缓存中的数据(重要:数据库操作将会被删除)
    //--------------------------------------------------------------------------
    let inc_gold = total - account.gold;
    if(inc_gold > 0){
        account.gold = inc_gold;	
    }

    //--------------------------------------------------------------------------
    
    var sql = '';
    sql += 'UPDATE `tbl_account` a, `tbl_gold` g ';
    sql += 'SET g.`current_total`=?, g.`shop_count`=`shop_count`+1, g.`shop_amount`=`shop_amount`+?, a.`gold`=? ';
    sql += 'WHERE g.`account_id`=? AND a.`id`=?';
    var sql_data = [total, item_amount, total, uid, uid];
    
    if (DEBUG) console.log(FUNC + 'sql: ', sql);
    if (DEBUG) console.log(FUNC + 'sql_data: ', sql_data);
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            if (ERROR) console.error(FUNC + 'err:', err);
            cb(err);
        } else {
            if (DEBUG) console.log(FUNC + 'gold result: ', result);
            // DONE: 需要返回用户数据更新客户端界面
            cb(null, [account]);
        }
    });
}

// 更新tbl_pearl表中的current_total, shop_count, shop_amount字段
function _updatePearlTable(pool, data, account, cb) {
    const FUNC = TAG + "_updatePearlTable() --- ";

    var item_amount = data['item_amount'];
    item_amount = parseInt(item_amount);

    let coinId = shop_shop_buy_type_cfg.BUY_RMB.id;
    BuzzUtil.addCoin(account, coinId, item_amount, function(err, res) {
        cb(null, [account]);
    });
}

// 更新tbl_account的card字段以及common_const_cfg中配置的月卡获取物品
function _updateCardData(pool, data, account, cfg_list, cb) {
    const FUNC = TAG + "_updateCardData() --- ";
    if (DEBUG) console.log(FUNC + "CALL ...");

    var account_id = data['account_id'];
    var item_id = data['item_id'];

    item_id = parseInt(item_id);
    var start_date = DateUtil.format(new Date(), 'yyyy-MM-dd');    
    if (DEBUG) console.log(FUNC + "start_date = " + start_date);
    
    // 普通月卡
    if (item_id == 100) {
        if (DEBUG) console.log(FUNC + "CALL _updateNormalCard()");
        _updateNormalCard(pool, data, account, cb, start_date, cfg_list[0]);
    }
    else if (item_id == 101) {
        if (DEBUG) console.log(FUNC + "CALL _updateSeniorCard");
        _updateSeniorCard(pool, data, account, cb, start_date, cfg_list[1]);
    }
    else {
        // TODO: 不支持的月卡类型，错误提示
        var err_msg = '[ERROR] dao_shop._updateCardData(): 不支持的月卡类型'
        if (ERROR) console.error(err_msg);
        cb(err_msg);
    }
    // TODO
}

function _updateFundData(pool, data, account, cb) {
    var total = data['total'];
    account.gold = total;
    account.commit();
    cb(null, [account]);
}

// 更新tbl_account中的card.normal以及common_const_cfg中配置的普通月卡获取物品
function _updateNormalCard(pool, data,account, cb, start_date, update_items) {
    _updateCardCommon(pool, data,account, cb, start_date, update_items, "normal");
}

// 更新tbl_account中的card.senior以及common_const_cfg中配置的壕月卡获取物品
function _updateSeniorCard(pool, data, account, cb, start_date, update_items) {
    _updateCardCommon(pool, data, account, cb, start_date, update_items, "senior");
}

function _updateCardCommon(pool, data, account, cb, start_date, update_items, card_type) {
    const FUNC = TAG + "_updateCardCommon() --- ";

    if (DEBUG) console.log(FUNC + "dao_shop._update_" + card_type + "Card()");
    var uid = data['account_id'];
    // 数据库中已有对应的月卡信息，判断上次购买的月卡日期是否还有效
    if (AccountCommon.isCardValid(card_type)) {
        // 玩家已经购买月卡且月卡还在有效期内，报错返回.
        var err_msg = '[ERROR] 玩家已经购买月卡且月卡还在有效期内，请月卡到期后再购买';
        if (ERROR) console.error(FUNC + err_msg);
        cb(err_msg);
        return;
    }

    var accOldCard = account.card;
    var newCard = {};
    accOldCard.normal && (newCard.normal = accOldCard.normal);
    accOldCard.senior && (newCard.senior = accOldCard.senior);
    newCard[card_type] = { "start_date": start_date };
    
    //获取cfg_list中需要更新的物品
    if (DEBUG) console.log(FUNC + 'update_items: ', update_items);
    var diamond = update_items["diamond"];
    
    //--------------------------------------------------------------------------
    // 更新缓存中的数据(重要:数据库操作将会被删除)
    //--------------------------------------------------------------------------
    account.pearl += diamond;

    CacheAccount.setCard(account, newCard);
    //--------------------------------------------------------------------------
    
    var sql = '';
    sql += 'UPDATE `tbl_account` a, `tbl_pearl` p ';
    sql += 'SET p.`current_total`=p.`current_total`+?, p.`shop_count`=p.`shop_count`+1, p.`shop_amount`=p.`shop_amount`+?, ';
    sql += 'a.`pearl`=a.`pearl`+?, a.`card`=? ';
    sql += 'WHERE a.`id`=?';
    var sql_data = [diamond, diamond, diamond, JSON.stringify(newCard), uid];
    
    if (DEBUG) console.log(FUNC + "sql: ", sql);
    if (DEBUG) console.log(FUNC + "sql_data: ", sql_data);
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            if (ERROR) console.error(FUNC + "[ERROR] dao_shop._update_" + card_type + "Card(), err:", err);
            cb(err);
        } else {
            if (DEBUG) console.log(FUNC + "pearl result: ", result);
            // DONT_NEED: 在tbl_pearl_log中加入记录
            // 不是购买得到的钻石不加入log表中
            cb(null, [account]);
        }
    });
}
