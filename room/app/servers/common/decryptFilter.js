/**
 * 数据揭秘过滤器
 */

const CryptoJS = require("crypto-js");
const sysConfig = require('../../../config/sysConfig');

class DecryptFilter{
    constructor(){
    }

    before(msg, session, next){
        if(msg.enc){
            let bytes = CryptoJS.AES.decrypt(decodeURIComponent(msg.data), sysConfig.KEYS);
            let data = bytes.toString(CryptoJS.enc.Utf8);
            try {
                msg.data = JSON.parse(data);
            }catch (e){
                throw e;
            }
        }
        next();
    }

}

module.exports = new DecryptFilter;