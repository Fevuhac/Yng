// import { Context, Service } from 'egg';
const Service = require('egg').Service;

class Admin extends Service {

    public async login(user, pwd) {

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
                }
            } else {
                return {result:false, errorCode:this.app.config.ErrorCode.USER_OR_PWD_ERROR};
            }
        } catch (err) {
            return {result:false, errorCode:this.app.config.ErrorCode.DB_ERROR};
        }
       
    }

}

export default Admin;