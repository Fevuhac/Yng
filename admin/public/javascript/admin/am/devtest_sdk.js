function callSdkApi(fnSuccess, fnFail) {
    console.log('callSdkApi(): ajax请求');

    var dataPara = getFormJsonCallSdkApi();
    var aes = getAes();
    var url = getBaseUrl() + "/account_api/call_sdk_api";

    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

//将form中的值转换为键值对。
function getFormJsonCallSdkApi() {
    console.log('getFormJsonCallSdkApi()');
    var o = {};
    //var item_list = ["#input-sdk-api", "#input-sdk-params", "#input-sdk-token"];
    var item_list = ["#input-sdk-api", "#input-sdk-token"];
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
    
    o["channel"] = getChannel();
    
    return o;
}

function getChannel() {
    var base_url = "1001";
    var input_url = $("#select-channel").val();
    if (input_url != null && input_url != "") {
        base_url = input_url;
    }
    return base_url;
}

//调用
function setSdk() {
    $("#btn-send-sdk-request").click(function () {
        console.log('点击"提交"');
        callSdkApi(function (data) {
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