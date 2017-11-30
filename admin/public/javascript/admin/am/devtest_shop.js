function sendShopLog(fnSuccess, fnFail) {
    console.log('sendShopLog(): ajax请求');

    var dataPara = getFormJsonShopData();
    var aes = getAes();
    var url = "../data_api/add_shop_log";
    
    console.log('url: ' + url);

    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

//将form中的值转换为键值对。
function getFormJsonShopData() {
    console.log('getFormJsonShopData()');
    var o = {};
    var item_list = ["#input-account-id", "#input-account-token", "#input-item-id", "#input-item-type", "#input-item-amount", "#input-item-total"];
    for (var i = 0; i < item_list.length; i++) {
        var $input = $(item_list[i]);
        var attr_name = $input.attr('name');
        var attr_val = $input.val();
        console.log(attr_name + ': ' + attr_val);
        o[attr_name] = attr_val || '';
    }
    
    return o;
}

//调用
function setShop() {
    $("#btn-add-shop-log").click(function () {
        console.log('点击"发送商城记录"');
        sendShopLog(function (data) {
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