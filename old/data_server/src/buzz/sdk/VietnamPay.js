const soap = require('soap');
const crypto = require('crypto');
const util = require('util');
const vietnamPayConfig = require('./payConfig').vietnam;

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
        this._accountName = accountName || ''; //合作方在系统的账号名字
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
        this._servers = vietnamPayConfig.servers;

        this._servers = this._servers.filter(function (server) {
            return server.percent != 0;
        })
    }

    _md5(input) {
        let md5sum = crypto.createHash('md5');
        md5sum.update(input);
        return md5sum.digest('hex');;
    }

    _buildReq(data, serviceCode, partner_code, partner_key, pay_command_code) {
        let originalData = partner_code + serviceCode + pay_command_code + data.toString() + partner_key;
        let signature = this._md5(originalData);
        let req_ata = {
            partnerCode: partner_code,
            serviceCode: serviceCode,
            commandCode: pay_command_code,
            requestContent: data.toString(),
            signature: signature
        }
        return req_ata;
    }

    async _useCardHandler(useCard, cb) {

        let last_err = null;
        this._servers.sort(function (a, b) {
            return Math.random() > 0.5 ? -1 : 1;
        });
        for (let i = 0; i < this._servers.length; ++i) {
            let server = this._servers[i];

            if (server.recharge >= server.percent / 100 * vietnamPayConfig.payBalance) {
                continue;
            }

            let req = this._buildReq(useCard, server.service_code, server.partner_code, server.partner_key, vietnamPayConfig.command.useCard);
            try {
                let amount = await this.request(server.url, req);
                server.recharge += amount;
                console.log('server id:', server.id, server.recharge);
                cb(null, amount);
                return;
            } catch (err) {
                last_err = err;
            }
        }

        if (!last_err) {
            console.log('充值池充值完成');
            this._servers.map(function (item) {
                item.recharge = 0;
                return item;
            });
            console.log('充值池充值完成', [...this._servers]);
            this._useCardHandler(useCard, cb);
            return;

        }

        cb(last_err);
    }

    async _buyCardHandler(buyCard, cb) {
        let last_err = null;
        for (let i = 0; i < this._servers.length; ++i) {
            let server = this._servers[i];

            let req = this._buildReq(buyCard, server.service_code, server.partner_code, server.partner_key, vietnamPayConfig.command.buyCard);
            try {
                let amount = await this.request(server.url, req);
                cb(null, amount);
                return;
            } catch (err) {
                last_err = err;
            }
        }

        cb(last_err);
    }

    useCard(cardCode, cardSerial, cardType, accountName, cb) {
        let useCard = new UseCardProtocol(cardCode, cardSerial, cardType, accountName);
        this._useCardHandler(useCard, cb);
    }

    buyCard(cardType, amount, quantity, accountName, orderNo, cb) {
        let buyCard = new BuyCardProtocol(cardType, amount, quantity, accountName, orderNo);
        this._buyCardHandler(buyCard, cb)
    }

    //{ RequestResult: '{"ResponseCode":-310,"Description":"Access denied","ResponseContent":"","Signature":"33cd7be5c72731b43f355ae522f5b444"}' }
    request(url, req) {
        return new Promise(function (resolve, reject) {
            soap.createClient(url, function (err, client) {
                if (err) {
                    console.log('--------', err);
                    reject(ERROR.SYSTEM_ERROR)
                    return;
                }
                client.Request(req, function (err, resp) {
                    if (err) {
                        reject(err)
                        return;
                    }
                    console.log('-----------pay response:', err, resp);
                    let ret_obj = JSON.parse(resp.RequestResult);
                    if (1 == ret_obj.ResponseCode) {
                        resolve(ret_obj.ResponseContent)
                    } else {
                        // resolve(1000);
                        reject({
                            code: ret_obj.ResponseCode,
                            msg: ret_obj.Description
                        })
                    }

                });
            });

        });
    }
}


module.exports = new VietnamPay();

// let run = true;

// function test() {
//     if (!run) return;
//     setTimeout(function () {

//         let vietnamPay = new VietnamPay();

//         vietnamPay.buyCard('vnp', 10000, 1, 'acc00001', 'fsfsdafsdafdsfd', function (err, result) {
//             console.log(err, result)
//         });
//         // vietnamPay.useCard('29356495346552', '36330400022120', 'vnp', 'acc00001', function (err, result) {
//         //     if (err) run = false;

//         //     console.log(err, result)

//         //     test();
//         // });
//     }, 100);
// }

// test();