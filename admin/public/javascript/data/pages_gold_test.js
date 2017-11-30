function getAes() {
    return true;
}

function ajaxSubmit(fnSuccess, fnFail) {
    var dataPara = getFormJson();
    console.log('ajaxSubmit(): ajax请求');
    var aes = getAes();
    
    var url = "../data_api/add_gold_log";
    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

//将form中的值转换为键值对。
function getFormJson() {
    console.log('getFormJson()');
    var o = {};
    var item_list = ["#input-account-id", "#input-token", "#input-total", "#input-duration", "#input-group"];
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

function ajaxSubmit1(fnSuccess, fnFail) {
    var dataPara = getFormJson1();
    console.log('ajaxSubmit1(): ajax请求');
    var aes = getAes();
    
    var url = "../data_api/get_bankruptcy_compensation";
    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

//将form中的值转换为键值对。
function getFormJson1() {
    console.log('getFormJson1()');
    var o = {};
    var item_list = ["#input-account-id-2", "#input-token-2"];
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
$(document).ready(function () {
    $("#btn-add-gold-log").click(function () {
        console.log('点击"发送记录"');
        ajaxSubmit(function (data) {
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
    $("#btn-get-broke").click(function () {
        console.log('点击"破产领取"');
        ajaxSubmit1(function (data) {
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
});