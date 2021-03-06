﻿function sendPearlLog(fnSuccess, fnFail) {
    console.log('sendPearlLog(): ajax请求');

    var dataPara = getFormJsonPearlLog();
    var aes = getAes();
    var url = getBaseUrl() + "/data_api/add_pearl_log";

    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

//将form中的值转换为键值对。
function getFormJsonPearlLog() {
    console.log('getFormJsonPearlLog()');
    var o = {};
    var item_list = ["#input-account-id", "#input-account-token", "#input-pearl-total", "#input-pearl-data"];
    for (var i = 0; i < item_list.length; i++) {
        var $input = $(item_list[i]);
        var attr_name = $input.attr('name');
        var attr_val = $input.val();
        console.log(attr_name + ': ' + attr_val);
        if (attr_name == "group") {
            attr_val = JSON.parse(attr_val);
        }
        o[attr_name] = attr_val || '';
    }
    
    return o;
}

//调用
function setPearl() {
    $("#btn-add-pearl-log").click(function () {
        console.log('点击"发送珍珠记录"');
        sendPearlLog(function (data) {
            console.log(data.msg);
            alert(data.msg);
            if (data.err) {
                console.log(data.err);
                return;
            }
            if (data.data) {
                console.log(data.data);
                console.log(data.aes);
                aes = data.aes;
                if (data != null && data.data != null) {
                    data = CryptoUtil.aes_decrypt(data.data, aes);
                    console.log(data);
                }
                else {
                    console.log("data == null");
                }
                return;
            }
        });
    });
};