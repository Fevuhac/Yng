const Facebook = require('./facebookUser');
const InnerUser = require('./innerUser');
const GooglePlusUser = require('./googlePlusUser');

module.exports = {
    PLATFORM_TYPE: {
        TEST: 1000,
        EGRET: 1001,
        WANBA: 1002,
        FACEBOOK: 1003,
        GOOGLE: 1004,
        INNER: 1005,
    },

    PLATFORM_CONFIG: {
        1003: {
            Class:Facebook,
            sdk:{
                version: 'v2.11',
                timeout: 5000,
                // appId: '166435350758141',
                // appSecret: 'c8b601148a0040f4fb1050a860bf8eb0',
            }

        },
        1004:{
            Class:GooglePlusUser,
            sdk:{}
        },
        1005: {
            Class:InnerUser,
            sdk:{}
        }
    }
}