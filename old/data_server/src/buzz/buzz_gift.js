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
var ObjUtil = require('./ObjUtil');
var StringUtil = require('../utils/StringUtil');
var ArrayUtil = require('../utils/ArrayUtil');
var CstError = require('./cst/buzz_cst_error');
var CacheAccount = require('./cache/CacheAccount');
var Item = require('./pojo/Item');

var _ = require('underscore');
var buzz_account = require('./buzz_account');
var buzz_reward = require('./buzz_reward');
var dao_reward = require('../dao/dao_reward');
var account_common = require('../dao/account/common');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var daily_dailypast_cfg = require('../../cfgs/daily_dailypast_cfg');// 每日任务领取礼包的配置

//==============================================================================
// const
//==============================================================================

const ERROR_CODE = CstError.ERROR_CODE;
const ERROR_OBJ = CstError.ERROR_OBJ;

const ItemTypeC = Item.ItemTypeC;

var DEBUG = 0;
var ERROR = 1;

const TAG = "【buzz_gift】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getAdvGift = getAdvGift;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 获取初始化的女神数据
 */
function getAdvGift(req, data, cb) {
    const FUNC = TAG + "getAdvGift() --- ";

    if (DEBUG) console.info(FUNC + "CALL function");

    if (!_prepare(data, cb)) return;

    var token = data.token;
    var gift_id = data.giftid;
    var gift_info = getGiftInfoFromId(gift_id);
    var reward = [gift_info.reward];

    // 验证账户
    buzz_account.check(req, data, function(err, account) {

        if (err) {
            console.error(FUNC + "err:", err);
            cb(err);
            return;
        }

        console.log(FUNC + "day_reward_adv:", account.day_reward_adv);
        if (account.day_reward_adv) {
            console.error(FUNC + "玩家已经领取了今日礼包");
            cb(ERROR_OBJ.GIFT_ADV_GOTTEN);
            return;
        }

        var uid = account.id;

        if (gift_id == 910) {
            if (!account.new_reward_adv) {
                // 领取奖励
                buzz_reward.getReward(req, account, gift_info.reward, function(err, results) {

                    // 获取奖励成功
                    if (DEBUG) console.info(FUNC + "获取新手奖励成功");

                    var data = {
                        table: "tbl_account",
                        field: "new_reward_adv",
                        value: 1,
                        id: uid,
                    };
                    // 设置day_reward_adv为已经领取(1)
                    req.dao.setField(data, function(err, results) {
                        CacheAccount.setNewRewardAdv(uid, 1);
                        // 返回获取到的物品
                        // 获取玩家全部数据并返回
                        buzz_account.getAccountByToken(req, token, function(err, account) {
                            var ret = {
                                gold: account.gold,
                                pearl: account.pearl,
                                package: account.package,
                                skill: account.skill,
                            };
                            cb(null, ret);
                        });
                    });

                });
            }
            else {
                cb({code:1111111, msg:"你已经领取过新手礼包了"});
            }
        }
        else {
            // console.log(FUNC + "account:", account);
            // 领取奖励
            buzz_reward.getReward(req, account, reward, function(err, results) {

                // 获取奖励成功
                if (DEBUG) console.info(FUNC + "获取奖励成功");

                var data = {
                    table: "tbl_account",
                    field: "day_reward_adv",
                    value: 1,
                    id: uid,
                };
                // 设置day_reward_adv为已经领取(1)
                req.dao.setField(data, function(err, results) {
                    CacheAccount.setDayRewardAdv(uid, 1);
                    // 返回获取到的物品
                    // 获取玩家全部数据并返回
                    buzz_account.getAccountByToken(req, token, function(err, account) {
                        var ret = {
                            gold: account.gold,
                            pearl: account.pearl,
                            package: account.package,
                            skill: account.skill,
                        };
                        cb(null, ret);
                    });
                });

            });
        }
    })
}


//==============================================================================
// private
//==============================================================================

function _prepare(data, cb) {
    
    var token = data['token'];
    var giftid = data['giftid'];
    
    if (DEBUG) console.log("token:", token);
    if (DEBUG) console.log("giftid:", giftid);

    if (!CommonUtil.isParamExist("buzz_gift", token, "接口调用请传参数token", cb)) return false;
    if (!CommonUtil.isParamExist("buzz_gift", giftid, "接口调用请传参数giftid(广告礼包ID)", cb)) return false;
    
    return true;

}

function getGiftInfoFromId(id) {
    for(var idx in daily_dailypast_cfg) {
        if (daily_dailypast_cfg[idx].id == id) {
            return daily_dailypast_cfg[idx];
        }
    }
}
