"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { Context, Service } from 'egg';
const Service = require('egg').Service;
class Admin extends Service {
    async login(user, pwd) {
        try {
            const _user = await this.app.mysql.get('tbl_admin_user', { uname: user });
            console.log(_user);
            let encodePwd = await this.ctx.helper.encodePwd(_user.salt, pwd);
            if (encodePwd == _user.password) {
                console.log('登录成功');
                let role = await this.app.mysql.get('tbl_admin_role', { id: _user.role });
                return {
                    result: true, data: {
                        auth_ids: role.auth_ids
                    }
                };
            }
            else {
                return { result: false, errorCode: this.app.config.ErrorCode.USER_OR_PWD_ERROR };
            }
        }
        catch (err) {
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }
}
exports.default = Admin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRtaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhZG1pbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDBDQUEwQztBQUMxQyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDO0FBRXZDLFdBQVksU0FBUSxPQUFPO0lBRWhCLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEdBQUc7UUFFeEIsSUFBSSxDQUFDO1lBQ0QsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUMxRSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25CLElBQUksU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDakUsRUFBRSxDQUFDLENBQUMsU0FBUyxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUM5QixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNwQixJQUFJLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDMUUsTUFBTSxDQUFDO29CQUNILE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFO3dCQUNoQixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7cUJBQzFCO2lCQUNKLENBQUE7WUFDTCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osTUFBTSxDQUFDLEVBQUMsTUFBTSxFQUFDLEtBQUssRUFBRSxTQUFTLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGlCQUFpQixFQUFDLENBQUM7WUFDakYsQ0FBQztRQUNMLENBQUM7UUFBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ1gsTUFBTSxDQUFDLEVBQUMsTUFBTSxFQUFDLEtBQUssRUFBRSxTQUFTLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBQyxDQUFDO1FBQ3hFLENBQUM7SUFFTCxDQUFDO0NBRUo7QUFFRCxrQkFBZSxLQUFLLENBQUMifQ==