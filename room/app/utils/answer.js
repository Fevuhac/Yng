const CryptoJS = require("crypto-js");
const configReader = require('../config/configReader');

function ResponseNoData(result) {
    let res = {};
    res.result = result;
    return res;
}

ResponseNoData.prototype.toString = function () {
    return JSON.stringify(this);
};

function ResponseData(data,enc) {
    let res = {
        msg:{}
    };
    res.result = CONSTS.SYS_CODE.OK;
    if(enc){
        res.msg.enc = enc;
        let encrypt_data = CryptoJS.AES.encrypt(JSON.stringify(data), configReader.sysConfig.KEYS);
        res.msg.data = encodeURIComponent(encrypt_data);
    }
    else {
        res.msg.data = data;
    }
    return res;
}

ResponseData.prototype.toString = function () {
    return JSON.stringify(this);
}

module.exports.respNoData = ResponseNoData;
module.exports.respData = ResponseData;