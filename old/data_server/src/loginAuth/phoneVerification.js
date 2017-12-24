const buzz_cst_error = require('../buzz/cst/buzz_cst_error');
class PhoneVerification {
    constructor() {
        this._codeMap = new Map();
        this._codeMap.set('11111111111', {
            verifyCode: 1233,
            validTime: 6000000,
            timestamp: Date.now()
        })

        this._codeMap.set('11111111112', {
            verifyCode: 1233,
            validTime: 6000000,
            timestamp: Date.now()
        })

        this._codeMap.set('11111111113', {
            verifyCode: 1233,
            validTime: 6000000,
            timestamp: Date.now()
        })

        this._codeMap.set('11111111114', {
            verifyCode: 1233,
            validTime: 6000000,
            timestamp: Date.now()
        })


        this._codeMap.set('11111111115', {
            verifyCode: 1233,
            validTime: 6000000,
            timestamp: Date.now()
        })

        this._codeMap.set('11111111116', {
            verifyCode: 1233,
            validTime: 6000000,
            timestamp: Date.now()
        })

        this._codeMap.set('222222222222', {
            verifyCode: 1233,
            validTime: 6000000,
            timestamp: Date.now()
        })

        this._codeMap.set('12222222223', {
            verifyCode: 1233,
            validTime: 6000000,
            timestamp: Date.now()
        })

        this._codeMap.set('322222222222', {
            verifyCode: 1233,
            validTime: 6000000,
            timestamp: Date.now()
        })
    }

    //获取手机验证码
    async sendPhoneCode(data) {
        //todo:调用短信平台
        let code = this._codeMap.get(data.phone);
        return {
            validTime: code.validTime / 1000
        }
    }

    async getPhoneCode(phone) {
        // data.phone = '11111111111';
        let code = this._codeMap.get(data.phone);

        return code;
    }


    async checkPhoneCodeValid(data) {
        let self = this;
                    
        console.log('--------checkPhoneCodeValid:', data);
        return new Promise(function (resolve, reject) {
            let code = self._codeMap.get(data.phone);
            if (!code || Date.now() - code.timestamp >= code.validTime) {
                console.log('验证码过期');
                reject(buzz_cst_error.ERROR_OBJ.PHONE_CODE_EXPIRE.msg)
            }
            
            console.log('--------checkPhoneCodeValid:', data);
            if (data.verifyCode != code.verifyCode) {
                console.log('验证码不正确');
                reject(buzz_cst_error.ERROR_OBJ.PHONE_CODE_ERROR.msg)
            }

            return resolve(null);
        });
    }

    //TODO:通过短信平台发送短信
    _sendSMS() {

    }


}

module.exports = new PhoneVerification();