const FB = require('fb');
const error = require('./error');
const User = require('./user');

class FacebookUser extends User {
    constructor(config) {
        super();
        this._fb = FB.extend(config);
    }

    loginStatus(token) {
        let promise = new Promise(function (resolve, reject) {
            this._fb.api('/me', {
                access_token: token
            }, function (res) {
                if (res && res.error) {
                    if (res.error.code === 'ETIMEDOUT') {
                        console.log('request timeout');
                    } else {
                        console.log('error', res.error);
                    }
                    reject(error.NETWORK_ERROR);
                } else {
                    console.log(res);
                    resolve(res);
                }
            });
        }.bind(this));

        return promise;
    }

    getUserInfo(data) {
        let ext = data.ext || {
            picture: {
                type: 'normal'
            }
        };

        let promise = new Promise(function (resolve, reject) {
            this._fb.api('me', {
                fields: `id,gender,name,location,picture.type(${ext.picture.type})`,
                access_token: data.sdkAuthResponse.accessToken
            }, function (res) {
                if (res && res.error) {
                    console.log('error', res.error);
                    reject(res.error);
                } else {
                    console.log(res);
                    let info = null;
                    if (res) {
                        info = {};
                        info.nickname = res.name;
                        info.sex = 'male' == res.gender ? 0 : 1;
                        info.city = res.location && res.location.name || 'secret';
                        info.figure_url = res.picture.data.url;
                        info.openid = res.id;
                    }
                    resolve(info);
                }
            });
        }.bind(this));
        return promise;
    }

    /**
     * 获取朋友列表
     * @param token
     */
    getFriends(token, ext) {
        let promise = new Promise(function (resolve, reject) {
            this._fb.api('me', {
                fields: `friends.limit(10){id,gender,name,picture.type(${ext.picture.type})}`,
                access_token: token
            }, function (res) {
                if (res && res.error) {
                    if (res.error.code === 'ETIMEDOUT') {
                        console.log('request timeout');
                    } else {
                        console.log('error', res.error);
                    }
                    reject(error.NETWORK_ERROR);
                } else {
                    console.log('-------getFriends:', res);
                    resolve(res);
                }
            });
        }.bind(this));
        return promise;
    }
}

module.exports = FacebookUser;