function getAes() {
    return true;
}

function ajaxSubmit(fnSuccess, fnFail) {
    var dataPara = getFormJson();
    console.log('ajaxSubmit1(): ajax请求');
    
    var aes = getAes();
    
    var url = "../account_api/change_password";
    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

//将form中的值转换为键值对。
function getFormJson() {
    console.log('getFormJson()');
    
    var o = {};
    var item_list = ["#input-nickname", "#input-old-pwd", "#input-new-pwd"];
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
    $("#btn-change-pwd").click(function () {
        console.log('点击"修改密码"');
        ajaxSubmit(function (data) {
            console.log(data.msg);
            alert(data.msg);
            if (data.err) {
                console.log(data.err);
                return;
            }
            if (data.data) {
                console.log(data.data);
                aes = data.aes;
                // 从数据中获取昵称并显示在对话框中
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