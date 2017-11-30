var game_cst ={
    key : 'THIS_IS_A_TEST_KEY1029384756',
    version : '',
};

var CryptoUtil = {
    /**
     * 加密.
     * @data 需要加密的数据(string or json_obj)
     * @aes 是否需要加密
     */
    aes_encrypt: function (data, aes, base64) {
        if (aes == true || aes == "true") {
            if (data.constructor != String) {
                data = JSON.stringify(data);
            }
            var ciphertext = CryptoJS.AES.encrypt(data, game_cst.key).toString();
            console.log("aes: " + ciphertext);
            // 对数据再进行base64编码
            if (base64 == true || base64 == "true") {
                ciphertext = base64_encode(ciphertext, true);
                //ciphertext = ciphertext.toString(CryptoJS.enc.Base64);
                console.log("base64: " + ciphertext);
            }
            return ciphertext;
        }
        else {
            return data;
        }
    },
    /**
     * 解密.
     * @data 需要解密的数据(string or json_obj)
     * @aes 是否需要解密
     */
    aes_decrypt: function (data, aes) {
        if (aes == true || aes == "true") {
            if (data.constructor != String) {
                data = JSON.stringify(data);
            }
            var plaintext = CryptoJS.AES.decrypt(data, game_cst.key).toString(CryptoJS.enc.Utf8);
            console.log("plaintext: " + plaintext);
            return JSON.parse(plaintext);
        }
        else {
            return data;
        }
    },
};