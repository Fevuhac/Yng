/**
 * 使用金币购买月卡
 */
let data_util = require('./data_util');
let DaoCommon = require('../../src/dao/dao_common');
let CacheAccount = require('../../src/buzz/cache/CacheAccount');
let GameLog = require('../../src/log/GameLog');
let shop_card_cfg = require('../../cfgs/shop_card_cfg');
let common_log_const_cfg = require('../../cfgs/common_log_const_cfg');
let DateUtil = require('../../src/utils/DateUtil');
let BuzzUtil = require('../../src/utils/BuzzUtil');

let CARD_DATA = {};
for (let i = 0; i < shop_card_cfg.length; i++) {
    let cfg = shop_card_cfg[i];
    CARD_DATA[cfg.id] = cfg;
}

class MonthCard {

    constructor() {

    }

    done(req, res) {
        const FUNC = "MonthCard:done --- ";
        const HINT = "金币购买月卡";

        let aes = req.body.aes;
        let dataObj = data_util.parseDataObj(req, HINT);
        BuzzUtil.cacheLinkDataApi(dataObj, "buy_month_card");

        let token = dataObj.token;
        let itemId = dataObj.itemId;
        let cardCfg = CARD_DATA[itemId];
        if (!cardCfg) {
            data_util.handleReturn(res, aes, '月卡配置有误', null, HINT);
            return;
        }
        let cType = itemId === 100 ? 'normal' : 'senior';
        DaoCommon.checkAccount(req.pool, token, function (error, account) {
            if (error) {
                data_util.handleReturn(res, aes, error, null, HINT);
                return;
            }
            let cost = cardCfg.price;
            let gainPearl = cardCfg.diamond;
            account.gold = -cost;//注意：gold是增量，正增加，负消耗
            account.pearl += gainPearl;
            account.cost = cost;//其他消耗 月卡消耗累加
            account.commit();

            //金币//钻石日志
            let itemList = [
                {
                    item_id: 'i001',
                    item_num: -cost,
                },
                {
                    item_id: 'i002',
                    item_num: gainPearl,
                }
            ];
            GameLog.addGameLog(itemList, account, common_log_const_cfg.CARD, HINT);

            //获得月卡
            let newCard = account.card;
            if (!newCard[cType]) {
                newCard[cType] = {};
            }
            newCard[cType].start_date = DateUtil.format(new Date(), 'yyyy-MM-dd');
            CacheAccount.setCard(account, newCard, function (chs) {
                let change = {
                    gold: account.gold,
                    pearl: account.pearl,
                };
                if (chs && chs.length == 2) {
                    let charmPoint = chs[0];
                    let charmRank = chs[1];
                    charmPoint >= 0 && (change.charm_point = charmPoint);
                    charmRank >= 0 && (change.charm_rank = charmRank);
                }
                let result = {
                    change: change,
                    card: newCard,
                    get_card: {
                        normal: false,
                        senior: false,
                    },
                };
                data_util.handleReturn(res, aes, null, result, HINT);
            });
        }.bind(this));


        //修改用户数据、保存
        //回调给客户端
        //---------------------------------
    }

}

module.exports = MonthCard;