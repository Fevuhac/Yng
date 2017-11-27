import {Controller} from 'egg';

export default class UserController extends Controller{
  public async search(){
    this.ctx.body = `search: ${this.ctx.query.name}`;
  }

   public async login(){
       const {ctx} = this;
      //  ctx.body = `isIOS:${ctx.helper.}`;
//inner
// app.router.redirect('/', '/home/index', 302);
      //outer
      ctx.redirect(`http://cn.bing.com/search?q=ts`)

      //  const dataList = await ctx.service.user.login('template test','/login');
      //  console.log(dataList);
      // await ctx.render('user.tpl', dataList);
    //    ctx.body = {
    //        name:'hello',
    //        age:100
    //    };
   }
}