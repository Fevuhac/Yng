
const Service = require('egg').Service;
import import_def from '../util/import_def';
const wc = require('../dao/warningCoefficiencyDao');
const userDao = require('../dao/UserDao');
const common_const_cfg = import_def.GAMECFG.common_const_cfg;
const CHANGE_CASH_3 = common_const_cfg.CHANGE_CASH_3;
const CHANGE_CASH_4 = common_const_cfg.CHANGE_CASH_4;

class SysData extends Service {
    /**
     * 预警平衡系数
     * 预警平衡系数 = （已充值额度 * 充值比例 + 1000*玩家数） / （玩家持有金币 + 奖池 + 已提取额度 * 提现比例 + 抽水 + 幸运大奖消耗 + 核弹消耗 + 其他消耗）
     */
    public async warningCoefficiency() {
        try {
            let recharge_data = await userDao.getTotalRecharge(this.app);
            if(!recharge_data.result){
                return null;
            }
            let recharge=recharge_data.data || 0;
            let cash_data = await userDao.getTotalCash(this.app);
            if(!cash_data.result){
                return null;
            }
            let cash=cash_data.data || 0;
            let bonusPool_data = await userDao.getTotalBonusPool(this.app);
            if(!bonusPool_data.result){
                return null;
            }
            let bonusPool=bonusPool_data.data || 0;
            let pumpPool_data = await userDao.getTotalPumpPool(this.app);
            if(!pumpPool_data.result){
                return null;
            }
            let pumpPool=pumpPool_data.data || 0;
            let totalGold_data = await userDao.getTotalGold(this.app);
            if(!totalGold_data.result){
                return null;
            }
            let totalGold=totalGold_data.data || 0;
            let totalUserCount_data = await this.getTotalUserCount();
            if(!totalUserCount_data.result){
                return null;
            }
            let totalUserCount=totalUserCount_data.data || 0;
            let cost_data = await userDao.getTotalCost(this.app);
            if(!cost_data.result){
                return null;
            }
            let cost=cost_data.data || 0;

            console.log(`${recharge}*${CHANGE_CASH_3}+1000*${totalUserCount}---${totalGold}+${bonusPool}+${cash}*${CHANGE_CASH_4}+${pumpPool}+${cost}`);
            let wc = (recharge * CHANGE_CASH_3 + 1000 * totalUserCount) / (totalGold + bonusPool + cash * CHANGE_CASH_4 + pumpPool + cost);
            let result = {
                bonusPool: bonusPool,
                pump: pumpPool,
                recharge: recharge,
                cash: cash,
                totalGold: totalGold,
                warning: wc,
            };
            return result;
        }
        catch (err) {
            return null;
        }
    }

    //发布警告消息
    public async warningAdvice(param){
        let a=await this.app.redis.publish(import_def.REDISKEY.DATA_EVENT_SYNC.PLATFORM_EARLY_WARNING,JSON.stringify(param)); 
        console.log('发布警告消息:',a);  
    }

    /**
     * 获取预警相关信息
     */
    public async getWarningCoefficiencyData() {
        return await wc.getWarningCoefficiency(this.app);
    }

    /**
     * 发送邮件
     */
    public async sendMail(content: string, target: string) {
        //todo
        console.log(content, target);
        return { result: true, data: null, errCode: null };
    }

    /**
     * 发送短信
     */
    public async sendMsg(content: string, target: string) {
        //todo
        console.log(content, target);
        return { result: true, data: null, errCode: null };
    }

    /**
     * 获取所有玩家数量
     */
    public async getTotalUserCount() {
        return await userDao.getTotalUserCount(this.app);
    }

    /**
     * 获取玩家手中金币总数
     */
    public async getTotalUserMoney() {
        return await userDao.getTotalUserMoney(this.app);
    }

    /**
     * 修改预警信息
     */
    public async setWarningCoefficiencyData(data: any) {
        let phone = data.phone;
        let mail = data.mail;
        console.log('phone:', phone);
        console.log('mail:', mail);
        return await wc.setWarningCoefficiency(this.app, phone, mail);
    }

    /**
     * 删除预警信息
     */
    public async delWarningCoefficiencyData(data: any) {
        let phone = data.phone;
        let mail = data.mail;
        return await wc.delWarningCoefficiency(this.app, phone, mail);
    }

}

export default SysData;