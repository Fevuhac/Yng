const soap = require('soap');
const crypto = require('crypto');
const util = require('util');


const PARTNER_CODE = "xbom1"
const PARTNER_KEY = "8a7e933170658b3e369fb61d104d5303";
const SERVICE_URL = "http://27.118.16.46:1581/VPGService.asmx?wsdl";

const PAY_COMMAND_CODE = {
    USECARD: 'usecard',
    BUYCARD: 'buycard',
}

const PAY_SERVICE_CODE = {
    USECARD:"cardtelco",
    BUYCARD:"buycard"
};

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

class UseCardProtocol {
    constructor(cardCode, cardSerial, cardType, accountName, appCode, refCode) {
        this._cardCode = cardCode || '';
        this._cardSerial = cardSerial || '';
        this._cardType = cardType || '';
        this._accountName = accountName || ''; //合作方在系统的账号名字
        this._appCode = appCode || '';
        this._refCode = refCode || '';
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


class BuyCardProtocol {
    constructor(cardType, amount, quantity, accountName, orderNo) {
        this._provider = cardType || ''; //供应商
        this._amount = amount || ''; //卡价值
        this._quantity = quantity || ''; //数量
        this._accountName = accountName || '';//合作方在系统的账号名字
        this._orderNo = orderNo || ''; //参考码（对方的订单码-小于50记号，不重复的字串）
    }

    toString() {
        let json = {
            provider: this._provider,
            amount: this._amount,
            quantity: this._quantity,
            accountName: this._accountName,
            orderNo: this._orderNo
        };
        return JSON.stringify(json);
    }
}

class VietnamPay {
    constructor() {

    }

    static md5(input) {
        let md5sum = crypto.createHash('md5');
        md5sum.update(input);
        return md5sum.digest('hex');;
    }

    static buildReq(data, serviceCode, pay_command_code) {
        let originalData = PARTNER_CODE + serviceCode + pay_command_code + data.toString() + PARTNER_KEY;
        let signature = VietnamPay.md5(originalData);
        let req_ata = {
            partnerCode: PARTNER_CODE,
            serviceCode: serviceCode,
            commandCode: pay_command_code,
            requestContent: data.toString(),
            signature: signature
        }
        return req_ata;
    }


    static useCard(cardCode, cardSerial, cardType, accountName, cb) {
        let payCard = new UseCardProtocol(cardCode, cardSerial, cardType, accountName);
        VietnamPay.request(SERVICE_URL, VietnamPay.buildReq(payCard, PAY_SERVICE_CODE.USECARD, PAY_COMMAND_CODE.USECARD), cb);
    }

    static buyCard(cardType, amount, quantity, accountName, orderNo, cb) {
        let buyCard = new BuyCardProtocol(cardType, amount, quantity, accountName, orderNo);     
        VietnamPay.request(SERVICE_URL, VietnamPay.buildReq(buyCard, PAY_SERVICE_CODE.BUYCARD, PAY_COMMAND_CODE.BUYCARD), cb);
    }

    //{ RequestResult: '{"ResponseCode":-310,"Description":"Access denied","ResponseContent":"","Signature":"33cd7be5c72731b43f355ae522f5b444"}' }
    static request(url, req, cb) {
        soap.createClient(url, function (err, client) {
            if (err) {
                console.log('--------', err);
                cb(ERROR.SYSTEM_ERROR);
                return;
            }
            client.Request(req, function (err, resp) {
                if (err) {
                    cb(err);
                    return;
                }
                console.log(resp);
                let ret_obj = JSON.parse(resp.RequestResult);
                if (1 == ret_obj.ResponseCode) {
                    cb(null, ret_obj.ResponseContent);
                } else {
                    cb({
                        code: ret_obj.ResponseCode,
                        msg: ret_obj.Description
                    });
                }

            });
        });

    }
}


module.exports = VietnamPay;

// VietnamPay.useCard('29356495346552', '36330400022120', 'vnp', 'acc00001', function(err, result){
//     console.log(err, result)
// });

// VietnamPay.buyCard('vnp', 10000,  1, 'acc00001', 'fsfsdafsdafdsfd', function(err, result){
//     console.log(err, result)
// });