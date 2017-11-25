const authSdk = require('./authSdk');
const userRegiste = require('./userRegiste');
const userLogin = require('./userLogin');



class UserAccess {
    constructor() {
        authSdk.install(authSdk.PlatformType.FACEBOOK);
    }

    async enter(data, cb) {
        try{
            let account = null;
            let sdk_api = authSdk.sdk(data.platformType);
            if(!sdk_api){
                utils.invokeCallback(cb, '不支持此平台用户登录');
                return;
            }
            let userInfo = await sdk_api.getUserInfo(data);
            let isReg = await userRegiste.isRegiste(userInfo.openid);
            if(!isReg){
                account = await userRegiste.registe(userInfo);
            }
            else {
                account = await userLogin.login(userInfo.openid);
            }

            cb && cb(null, account);
        }catch (err){
            cb && cb(err);
        }
    }

    leave(data, cb) {

    }
}

module.exports = UserAccess;