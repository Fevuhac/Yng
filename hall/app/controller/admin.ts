import { Controller } from 'egg';

export default class AdminController extends Controller {
//login_btn_txt:'Sign in'
//login_remember_me_chekbox：Remember me
  public async index(){
    await this.ctx.render('admin/user_index.html', {title:'管理员登录', 
    login_title:'管理员登录',
    login_username_text_tip:'用户名',
    login_password_text_tip:'密码',login_btn_txt:'登 录',
    login_remember_me_chekbox:'记住密码'});
  }
  /**
   * 后台管理员登录
   */
  public async login() {
    const { ctx } = this;
    let body: any = ctx.request.body;
    let { result,errorCode, data } = await this.service.admin.login(body.user, body.pwd);
    if (result) {
      await this.ctx.render('admin/index_demo.html', {data: data});
      // ctx.body = {
      //   enc: true,
      //   data: data
      // }
    }else{

      await this.ctx.render('admin/index_demo.html', {data: data, code:errorCode});
      // ctx.body = {
      //   enc: false,
      //   error: {
      //     code:errorCode,
      //   }
      // }
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
    //    };F