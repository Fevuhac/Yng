const Subscription = require('egg').Subscription;
import import_def from '../util/import_def';

const common_const_cfg = import_def.GAMECFG.common_const_cfg;
const CHANGE_CASH_5 = common_const_cfg.CHANGE_CASH_5;


class UpdateCache extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '5s', // 1 分钟间隔
      type: 'all', // 指定所有的 worker 都需要执行
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    let wc = await this.service.sysData.warningCoefficiency();
    let param=wc.warning;
    let color="green";
    console.log("预警系数: ",param);
    //获取相关信息
    let { result, data, errCode } = await this.service.sysData.getWarningCoefficiencyData();
    if (!result) {
      console.log("预警信息错误！", errCode);
      return;
    }
    let phones = data.phone;
    let mails = data.mail;
    let lock=false;
    if (param >= 0.95 && param < 1) {
      console.log('预警系数大于0.95小于1');
      this.service.sysData.sendMail('content', mails);//邮件通知
      this.service.sysData.sendMsg('content', phones);//短信通知
      color="yellow";
    }
    else if (param < 0.95) {
      console.log('预警系数小于0.95');
      let { result, data, errCode } = await this.service.sysData.getTotalUserCount();
      if (!result) {
        console.log("预警信息错误！", errCode);
        return;
      }
      console.log('usercount',data,typeof data);
      color="yellow";
      if (data > CHANGE_CASH_5) {
        this.service.sysData.sendMail('content', mails);//邮件通知
        this.service.sysData.sendMsg('content', phones);//短信通知
        lock=true;
        //todo 修改奖池等信息
        console.log('执行修改奖池等');
        color="red";
      }
    } 
    this.service.sysData.warningAdvice({lock:lock});//通知
    wc.color=color;
    console.log("=================================",wc)
    this.ctx.app.cache=wc;
  }
}

module.exports = UpdateCache;