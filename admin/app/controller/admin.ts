// import { Controller } from 'egg';
const Controller = require('egg').Controller;

const _ = require('underscore');

export default class AdminController extends Controller {

  public async index() {
    const { ctx } = this;
    await ctx.render('admin/pages-signin.ejs', { title: '管理员登录' });
  }

  public async home() {
    const { ctx } = this;
    await ctx.render('admin/index.ejs', ctx.session.common);
  }

  /**
   * 后台管理员登录{
   * username:'admin',
   * password:'111111'
   * }
   */
  public async login() {
    // const { ctx } = this;
    const ctx = this.ctx;
    let body: any = ctx.request.body;
    let { result, errorCode, data } = await this.service.admin.login(body.username, body.password);
    if (result) {
      ctx.session.common = data;
      await ctx.render('admin/index.ejs', data);
    } else {
      ctx.app.helper.fail(ctx, errorCode);
    }
  }

  /**
   * 后台管理员登出
   */
  public async logout() {
    const { ctx } = this;
    ctx.app.helper.success(ctx, { name: 'logout', age: 1000 });
  }

  /**
   * 修改管理员密码
   */
  public async modify() {
    const { ctx } = this;
    ctx.app.helper.success(ctx, { name: 'modify', age: 1000 });
  }

  private async getPage(ctx, result, data, errorCode, renderTarget) {
    if (!result) {
      ctx.body = {
        enc: false,
        code: errorCode,
      }
    } else {
      let ret = _.extend(ctx.session.common, data);
      console.log('ret:', ret);
      await ctx.render(renderTarget, ret);
    }
  }

  /**
   * 请求实时数据页面.
   */
  public async pageRealtime() {
    let { result, data, errorCode } = await this.service.page.realtime();
    await this.getPage(this.ctx, result, data, errorCode, 'admin/pages-realtime.ejs');
  }

  /**
   * 请求活跃用户页面.
   */
  public async pageActive() {
    let { result, data, errorCode } = await this.service.page.active();
    await this.getPage(this.ctx, result, data, errorCode, 'admin/pages-active.ejs');
  }

  public async pageOnline() {
    let { result, data, errorCode } = await this.service.page.online();
    await this.getPage(this.ctx, result, data, errorCode, 'admin/pages-online.ejs');
  }

  public async pageRegister() {
    let { result, data, errorCode } = await this.service.page.register();
    await this.getPage(this.ctx, result, data, errorCode, 'admin/pages-register.ejs');
  }

  public async pageRetention() {
    let { result, data, errorCode } = await this.service.page.retention();
    await this.getPage(this.ctx, result, data, errorCode, 'admin/pages-retention.ejs');
  }

  public async pageLog() {
    let { result, data, errorCode } = await this.service.page.log();
    await this.getPage(this.ctx, result, data, errorCode, 'admin/pages-log.ejs');
  }

  public async pagePayuser() {
    let { result, data, errorCode } = await this.service.page.payuser();
    await this.getPage(this.ctx, result, data, errorCode, 'admin/pages-payuser.ejs');
  }

  // GM

  public async pageGmUpdate() {
    let { result, data, errorCode } = await this.service.page.gmUpdate();
    await this.getPage(this.ctx, result, data, errorCode, 'admin/pages-gm-update.ejs');
  }

  public async pageGmData() {
    let { result, data, errorCode } = await this.service.page.gmData();
    await this.getPage(this.ctx, result, data, errorCode, 'admin/pages-gm-data.ejs');
  }

  public async pageGmBroadcast() {
    let { result, data, errorCode } = await this.service.page.gmBroadcast();
    await this.getPage(this.ctx, result, data, errorCode, 'admin/pages-gm-broadcast.ejs');
  }

  public async pageGmMail() {
    let { result, data, errorCode } = await this.service.page.gmMail();
    await this.getPage(this.ctx, result, data, errorCode, 'admin/pages-gm-mail.ejs');
  }

  public async pageGmActive() {
    let { result, data, errorCode } = await this.service.page.gmActive();
    await this.getPage(this.ctx, result, data, errorCode, 'admin/pages-gm-active.ejs');
  }

  public async pageGmMatch() {
    let { result, data, errorCode } = await this.service.page.gmMatch();
    await this.getPage(this.ctx, result, data, errorCode, 'admin/pages-gm-match.ejs');
  }

  // OM

  public async pageOmQuery() {
    let { result, data, errorCode } = await this.service.page.omQuery();
    await this.getPage(this.ctx, result, data, errorCode, 'admin/pages-om-query.ejs');
  }

  public async pageOmCik() {
    let { result, data, errorCode } = await this.service.page.omCik();
    await this.getPage(this.ctx, result, data, errorCode, 'admin/pages-om-cik.ejs');
  }

  public async pageOmControl() {
    let { result, data, errorCode } = await this.service.page.omControl();
    await this.getPage(this.ctx, result, data, errorCode, 'admin/pages-om-control.ejs');
  }

  public async pageOmWarning() {
    let { result, data, errorCode } = await this.service.page.omWarning();
    await this.getPage(this.ctx, result, data, errorCode, 'admin/pages-om-warning.ejs');
  }

  // AM

  public async pageAmAuth() {
    let { result, data, errorCode } = await this.service.page.amAuth();
    await this.getPage(this.ctx, result, data, errorCode, 'admin/pages-am-auth.ejs');
  }

  public async pageAmRole() {
    let { result, data, errorCode } = await this.service.page.amRole();
    await this.getPage(this.ctx, result, data, errorCode, 'admin/pages-am-role.ejs');
  }

  public async pageAmUser() {
    let { result, data, errorCode } = await this.service.page.amUser();
    await this.getPage(this.ctx, result, data, errorCode, 'admin/pages-am-user.ejs');
  }

  public async pageAmServer() {
    let { result, data, errorCode } = await this.service.page.amServer();
    await this.getPage(this.ctx, result, data, errorCode, 'admin/pages-am-server.ejs');
  }

  public async pageAmLog() {
    let { result, data, errorCode } = await this.service.page.amLog();
    await this.getPage(this.ctx, result, data, errorCode, 'admin/pages-am-log.ejs');
  }

  public async pageAmBackdoor() {
    let { result, data, errorCode } = await this.service.page.amBackdoor();
    await this.getPage(this.ctx, result, data, errorCode, 'admin/pages-am-backdoor.ejs');
  }

  /**
     * 实时数据
     */
  public async realtime() {
    let body: any = this.ctx.request.body;
    let { result, data, errorCode } = await this.service.gameData.realtime(body.data);
    this.addTxt(data, 'TXT_COMMON', ['txt_yesterday', 'txt_today']);
    this.handleResult(result, data, errorCode);
  }

  /**
   * 在线状态
   */
  public async online() {
    let body: any = this.ctx.request.body;

    let { result, data, errorCode } = await this.service.gameData.online(body.data);
    this.handleResult(result, data, errorCode);
  }

  /**
   * 注册激活
   */
  public async register() {
    let body: any = this.ctx.request.body;

    let { result, data, errorCode } = await this.service.gameData.register(body.data);
    this.handleResult(result, data, errorCode);
  }

  /**
   * 活跃用户
   */
  public async active() {
    let body: any = this.ctx.request.body;

    let { result, data, errorCode } = await this.service.gameData.active(body.data);
    this.handleResult(result, data, errorCode);
  }

  /**
   * 付费用户
   */
  public async payuser() {
    let body: any = this.ctx.request.body;

    let { result, data, errorCode } = await this.service.gameData.payuser(body.data);
    this.handleResult(result, data, errorCode);
  }

  /**
  * 留存趋势
  */
  public async retention() {
    let body: any = this.ctx.request.body;

    let { result, data, errorCode } = await this.service.gameData.retention(body.data);
    this.handleResult(result, data, errorCode);
  }

  /**
  * 留存趋势
  */
  public async generateRetention() {
    let body: any = this.ctx.request.body;

    let { result, data, errorCode } = await this.service.gameData.generateRetention(body.data);
    this.handleResult(result, data, errorCode);
  }

  /**
  * 重启服务器
  */
  public async restart() {
    let body: any = this.ctx.request.body;

    let { result, data, errorCode } = await this.service.gameData.restart(body.data);
    this.handleResult(result, data, errorCode);
  }

  /**
  * 日志记录
  */
  public async log() {
    let body: any = this.ctx.request.body;

    let { result, data, errorCode } = await this.service.gameData.log(body.data);
    this.handleResult(result, data, errorCode);
  }

  /**
  * 盈利排行榜
  */
  public async gain() {
    let body: any = this.ctx.request.body;

    let { result, data, errorCode } = await this.service.gameData.gain(body.data);
    this.handleResult(result, data, errorCode);
  }

  /**
  * 亏损排行榜
  */
  public async loss() {
    let body: any = this.ctx.request.body;

    let { result, data, errorCode } = await this.service.gameData.loss(body.data);
    this.handleResult(result, data, errorCode);
  }

  /**
  * 公告
  */
  public async broadcast() {
    let body: any = this.ctx.request.body;

    let { result, data, errorCode } = await this.service.gameData.broadcast(body.data);
    this.handleResult(result, data, errorCode);
  }

  /**
  * 邮件
  */
  public async mail() {
    let body: any = this.ctx.request.body;
    let { result, data, errorCode } = await this.service.gameData.mail(body.data);
    this.handleResult(result, data, errorCode);
  }

  /**
  * 获取用户信息
  */
  public async getAccount() {
    let body: any = this.ctx.request.body;
    let { result, data, errorCode } = await this.service.gameData.getAccount(body.data);
    this.handleResult(result, data, errorCode);
  }

  /**
   * 设置预警信息
   */
  public async setCoefficiency() {
    let body: any = this.ctx.request.body;
    let { result, data, errorCode } = await this.service.sysData.setWarningCoefficiencyData(body.data);
    this.addTxt(data, 'TXT_COMMON', ['txt_delete']);
    this.handleResult(result, data, errorCode);
  }

  /**
   * 修改预警信息
   */
  public async delCoefficiency() {
    let body: any = this.ctx.request.body;
    let { result, data, errorCode } = await this.service.sysData.delWarningCoefficiencyData(body.data);
    this.addTxt(data, 'TXT_COMMON', ['txt_delete']);
    this.handleResult(result, data, errorCode);
  }

  /**
   * 查询预警信息
   */
  public async getCoefficiency() {

    let { result, data, errorCode } = await this.service.sysData.getWarningCoefficiencyData();
    this.addTxt(data, 'TXT_COMMON', ['txt_delete']);
    this.handleResult(result, data, errorCode);
  }


  //日志查询
  public async queryLog() {
    let body: any = this.ctx.request.body;
    let { result, data, errorCode } = await this.service.gameData.queryLog(body.data);
    this.handleResult(result, data, errorCode);
  }

  //日志查询
  public async getDailyStatistics() {
    let body: any = this.ctx.request.body;
    let { result, data, errorCode } = await this.service.gameData.getDailyStatistics(body.data);
    this.handleResult(result, data, errorCode);
  }


  //----------------------------------------------------------------------------
  // 提现相关实现
  //----------------------------------------------------------------------------

  /**
   * 获取实物兑换订单列表
   */
  public async queryChangeOrder() {
    let body: any = this.ctx.request.body;
    let { result, data, errorCode } = await this.service.gameData.queryChangeOrder(body.data);
    this.handleResult(result, data, errorCode);
  }

  /**
   * 实物兑换配置
   */
  public async getOperationCfgs() {
    let body: any = this.ctx.request.body;
    let data = JSON.parse(body.data);
    const OP_TYPE = {
      CHANGE_IN_KIND: 1,//实物兑换
      SWITCH: 2,//总开关
    };
    switch (data.type) {
      case OP_TYPE.CHANGE_IN_KIND:
        let { result, data, errorCode } = await this.service.gameData.queryOperation();
        this.handleResult(result, data, errorCode);
        break;
      case OP_TYPE.SWITCH:
        let res = await this.service.gameData.getSwitch();
        this.handleResult(res.result, res.data, res.errorCode);
        break;
    }
  }

  /**
   * 实物兑换配置修改
   */
  public async modifyCfgs() {
    let body: any = this.ctx.request.body;
    let data = JSON.parse(body.data);
    const OP_TYPE = {
      CHANGE_IN_KIND: 1,//实物兑换
      SWITCH: 2,//总开关
    };
    switch (data.type) {
      case OP_TYPE.CHANGE_IN_KIND:
        let res = await this.service.gameData.updateOperation(body.data);
        this.handleResult(res.result, res.data, res.errorCode);
        break;
      case OP_TYPE.SWITCH:
        let rr = await this.service.gameData.updateSwitch(body.data);
        this.handleResult(rr.result, rr.data, rr.errorCode);
        break;
    }

  }


  /**
   * 游戏管理
   */

  public async getDataWater() {
    let { result, data, errorCode } = await this.service.gameData.getDataWater();
    this.handleResult(result, data, errorCode);
  }


  //----------------------------------------------------------------------------
  // 奖池相关实现
  //----------------------------------------------------------------------------

  /**
  * 获取全服奖池总览
  */
  public async queryJackpot() {
    let { result, data, errorCode } = await this.service.gameData.queryJackpot();
    this.handleResult(result, data, errorCode);
  }

  /**
  * 获取指定玩家数据
  */
  public async queryPlayer() {
    let body: any = this.ctx.request.body;
    let { result, data, errorCode } = await this.service.gameData.queryPlayer(body.data);
    this.handleResult(result, data, errorCode);
  }

  /**
  * 获取盈亏排行榜
  */
  public async queryProfit() {
    let body: any = this.ctx.request.body;
    let { result, data, errorCode } = await this.service.gameData.queryProfit(body.data);
    this.handleResult(result, data, errorCode);
  }

  /**
  * 改变捕获率
  */
  public async changeRate() {
    let body: any = this.ctx.request.body;
    let { result, data, errorCode } = await this.service.gameData.changeRate(body.data);
    this.handleResult(result, data, errorCode);
  }

  //----------------------------------------------------------------------------
  // 权限管理
  //----------------------------------------------------------------------------

  /**
 * 查询权限
 */
  public async getAuth() {
    let { result, data, errorCode } = await this.service.admin.getAuthList();
    this.handleResult(result, data, errorCode);
  }

  /**
   * 添加权限
   */
  public async addAuth() {
    let body: any = this.ctx.request.body;
    let { result, data, errorCode } = await this.service.admin.addAuth(body.data);
    this.handleResult(result, data, errorCode);
  }

  /**
   * 删除权限
   */
  public async deleteAuth() {
    let body: any = this.ctx.request.body;
    let { result, data, errorCode } = await this.service.admin.deleteAuth(body.data);
    this.handleResult(result, data, errorCode);
  }

  /**
   * 激活权限
   */
  public async validAuth() {
    let body: any = this.ctx.request.body;
    let { result, data, errorCode } = await this.service.admin.validAuth(body.data);
    this.handleResult(result, data, errorCode);
  }

  /**
  * 编辑权限
  */
  public async editAuth() {
    let body: any = this.ctx.request.body;
    let { result, data, errorCode } = await this.service.admin.editAuth(body.data);
    this.handleResult(result, data, errorCode);
  }

  //----------------------------------------------------------------------------
  // 角色管理
  //----------------------------------------------------------------------------

  /**
   * 查询角色
   */
  public async getRole() {
    let { result, data, errorCode } = await this.service.admin.getRoleList();
    this.handleResult(result, data, errorCode);
  }

  /**
   * 添加角色
   */
  public async addRole() {
    let body: any = this.ctx.request.body;
    let { result, data, errorCode } = await this.service.admin.addRole(body.data);
    this.handleResult(result, data, errorCode);
  }

  /**
   * 删除角色
   */
  public async deleteRole() {
    let body: any = this.ctx.request.body;
    let { result, data, errorCode } = await this.service.admin.deleteRole(body.data);
    this.handleResult(result, data, errorCode);
  }

  /**
   * 激活角色
   */
  public async validRole() {
    let body: any = this.ctx.request.body;
    let { result, data, errorCode } = await this.service.admin.validRole(body.data);
    this.handleResult(result, data, errorCode);
  }

  /**
  * 编辑角色
  */
  public async editRole() {
    let body: any = this.ctx.request.body;
    let { result, data, errorCode } = await this.service.admin.editRole(body.data);
    this.handleResult(result, data, errorCode);
  }

  //----------------------------------------------------------------------------
  // 用户管理
  //----------------------------------------------------------------------------

  /**
  * 查询用户
  */
  public async getUser() {
    let { result, data, errorCode } = await this.service.admin.getUserList();
    this.handleResult(result, data, errorCode);
  }

  /**
   * 添加用户
   */
  public async addUser() {
    let body: any = this.ctx.request.body;
    let { result, data, errorCode } = await this.service.admin.addUser(body.data);
    this.handleResult(result, data, errorCode);
  }

  /**
   * 删除用户
   */
  public async deleteUser() {
    let body: any = this.ctx.request.body;
    let { result, data, errorCode } = await this.service.admin.deleteUser(body.data);
    this.handleResult(result, data, errorCode);
  }

  /**
   * 激活用户
   */
  public async validUser() {
    let body: any = this.ctx.request.body;
    let { result, data, errorCode } = await this.service.admin.validUser(body.data);
    this.handleResult(result, data, errorCode);
  }

  /**
  * 编辑用户
  */
  public async editUser() {
    let body: any = this.ctx.request.body;
    let { result, data, errorCode } = await this.service.admin.editUser(body.data);
    this.handleResult(result, data, errorCode);
  }


  //----------------------------------------------------------------------------
  // 共用方法, 提高代码重用率(维护人员: YXL)
  //----------------------------------------------------------------------------

  private async handleResult(result, data, errorCode) {
    if (!result) {
      this.ctx.helper.fail(this.ctx, errorCode);
    } else {
      this.ctx.helper.success(this.ctx, data);
    }
  }

  /**
   * 添加返回给前端使用的多语言文字, 可对不同module多次调用.
   * @param data 返回前端的数据.
   * @param txtModule 多语言模块名, 用于选出多语言需要的模块.
   * @param txtList 返回客户端的语言key集合.
   */
  private addTxt(data, txtModule, txtList) {
    let text = JSON.parse(this.ctx.__(txtModule));
    if (!data.txt) {
      data.txt = {};
    }
    for (let i = 0; i < txtList.length; i++) {
      let txtKey = txtList[i];
      data.txt[txtKey] = text[txtKey];
    }
  }

}
