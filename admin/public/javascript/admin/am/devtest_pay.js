function simulatePay(fnSuccess, fnFail) {
    console.log('simulatePay(): ajax请求');

    var dataPara = getFormJson([
        "#input-pay-server-id",
        "#input-pay-goods-id",
        "#input-pay-goods-number",
        "#input-pay-ext"
    ]);
    var aes = getAes();
    var url = getBaseUrl() + "/data_api/simulate_egret_pay";

    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);

    //$.ajax({
    //    url: url,
    //    type: "post",
    //    data: dataPara,
    //    success: fnSuccess,
    //    fail: fnFail
    //});
}

function simulatePayCallback(fnSuccess, fnFail) {
    console.log('simulatePayCallback(): ajax请求');
    
    var dataPara = getFormJson([
        "#input-pay-order-id",
        "#input-pay-id",
        "#input-pay-money",
        "#input-pay-time",
        "#input-pay-server-id",
        "#input-pay-goods-id",
        "#input-pay-goods-number",
        "#input-pay-ext",
        "#input-pay-sign"
    ]);
    var aes = getAes();
    var url = getBaseUrl() + "/data_api/callback_egret_pay";
    
    $.ajax({
        url: url,
        type: "post",
        data: dataPara,
        success: fnSuccess,
        fail: fnFail
    });
}

function getFormJson(item_list) {
    console.log('getFormJson()');
    var o = {};
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
function setPay() {
    $("#btn-simulate-egret-pay").click(function () {
        console.log('点击"支付"');
        simulatePay(function (data) {
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
    $("#btn-simulate-egret-pay-callback").click(function () {
        console.log('点击"回调"');
        simulatePayCallback(function (data) {
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
}