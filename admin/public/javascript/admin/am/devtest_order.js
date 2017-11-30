function getOrder(fnSuccess, fnFail) {
    console.log('getOrder(): ajax请求');
    
    var dataPara = HttpUtil.getFormJson([
        "#input-account-id", 
        "#input-account-token"
    ]);
    var aes = getAes();
    var url = getBaseUrl() + "/data_api/get_game_order";
    
    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

function checkOrderStatus(fnSuccess, fnFail) {
    console.log('checkOrderStatus(): ajax请求');
    
    var dataPara = HttpUtil.getFormJson([
        "#input-account-id", 
        "#input-account-token", 
        "#input-order-id"
    ]);
    var aes = getAes();
    var url = getBaseUrl() + "/data_api/check_order_status";
    
    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

function getStatus(status) {
    var ret = "状态未知";
    switch (status) {
        case 0:
            console.log("支付成功");
            ret = "支付成功";
            break;
        case 1:
            console.log("支付失败");
            ret = "支付失败";
            break;
        case 2:
            console.log("支付处理中");
            ret = "支付处理中";
            break;
    }
    console.log("ret: " + ret);
    return ret;
}

function setOrder() {
    $("#btn-get-order").click(function () {
        console.log('点击"订单获取"');
        getOrder(function (data) {
            console.log(data.msg);
            if (data.err) {
                console.log(data.err);
                return;
            }
            if (data.data) {
                aes = data.aes;
                if (data != null && data.data != null) {
                    data = CryptoUtil.aes_decrypt(data.data, aes);
                    console.log(data);
                    var game_order_id = data["game_order_id"];
                    $('#input-order-id').val(game_order_id);
                }
                else {
                    console.log("data == null");
                }
                return;
            }
        });
    });
    $("#btn-check-order-status").click(function () {
        console.log('点击"开始轮询"');
        checkOrderStatus(function (data) {
            console.log(data.msg);
            if (data.err) {
                console.log(data.err);
                return;
            }
            if (data.data) {
                aes = data.aes;
                if (data != null && data.data != null) {
                    data = CryptoUtil.aes_decrypt(data.data, aes);
                    console.log(data);
                    var status = data["status"];
                    console.log(status);
                    $('#input-order-status').val(getStatus(status));
                }
                else {
                    console.log("data == null");
                }
                return;
            }
        });
    });
}