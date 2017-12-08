const Facebook = require('./facebook');
const TestApi = require('./testApi');

class AuthSdk {
    constructor() {
        this._sdkMap = new Map();
    }


    sdk(platType) {
        return this._sdkMap.get(platType);
    }

    install(platType, config) {
        let sdk = null;
        switch (platType){
            case this.PlatformType.TEST:{
                config = config || this.PlatformConfig.TEST;
                sdk = new TestApi(config);
            }
                break;
            case this.PlatformType.QQ:
                break;
            case this.PlatformType.EGRET:
                break;
            case this.PlatformType.WECHAT:
                break;
            case this.PlatformType.FACEBOOK:{
                config = config || this.PlatformConfig.TEST;
                sdk = new Facebook(config);
            }
                break;
            default:
                break;
        }

        if(sdk){
            this._sdkMap.set(platType, sdk)
        }
    }
}

AuthSdk.prototype.PlatformType = {
    TEST: 1000,
    EGRET: 1001,
    WANBA: 1002,
    FACEBOOK: 1003,
    QQ: 1004,
};

AuthSdk.prototype.PlatformConfig = {
    TEST: {},
    QQ: {},
    EGRET: {},
    WECHAT: {},
    FACEBOOK: {
        version: 'v2.11',
        timeout: 5000,
        // appId: '166435350758141',
        // appSecret: 'c8b601148a0040f4fb1050a860bf8eb0',
    }
};


let token = 'EAACEdEose0cBACZBQijXPVCiXrvuonvq8HBorFqpkxZC7sYq8YLxvkH2x0Jy94L7dX6ZAUha7ugrNTTTgVD89beHsIuIx9KQdKVgluop3FigF6sQRo7i8XC2DZADF99rLeWAPxyuoii0zLXAPMWN77AtWsvJGqlLTrUkucKJXhNoaQ3C1GLWF1G4QnEkmvmBeFHhNNRldHpweDEHIFcZCwcTtHe7fZC3wZD';


async function testApi() {


    let authSdk = new AuthSdk();

    authSdk.install(authSdk.PlatformType.FACEBOOK);
    let fb = authSdk.fb;

    try {
        let userinfo = await fb.getUserInfo(token, {picture: {type: 'small'}});
        console.log('--userinfo:', userinfo);

        let friends = await fb.getFriends(token, {picture: {type: 'small'}});
        console.log('--friends:', friends);
    } catch (error) {
        console.log('--error:', error);
    }
}

// testApi();

function test(){
    let authSdk = new AuthSdk();
    
    authSdk.install(authSdk.PlatformType.FACEBOOK);
    let fb = authSdk.fb;
    
    const http = require('http');
    const server = http.createServer(async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        if (req.url == '/facebook_callback') {
    
            req.on('data', async function (d) {
                let data = decodeURIComponent(d.toString());
    
                if (typeof data == 'string') {
                    data = data.substr('data='.length);
                }
    
                data = JSON.parse(data);
    
                if (!data) {
                    res.end('param error');
                    return;
                }
                let authResponse = data.authResponse;
                if (!authResponse) {
                    res.end('param error');
                    return;
                }
                console.log(authResponse);
    
                let userinfo = await fb.getUserInfo(authResponse.accessToken, {picture: {type: 'normal'}});
                res.end(JSON.stringify(userinfo));
                console.log('--userinfo:', userinfo);
    
            });
    
            return;
        }
    
        const ip = res.socket.remoteAddress;
        const port = res.socket.remotePort;
    
        console.log(req.url);
        console.log(req.body);
    
        console.log(`你的IP地址是 ${ip}，你的源端口是 ${port}。`);
    
        res.end(`你的IP地址是 ${ip}，你的源端口是 ${port}。`);
    }).listen(80);
}




module.exports = new AuthSdk();