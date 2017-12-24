const loginConfig = require('./login.config');

class AuthSdk {
    constructor() {
        this._sdkMap = new Map();
    }

    sdk(type) {
        return this._sdkMap.get(type);
    }

    install(type) {
        let platformConfig = loginConfig.PLATFORM_CONFIG[type];
        let sdkApi = new platformConfig.Class(platformConfig.sdk);
        this._sdkMap.set(type, sdkApi);
    }
};

module.exports = new AuthSdk();