const CryptoJS = require("crypto-js");
const configReader = require('../config/configReader');

function packMsg(data, enc) {

    // console.time('packMsg');
    let _enc = enc || 'aes';
    let msg = {
        enc:_enc
    };

    if(_enc === 'aes'){
    // if(0){
        try {
            let encrypt_data = CryptoJS.AES.encrypt(JSON.stringify(data), configReader.sysConfig.KEYS);
            msg.data = encodeURIComponent(encrypt_data);  
        } catch (error) {
            logger.error('packMsg exction --- ', error);
            msg.data = '';
        }

    }else {
        msg.data = data;
    }
    // console.log(msg.data.length);
    // console.timeEnd('packMsg');
    return msg
}

module.exports = packMsg;