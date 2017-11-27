import { Controller } from 'egg';

export default class AdminController extends Controller {
  /**
   * 后台管理员登录
   */
  public async login() {
    const { ctx } = this;
    let body: any = ctx.request.body;
    let { result,errorCode, data } = await this.service.admin.login(body.user, body.pwd);
    if (result) {
      ctx.body = {
        enc: true,
        data: data
      }
    }else{
      ctx.body = {
        enc: false,
        error: {
          code:errorCode,
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