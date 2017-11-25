const soap = require('soap');
const crypto = require('crypto');
const util = require('util');


const PARTNER_CODE = "xbom1"
const SERVICE_CODE = "cardtelco";
const PARTNER_KEY = "8a7e933170658b3e369fb61d104d5303";
const SERVICE_URL = "http://27.118.16.46:1581/VPGService.asmx?wsdl";

const PAY_COMMAND_CODE = {
    USECARD: 'usecard',
}

const ERROR = {
    SUCCESS: {
        code: 1,
        desc: '成功'
    },
    PARAM_ERROR: {
        code: -323,
        desc: '卡参数不对'
    },
    CARD_USED: {
        code: -330,
        desc: '已经使用的卡'
    },
    CARD_LOCK: {
        code: -331,
        desc: '已被锁的卡'
    },
    CARD_EXPIRED: {
        code: -332,
        desc: '过期的卡'
    },
    CARD_NOT_ACTIVE: {
        code: -333,
        desc: '未激活的卡'
    },
    CARD_CODE_INVALID: {
        code: -334,
        desc: '卡code无效'
    },
    CARD_SERIAL_INVALID: {
        code: -335,
        desc: '卡serial无效'
    },
    CARD_TYPE_INVALID: {
        code: -336,
        desc: '卡type参数无效'
    },
    CARD_TYPE_INVALID: {
        code: -337,
        desc: '卡type错误'
    },
    CARD_PROVIDER_INVALID: {
        code: -327,
        desc: '找不到合适供应商'
    },
    SYSTEM_ERROR: {
        code: -301,
        desc: '系统错误'
    },
    ACCOUNT_RECHARGE_LOCK: {
        code: -49,
        desc: '账号充值被锁定'
    },
}

class PayCard {
    constructor(cardCode, cardSerial, cardType, accountName, appCode, refCode) {
        this._cardCode = cardCode || '';
        this._cardSerial = cardSerial || '';
        this._cardType = cardType || '';
        this._accountName = accountName || '';
        this._appCode = appCode || '';
        this._refCode = refCode || '';
    }

    set cardSerial(value) {
        this._cardSerial = value;
    }

    set cardCode(value) {
        this._cardCode = value;
    }

    set cardType(value) {
        this._cardType = value;
    }

    set accountName(value) {
        this._accountName = value;
    }

    set refCode(value) {
        this._refCode = value;
    }

    set appCode(value) {
        this._appCode = value;
    }

    toString() {
        let json = {
            cardSerial: this._cardSerial,
            cardCode: this._cardCode,
            cardType: this._cardType,
            accountName: this._accountName,
            refCode: this._refCode,
            appCode: this._appCode
        };
        return JSON.stringify(json);
    }
}

class UCLoudPayCard {
    constructor() {

    }

    static md5(input) {
        let md5sum = crypto.createHash('md5');
        md5sum.update(input);
        return md5sum.digest('hex');;
    }

    static buildReq(data) {
        let originalData = PARTNER_CODE + SERVICE_CODE + PAY_COMMAND_CODE.USECARD + data.toString() + PARTNER_KEY;
        let signature = UCLoudPayCard.md5(originalData);
        let req_ata = {
            partnerCode: PARTNER_CODE,
            serviceCode: SERVICE_CODE,
            commandCode: PAY_COMMAND_CODE.USECARD,
            requestContent: data.toString(),
            signature: signature
        }

        console.log('data:', req_ata);
        return req_ata;
    }


    static async useCard(cardCode, cardSerial, cardType, accountName) {
        let payCard = new PayCard(cardCode, cardSerial, cardType, accountName);
        let req = UCLoudPayCard.buildReq(payCard);
        let a = await UCLoudPayCard.request(SERVICE_URL, req);
    }

    //{ RequestResult: '{"ResponseCode":-310,"Description":"Access denied","ResponseContent":"","Signature":"33cd7be5c72731b43f355ae522f5b444"}' }
    static request(url, req) {
        let promise = new Promise(function (resolve, reject) {
            soap.createClient(url, function (err, client) {
                client.Request(req, function (err, resp) {
                    if (1 == resp.RequestResult.ResponseCode) {
                        resolve();
                    } else {
                        reject()
                    }
                    console.log(resp);
                });
            });
        });

    }
}

UCLoudPayCard.useCard('29356495346552', '36330400022120', 'vnp', 'acc00001');