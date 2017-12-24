/**
 * 打赏
 * Created by zhenghang on 2017/9/8.
 */
var BuzzUtil = require('../utils/BuzzUtil');
var DaoCommon = require('../dao/dao_common');
var dao_reward = require('../dao/dao_reward');
var DateUtil = require('../utils/DateUtil');
var RedisUtil = require('../utils/RedisUtil');
var CharmUtil = require('../utils/CharmUtil');
const async = require('async');
const redisSync = require('./redisSync');

var CacheAccount = require('./cache/CacheAccount');
var DaoAccountCommon = require('../dao/account/common');
var buzz_mail = require('./buzz_mail');
var buzz_charts = require('./buzz_charts');
var buzz_cst_game = require('./cst/buzz_cst_game');
var CstError = require('./cst/buzz_cst_error');
var buzz_receive_flower = require('./buzz_receive_flower');
var ERROR_OBJ = CstError.ERROR_OBJ;
var REDIS_KEYS = require('./cst/buzz_cst_redis_keys').REDIS_KEYS,
    CHANNEL = REDIS_KEYS.CHANNEL,
    MSG = REDIS_KEYS.MSG;

const shop_shop_buy_type_cfg = require('../../cfgs/shop_shop_buy_type_cfg');
const i18n = require('../../cfgs/string_strings_cfg');
const lan = 'cn';
exports.give_reward = give_reward;

var DEBUG = 1;
var TAG = "【buzz_reward_people】";

function give_reward(req, dataObj, cb) {
    const FUNC = TAG + "give_reward() --- ";
    if (!lPrepare(dataObj)) return;
    //BuzzUtil.cacheLinkDataApi(dataObj, "give_reward");

    _give_reward(req, dataObj, cb);

    function lPrepare(input) {
        return BuzzUtil.checkParams(input, ['token', 'items', 'id'], "buzz_reward_people", cb);
    }
}

function _give_reward(req, dataObj, cb) {
    const FUNC = TAG + "_give_reward() --- ";
    if (DEBUG) console.log(FUNC + "CALL...");
    let token = dataObj.token;
    let needitem = dataObj.items;
    let id = dataObj.id;
    if (id == token.split("_")[0]) {
        cb(i18n.REWARD_SELF[lan]);
        return;
    }
    let pool = req.pool;
    let itemid = needitem[0][0];
    let itemcount = needitem[0][1];
    //获取中文名
    let name = BuzzUtil.getCNName(BuzzUtil.getItemById(itemid).name);
    if (DEBUG) console.log("dataObj", dataObj);

    //检查物品是否可以打赏
    if (!BuzzUtil.isCanGiveItem(needitem)) {
        cb(ERROR_OBJ.PARAM_MISSING);
        return;
    }

    async.waterfall([function (cb) {
            DaoCommon.checkAccount(pool, token, cb);
        }, function (account, cb) {
            if (BuzzUtil.getVipGiveItem(account.vip) != 1) {
                cb(ERROR_OBJ.VIP_NOT_ENOUFH);
                return;
            }
            RedisUtil.hget(MSG.IS_REWARD_PEOPLE, account.id, function (err, rows) {
                cb(err, rows, account);
            });
        }, function (rows, account, cb) {
            rows = rows && JSON.parse(rows) || {};
            if (rows[id + "_" + itemid + "_" + itemcount] == 1) {
                cb(ERROR_OBJ.CHAT_REWARD_ERROR);
                return;
            }
            costRewardPeople(req, account, needitem, true, function (cost_info) {
                if (cost_info == 1 || cost_info == 2) {
                    cb(ERROR_OBJ.CHAT_REWARD_LESS_ERROR);
                    return;
                }
                cb(null, rows, account, cost_info);
            });
        }, function (rows, account, cost_info, cb) {

            var nick = account.channel_account_name;
            if (!nick || nick=="") nick = account.nickname;
            if (!nick || nick=="") nick = account.tempname;
            //将i400修改为i410
            var sendMailItem = [[itemid == 'i400' ? 'i410' : itemid, itemcount]];
            var need = JSON.stringify(sendMailItem);
            var data = {
                player_list: "" + id,
                type: 3,
                title: i18n.FRIEND_REWARD[lan],
                content: nick + i18n.FRIEND_REWARD_TXT[lan] + name + " x " + itemcount,
                reward: need
            };
            buzz_mail.sendMail(req, data, function (err, res) {
                cb(err, rows, account, cost_info, sendMailItem);
            });
        }, function (rows, account, cost_info, sendMailItem, cb) {
            var val = id + "_" + itemid + "_" + itemcount;
            rows[val] = 1;
            RedisUtil.hset(MSG.IS_REWARD_PEOPLE, account.id, JSON.stringify(rows));
            RedisUtil.expire(MSG.IS_REWARD_PEOPLE, DateUtil.getNexyDayBySeconds());
            redisSync.getAccountById(id, function (err, res) {
                //统计收到鲜花
                buzz_receive_flower.flower_receive(id, sendMailItem, function (currentTotal) {
                    buzz_charts.updateRankFlower(res.platform, res.id, currentTotal);
                    //根据鲜花变化数量变化魅力值
                    CacheAccount.setCharmPointWithGivenFlower(res, currentTotal);
                });
                if (BuzzUtil.isNotice(needitem)) {
                    cb(err, res, account, cost_info);
                } else {
                    cb(null, null, account, cost_info);
                }
            });

        }, function (res, account, cost_info, cb) {
            if (res) {
                var nick1 = res.nickname;
                //参数顺序是：打赏人名字，物品name，物品数量，被打赏人名字，vip,  魅力等级
                var nick = account.channel_account_name;
                if (!nick || nick=="") nick = account.nickname;
                if (!nick || nick=="") nick = account.tempname;
                var params = [nick, name, itemcount, nick1, account.vip, account.charm_rank];
                var content = {
                    type: buzz_cst_game.GAME_EVENT_TYPE.REWARD_PEOPLE,
                    txt: "",
                    times: 1,
                    params: params,
                    platform: account.platform,
                    uid:account.id
                };
                buzz_cst_game.addBroadcastGameEvent(content);
            }
            cb(null, account, cost_info);
        }], function (err, account, cost_info) {
            if (err) {
                cb(err);
                return;
            }
            var change = BuzzUtil.getChange(account, cost_info);
            var ret = {
                //item_list: item_list,
                change: change
            };
            cb(null, ret);
        }
    );

}

function costRewardPeople(req, account, needitem, is_cost_coin, cb) {
    const FUNC = TAG + "costRewardPeople() --- ";
    //判断是否足够
    if (dao_reward.enough(account, needitem)) {
        //物品扣除
        var item_list = [{
            item_id: needitem[0][0],
            item_num: needitem[0][1]
        }];
        BuzzUtil.removeFromPack(req, account, item_list, cb);
    }
    //判断是否使用游戏币购买道具打赏
    else if (is_cost_coin) {
        var cost = BuzzUtil.rewardPeopleCostByDiamonds(needitem);
        let coinType = shop_shop_buy_type_cfg.REWARD_PEOPLE.name;
        let coinId = shop_shop_buy_type_cfg.REWARD_PEOPLE.id;
        if (cost && dao_reward.enough(account, [[coinId, cost]])) {
            var item_list = [{
                item_id: coinId,
                item_num: cost
            }];
            BuzzUtil.removeFromPack(req, account, item_list, cb);
        } else {
            //钻石不足，返回
            cb(1);
        }
    }
    //物品不足，返回
    else {
        cb(2);
    }
}