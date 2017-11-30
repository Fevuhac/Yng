import { Controller } from 'egg';

export default class AdminController extends Controller {

  public async index() {
    const { ctx } = this;
    await ctx.render('admin/pages-signin.ejs', { title: '管理员登录' });
  }

  public async home() {
    const { ctx } = this;
    await ctx.render('admin/index.ejs', { title: '主页' });
  }

  /**
   * 后台管理员登录{
   * username:'admin',
   * password:'111111'
   * }
   */
  public async login() {
    const { ctx } = this;
    let body: any = ctx.request.body;
    let { result, errorCode, data } = await this.service.admin.login(body.username, body.password);
    if (result) {
      await ctx.render('admin/index.ejs', data);
    } else {
      ctx.body = {
        enc: false,
        error: {
          code: errorCode,
        }
      }
    }
  }

  /**
   * 后台管理员登出
   */
  public async logout() {
    const { ctx } = this;
    console.log('-----------------------', ctx.__('email1'));
    ctx.body = {
      enc: true,
      data: {
        name: 'logout',
        age: 1000
      }

    }
  }

  /**
   * 修改管理员密码
   */
  public async modify() {
    const { ctx } = this;
    ctx.body = {
      name: 'modify',
      age: 1000
    }
  }

  /**
     * 实时数据
     */
  public async realtime() {
    let body: any = this.ctx.request.body;

    let { result, data, errorCode } = await this.service.gameData.realtime(body.first_date, body.second_date);
    if (!result) {
      this.ctx.body = {
        enc: false,
        code: errorCode,
      }
    } else {
      await this.ctx.render('admin/pages-realtime.ejs', { title: 'xxxxx', txt_realtime: data });
    }
  }

  /**
   * 在线状态
   */
  public async online() {
    let body: any = this.ctx.request.body;

    let { result, data, errorCode } = await this.service.gameData.online(body.start_time, body.end_time);
    if (!result) {
      this.ctx.body = {
        enc: false,
        code: errorCode,
      }
    } else {
      await this.ctx.render('admin/pages-online.ejs', { title: 'xxxxx', txt_online: data });
    }
  }

  /**
   * 注册激活
   */
  public async register() {
    let body: any = this.ctx.request.body;

    let { result, data, errorCode } = await this.service.gameData.register(body.start_date, body.end_date);
    if (!result) {
      this.ctx.body = {
        enc: false,
        code: errorCode,
      }
    } else {
      await this.ctx.render('admin/pages-register.ejs', { title: 'xxxxx', txt_register: data });
    }
  }

  /**
   * 活跃用户
   */
  public async active() {
    let body: any = this.ctx.request.body;

    let { result, data, errorCode } = await this.service.gameData.active(body.start_date, body.end_date);
    if (!result) {
      this.ctx.body = {
        enc: false,
        code: errorCode,
      }
    } else {
      await this.ctx.render('admin/pages-active.ejs', { title: 'xxxxx', txt_active: data });
    }
  }

  /**
   * 付费用户
   */
  public async payuser() {
    let body: any = this.ctx.request.body;

    let { result, data, errorCode } = await this.service.gameData.payuser(body.start_date, body.end_date);
    if (!result) {
      this.ctx.body = {
        enc: false,
        code: errorCode,
      }
    } else {
      await this.ctx.render('admin/pages-payuser.ejs', { title: 'xxxxx', txt_payuser: data });
    }
  }

  /**
  * 留存趋势
  */
  public async retention() {
    let body: any = this.ctx.request.body;

    let { result, data, errorCode } = await this.service.gameData.retention(body.start_date, body.end_date);
    if (!result) {
      this.ctx.body = {
        enc: false,
        code: errorCode,
      }
    } else {
      await this.ctx.render('admin/pages-retention.ejs', { title: 'xxxxx', txt_retention: data });
    }
  }

  /**
  * 日志记录
  */
  public async log() {
    let body: any = this.ctx.request.body;

    let { result, data, errorCode } = await this.service.gameData.log(body.start_date, body.end_date);
    if (!result) {
      this.ctx.body = {
        enc: false,
        code: errorCode,
      }
    } else {
      await this.ctx.render('admin/pages-log.ejs', { title: 'xxxxx', txt_realtime: data });
    }
  }

  /**
  * 盈利排行榜
  */
  public async gain() {

    let { result, data, errorCode } = await this.service.gameData.gain();
    if (!result) {
      this.ctx.body = {
        enc: false,
        code: errorCode,
      }
    } else {
      await this.ctx.render('admin/pages-gain.ejs', { title: 'xxxxx', txt_gain: data });
    }
  }

  /**
  * 亏损排行榜
  */
  public async loss() {

    let { result, data, errorCode } = await this.service.gameData.loss();
    if (!result) {
      this.ctx.body = {
        enc: false,
        code: errorCode,
      }
    } else {
      await this.ctx.render('admin/pages-loss.ejs', { title: 'xxxxx', txt_loss: data });
    }
  }

}

  //  ctx.body = `isIOS:${ctx.helper.}`;
//inner
// app.router.redirect('/', '/home/index', 302);
      //outer
      // ctx.redirect(`http://cn.bing.com/search?q=ts`)

      //  const dataList = await ctx.service.user.login('template test','/login');
      //  console.log(dataList);
      // await ctx.render('user.tpl', dataList);
    //    ctx.body = {
    //        name:'hello',
    //        age:100
    //    };