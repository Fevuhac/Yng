"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const egg_1 = require("egg");
class AdminController extends egg_1.Controller {
    /**
     * 后台管理员登录
     */
    async login() {
        const { ctx } = this;
        let body = ctx.request.body;
        let { result, errorCode, data } = await this.service.admin.login(body.user, body.pwd);
        if (result) {
            ctx.body = {
                enc: true,
                data: data
            };
        }
        else {
            ctx.body = {
                enc: false,
                error: {
                    code: errorCode,
                }
            };
        }
    }
    /**
     * 后台管理员登出
     */
    async logout() {
        const { ctx } = this;
        console.log('-----------------------', ctx.__('email1'));
        ctx.body = {
            enc: true,
            data: {
                name: 'logout',
                age: 1000
            }
        };
    }
    /**
     * 修改管理员密码
     */
    async modify() {
        const { ctx } = this;
        ctx.body = {
            name: 'modify',
            age: 1000
        };
    }
}
exports.default = AdminController;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRtaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhZG1pbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZCQUFpQztBQUVqQyxxQkFBcUMsU0FBUSxnQkFBVTtJQUNyRDs7T0FFRztJQUNJLEtBQUssQ0FBQyxLQUFLO1FBQ2hCLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDckIsSUFBSSxJQUFJLEdBQVEsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7UUFDakMsSUFBSSxFQUFFLE1BQU0sRUFBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckYsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNYLEdBQUcsQ0FBQyxJQUFJLEdBQUc7Z0JBQ1QsR0FBRyxFQUFFLElBQUk7Z0JBQ1QsSUFBSSxFQUFFLElBQUk7YUFDWCxDQUFBO1FBQ0gsQ0FBQztRQUFBLElBQUksQ0FBQSxDQUFDO1lBQ0osR0FBRyxDQUFDLElBQUksR0FBRztnQkFDVCxHQUFHLEVBQUUsS0FBSztnQkFDVixLQUFLLEVBQUU7b0JBQ0wsSUFBSSxFQUFDLFNBQVM7aUJBQ2Y7YUFDRixDQUFBO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFFRDs7T0FFRztJQUNJLEtBQUssQ0FBQyxNQUFNO1FBQ2pCLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDekQsR0FBRyxDQUFDLElBQUksR0FBRztZQUNULEdBQUcsRUFBRSxJQUFJO1lBQ1QsSUFBSSxFQUFFO2dCQUNKLElBQUksRUFBRSxRQUFRO2dCQUNkLEdBQUcsRUFBRSxJQUFJO2FBQ1Y7U0FFRixDQUFBO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0ksS0FBSyxDQUFDLE1BQU07UUFDakIsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztRQUNyQixHQUFHLENBQUMsSUFBSSxHQUFHO1lBQ1QsSUFBSSxFQUFFLFFBQVE7WUFDZCxHQUFHLEVBQUUsSUFBSTtTQUNWLENBQUE7SUFDSCxDQUFDO0NBQ0Y7QUFqREQsa0NBaURDO0FBRUMsc0NBQXNDO0FBQ3hDLE9BQU87QUFDUCxnREFBZ0Q7QUFDMUMsT0FBTztBQUNQLGlEQUFpRDtBQUVqRCw0RUFBNEU7QUFDNUUsMEJBQTBCO0FBQzFCLDBDQUEwQztBQUM1QyxrQkFBa0I7QUFDbEIsdUJBQXVCO0FBQ3ZCLGlCQUFpQjtBQUNqQixTQUFTIn0=