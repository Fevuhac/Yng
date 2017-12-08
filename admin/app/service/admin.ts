// import { Context, Service } from 'egg';
const _ = require('underscore');

const Service = require('egg').Service;
const AdminAuthDao = require('../dao/AdminAuthDao');
const AdminRoleDao = require('../dao/AdminRoleDao');
const AdminUserDao = require('../dao/AdminUserDao');

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
                    expanded_id: 'menu_dashboard',
                    user_name: _user.uname,
                    user_role: _role.rname,
                    user_auth: user_auth
                };

                let txtSidebar = this.ctx.__("TXT_SIDEBAR");
                let txtCommon = this.ctx.__("TXT_COMMON");

                renderParam = _.extend(renderParam, JSON.parse(txtSidebar));
                renderParam = _.extend(renderParam, JSON.parse(txtCommon));

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

    public async getAuthList() {
        try {
            return await AdminAuthDao.getAll(this.app);
        }
        catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    public async addAuth(cdata) {
        try {
            console.log(typeof cdata, cdata)
            let data = JSON.parse(cdata);
            if (data.auth_page == null || data.auth_description == null || data.auth_parent == null || data.auth_level == null) {
                return { result: false, errorCode: this.app.config.ErrorCode.PARAM_ERROR }
            }
            let params = {
                page: data.auth_page,
                description: data.auth_description,
                parent: data.auth_parent,
                level: data.auth_level
            }
            console.log("addAuth params:", params)
            return await AdminAuthDao.insert(this.app, params);
        }
        catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    public async deleteAuth(data) {
        return await this.deleteOrValidAuth(data, false);
    }

    public async validAuth(data) {
        return await this.deleteOrValidAuth(data, true);
    }

    public async deleteOrValidAuth(cdata, isValid) {
        try {
            let data = JSON.parse(cdata);
            if (data.auth_id == null || isValid == null) {
                return { result: false, errorCode: this.app.config.ErrorCode.PARAM_ERROR }
            }
            let params = {
                id: data.auth_id,
                valid: isValid
            }
            return await AdminAuthDao.updateById(this.app, params);
        }
        catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    public async editAuth(cdata) {
        try {
            let data = JSON.parse(cdata);
            if (data.auth_page == null || data.auth_description == null || data.auth_parent == null || data.auth_level == null
                || data.auth_id == null) {
                return { result: false, errorCode: this.app.config.ErrorCode.PARAM_ERROR }
            }
            let params = {
                id: data.auth_id,
                page: data.auth_page,
                description: data.auth_description,
                parent: data.auth_parent,
                level: data.auth_level
            }

            return await AdminAuthDao.updateById(this.app, params);
        }
        catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    public async getRoleList() {
        try {
            return await AdminRoleDao.getAll(this.app);
        }
        catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    public async addRole(cdata) {
        try {
            let data = JSON.parse(cdata);
            if (data.role_name == null || data.role_description == null || data.role_auth == null) {
                return { result: false, errorCode: this.app.config.ErrorCode.PARAM_ERROR }
            }
            let params = {
                rname: data.role_name,
                description: data.role_description,
                auth_ids: data.role_auth,
            }
            return await AdminRoleDao.insert(this.app, params);
        }
        catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    public async deleteRole(data) {
        return await this.deleteOrValidRole(data, false);
    }

    public async validRole(data) {
        return await this.deleteOrValidRole(data, true);
    }

    public async deleteOrValidRole(cdata, isValid) {
        try {
            let data = JSON.parse(cdata);
            if (data.role_id == null) {
                return { result: false, errorCode: this.app.config.ErrorCode.PARAM_ERROR }
            }
            let params = {
                id: data.role_id,
                valid: isValid
            }
            return await AdminRoleDao.updateById(this.app, params);
        }
        catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    public async editRole(cdata) {
        try {
            let data = JSON.parse(cdata);
            if (data.role_name == null || data.role_description == null || data.role_auth == null || data.role_id == null) {
                return { result: false, errorCode: this.app.config.ErrorCode.PARAM_ERROR }
            }
            let params = {
                rname: data.role_name,
                description: data.role_description,
                auth_ids: data.role_auth,
                id: data.role_id
            }

            return await AdminRoleDao.updateById(this.app, params);
        }
        catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    public async getUserList() {
        try {
            return await AdminUserDao.getAll(this.app);
        }
        catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    public async addUser(cdata) {
        try {
            let data = JSON.parse(cdata);
            console.log("data:", data);
            if (data.user_name == null || data.user_pwd == null || data.user_role == null) {
                return { result: false, errorCode: this.app.config.ErrorCode.PARAM_ERROR }
            }
            let salt = await this.ctx.helper.createSalt();
            let password = await this.ctx.helper.encodePwd(salt, data.user_pwd);
            console.log("password:", password);
            let params = {
                uname: data.user_name,
                salt: salt,
                password: password,
                role: data.user_role
            }
            let ret = await AdminUserDao.insert(this.app, params);
            if (!ret.result) return ret;
            console.log("ret:", ret.data.insertId);
            let id = ret.data.insertId;
            let token = await this.ctx.helper.generateSessionToken(id);
            return await AdminUserDao.updateById(this.app, { token: token, id: id });
        }
        catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    public async deleteUser(data) {
        return await this.deleteOrValidUser(data, false);
    }

    public async validUser(data) {
        return await this.deleteOrValidUser(data, true);
    }

    public async deleteOrValidUser(cdata, isValid) {
        try {
            let data = JSON.parse(cdata);
            if (data.user_id == null) {
                return { result: false, errorCode: this.app.config.ErrorCode.PARAM_ERROR }
            }
            let params = {
                id: data.user_id,
                valid: isValid
            }
            return await AdminUserDao.updateById(this.app, params);
        }
        catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    public async editUser(cdata) {
        try {
            let data = JSON.parse(cdata);
            let params: any = {};

            if (data.user_name != null) params.uname = data.user_name;
            if (data.user_pwd != null) {
                let salt = await this.ctx.helper.createSalt();
                params.password = await this.ctx.helper.encodePwd(salt, data.user_pwd);
                params.salt = salt;
            }
            if (data.user_role != null) params.role = data.user_role;
            if (data.user_id != null) params.id = data.user_id;

            return await AdminUserDao.updateById(this.app, params);
        }
        catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

}

export default Admin;