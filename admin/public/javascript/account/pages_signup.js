function getAes() {
    //var sk = $('#aes').attr("checked");
    //alert(sk + typeof (sk));
    //return sk;
    return true;
}

//将form转为AJAX提交
function ajaxSubmit1(fn, fnFail) {
    console.log('ajaxSubmit1(): ajax请求');
    var aes = getAes();
    console.log('aes: ' + aes);
    $.ajax({
        url: "../account_api/get_temp_account",
        type: "post",
        data: { aes: aes },
        success: fn
    });
}

function ajaxSubmit2(fnSuccess, fnFail) {
    console.log('ajaxSubmit2(): ajax请求');
    var dataPara = getFormJson();
    var aes = getAes();
    
    var url = "../account_api/signup_nickname_account";
    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

//将form中的值转换为键值对。
function getFormJson() {
    console.log('getFormJson()');

    var o = {};
    var item_list = ["#input-nickname", "#input-password"];
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
$(document).ready(function () {
    console.log('配置页面');
    $("#btn-submit-get-temp-account").click(function () {
        console.log('点击"快速开始"');
        ajaxSubmit1(function (data) {
            console.log(data.msg);
            alert(data.msg);
            if (data.err) {
                console.log(data.err);
                return;
            }
            console.log(data.data);
            console.log(data.aes);
            aes = data.aes;
            // 从数据中获取昵称并显示在对话框中
            if (data != null && data.data != null) {
                data = CryptoUtil.aes_decrypt(data.data, aes);
                var tempname = data.tempname;
                console.log(tempname);
                $('#input-temp-account').val(tempname);
            }
            else {
                console.log("data == null");
            }
        });
    });
    $("#btn-submit-signup-nickname-account").click(function () {
        console.log('点击"昵称注册"');
        ajaxSubmit2(function (data) {
            //console.log(data);
            console.log(data.msg);
            alert(data.msg);
            if (data.err) {
                console.log(data.err);
                return;
            }
            console.log(data.data);
        });
    });
});