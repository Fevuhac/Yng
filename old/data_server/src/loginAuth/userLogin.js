const ObjUtil = require('../buzz/ObjUtil');
const DateUtil = require('../utils/DateUtil');
var redisSync = require('../buzz/redisSync');
var utils = require('../buzz/utils');
const common = require('../dao/account/common');
var CharmUtil = require('../utils/CharmUtil');
const vip_vip_cfg=require('../../cfgs/vip_vip_cfg');

class UserLogin{
    constructor(){

    }
    /**
     * 当前月卡是否有效
     * @param card_type 月卡类型，取值为normal
     */
    _isCardValid(buyDate){
        if (buyDate) {
            let curDate = DateUtil.format(new Date(), "yyyy-MM-dd");
            let offDate = DateUtil.dateDiff(curDate, buyDate);
            return offDate < 30;
        }
        return true;
    }

    /**
     * 登录后相关数据操作
     */
    _someOptAfterLogin(account, cb){
        let id = account.id;
        let token = utils.generateSessionToken(id);
        let timeNow = (new Date()).format("yyyy-MM-dd hh:mm:ss");
        account.token = token;
        account.updated_at = timeNow;
        account.last_online_time = timeNow;

        //月卡是否过期、魅力值变化
        let card = account.card;
        let oldCard = ObjUtil.clone(card);
        let cp = account.charm_point;
        if (card.normal && !this._isCardValid(card.normal.start_date)) {
            delete card.normal;
        }
        if (card.senior && !this._isCardValid(card.senior.start_date)) {
            delete card.senior;
        }
        account.card = card;

        //补足vip
        let vip = account.vip;
        if (vip > 0 && account.vip_daily_fill == 1) {
            var vip_info = null;
            for (let i in vip_vip_cfg) {
                if (vip_vip_cfg[i].vip_level == vip) {
                    vip_info = vip_vip_cfg[i];
                    break;
                }
            }
            if (vip_info && account.first_login === 1) {
                let gold = Math.max(account.gold, vip_info.vip_dailyGold);
                if (gold - account.gold > 0) {
                    account.gold = gold - account.gold;
                }
                account.pearl = Math.max(account.pearl, vip_info.vip_dailyDiamond);
            }
        }

        //登录次数
        account.login_count = account.login_count + 1;

        //
        common.addFamousOnlineBroadcast(account, account.platform);
        //重设魅力值
        CharmUtil.getCurrentCharmPoint(account, function (charmPoint) {
            if (charmPoint) {
                account.charm_point = charmPoint;
            }

            if (account.first_login === 1) {
                account.first_login = 0;
            }
            // 下面的代码执行后效果等同于account.commit().
            redisSync.setAccountById(account.id, account.toJSON());

            cb && cb(null, account);
        });
    }

    login(uid){
        console.log('-------------:',uid);

        let self = this;
        let promise1 = new Promise(function (resolve, reject) {

            redisSync.getAccountById(uid, function (err, account) {
                if(err){
                    reject(err);
                    return;
                }

                logLogin.push({
                    account_id: account.id,
                    log_at: new Date(),
                });

                self._someOptAfterLogin(account, function (err, account) {
                    resolve(account);
                });

            });

        });

        return promise1;
    }
}

module.exports = new UserLogin();