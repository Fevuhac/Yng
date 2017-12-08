const authSdk = require('./authSdk');
const userRegiste = require('./userRegiste');
const userLogin = require('./userLogin');

class UserAccess {
    constructor() {
        authSdk.install(authSdk.PlatformType.FACEBOOK);
    }

    async enter(data, cb) {
        try{
            let sdk_api = authSdk.sdk(data.platformType);
            if(!sdk_api){
                utils.invokeCallback(cb, '不支持此平台用户登录');
                return;
            }
            let userInfo = await sdk_api.getUserInfo(data);
            userInfo.platformType = data.platformType;
            let uid = await userRegiste.isRegiste(userInfo.openid);
            if(!uid){
                uid = await userRegiste.registe(userInfo);
                console.log('注册新用户：', uid);
            }
            else {
                console.log('用户登录：', uid);
            }
            let account = await userLogin.login(uid);
            account.figure_url = userInfo.figure_url;
            account.commit();
            cb && cb(null, account.toJSON());
        }catch (err){
            cb && cb(err);
        }
    }

    leave(data, cb) {

    }
}

module.exports = new UserAccess();