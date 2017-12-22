const CryptoJS = require("crypto-js");

function packMsg(data, enc) {
    let _enc = enc || 'aes';
    let msg = {
        enc:_enc
    };

    if(_enc === 'aes'){
        try {
            let encrypt_data = CryptoJS.AES.encrypt(JSON.stringify(data), global.sysConfig.KEYS);
            msg.data = encodeURIComponent(encrypt_data);  
        } catch (error) {
            logger.error('packMsg exction --- ', error);
            msg.data = '';
        }

    }else {
        msg.data = data;
    }
    return msg
}

module.exports = packMsg;