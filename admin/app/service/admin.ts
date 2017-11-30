// import { Context, Service } from 'egg';
const _ = require('underscore');

const Service = require('egg').Service;

class Admin extends Service {

    /**
     * 
user: {
  id: 1,
  uname: 'admin',
  salt: 'c9ebea80c20dbf1897f0c72097fd16f3df3f7dc03f895886',
  password: 'O4qdZ95vQdhXmE3G4a4M/KZ0SAaq4on+oBhLlCU6iwR82Vh6Bd290SHpu8k70ath20Goq0jmMl0mjLHFBlkSsg=='
  token: '1_f9c3005d27fe7280beb978d4ec1018d229e7ea621692efeb',
  created_at: 2016-11-10T05:03:14.000Z,
  updated_at: '0000-00-00 00:00:00',
  role: 2,
  valid: null
}
role: {
  id: 2,
  rname: '管理员',
  description: '管理日常事务',
  auth_ids: '1,2,3,4,5,18,21',
  valid: 1 
}
auth: [ { page: 'root' },
  { page: 'menu_dashboard' },
  { page: 'menu_statistics' },
  { page: 'menu_game_mgmt' },
  { page: 'menu_back_mgmt' },
  { page: 'menu_test_mgmt' },
  { page: 'menu_operation' } 
]
     * @param username 
     * @param password 
     */
    public async login(username, password) {

        try {
            // console.log('user:', username);
            // console.log('pwd:', password);
            const _user = await this.app.mysql.get('tbl_admin_user', { uname: username });
            // console.log('user:', _user);
            let encodePwd = await this.ctx.helper.encodePwd(_user.salt, password);
            if (encodePwd == _user.password) {
                console.log('登录成功');
                let _role = await this.app.mysql.get('tbl_admin_role', { id: _user.role });
                // console.log('role:', _role);

                let sql = `SELECT page FROM 
                tbl_admin_auth WHERE 
                id IN (${_role.auth_ids})`;
                // console.log('sql:', sql);
                let _auth = await this.app.mysql.query(sql);
                // console.log('auth:', _auth);
                let auth_list = _.map(_auth, _.iteratee('page'));
                var user_auth = {};
                for (var i = 0; i < auth_list.length; i++) {
                    user_auth[auth_list[i]] = 1;
                }

                let renderParam = {
                    title: 'Dashboard',
                    // expanded_id: 'menu_dashboard',
                    expanded_id: 'menu_operation',
                    user_name: _user.uname,
                    user_role: _role.rname,
                    user_auth: user_auth
                };

                let text = this.ctx.__("TXT_SIDEBAR");
                console.log('text:', text);

                renderParam = _.extend(renderParam, JSON.parse(text));

                return {
                    result: true,
                    data: renderParam
                }
            } else {
                return { result: false, errorCode: this.app.config.ErrorCode.USER_OR_PWD_ERROR };
            }
        } catch (err) {

            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }

    }

}

export default Admin;