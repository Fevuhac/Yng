function getAes() {
    return true;
}

function ajaxSubmit1(fnSuccess, fnFail) {
    var dataPara = { nickname: $('#input-temp-account').val(), kk: 0 }
    console.log('ajaxSubmit1(): ajax请求');
    
    var aes = getAes();
    
    var url = "../account_api/login_temp_account";
    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

function ajaxSubmit2(fnSuccess, fnFail) {
    var dataPara = getFormJson();
    console.log('ajaxSubmit2(): ajax请求');
    
    var aes = getAes();
    
    var url = "../account_api/login_nickname_account";
    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

function ajaxSubmit3(fnSuccess, fnFail) {
    var dataPara = getFormJson4();
    console.log('ajaxSubmit3(): ajax请求');
    
    var aes = getAes();
    
    var url = "../account_api/logout_account";
    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

function ajaxSubmit4(fnSuccess, fnFail) {
    var dataPara = getFormJson4();
    console.log('ajaxSubmit4(): ajax请求');

    var aes = getAes();
    
    var url = "../data_api/get_day_reward";
    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

function ajaxSubmit5(fnSuccess, fnFail) {
    var dataPara = getFormJson4();
    console.log('ajaxSubmit4(): ajax请求');
    
    var aes = getAes();
    
    var url = "../data_api/get_online_time";
    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

//将form中的值转换为键值对。
function getFormJson4() {
    console.log('getFormJson4()');
    
    var o = {};
    var item_list = ["#input-account-id", "#input-account-token"];
    for (var i = 0; i < item_list.length; i++) {
        var $input = $(item_list[i]);
        var attr_name = $input.attr('name');
        var attr_val = $input.val();
        console.log(attr_name + ': ' + attr_val);
        o[attr_name] = attr_val || '';
    }
    
    return o;
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
            aes = data.aes;
            // 从数据中获取昵称并显示在对话框中
            if (data != null && data.data != null) {
                data = CryptoUtil.aes_decrypt(data.data, aes);
                // 从数据中获取token供客户端存放于本地
                var token = data.token;
                console.log(token);
            }
            else {
                console.log("data == null");
            }
        });
    });
    $("#btn-submit-signup-nickname-account").click(function () {
        console.log('点击"昵称登录"');
        ajaxSubmit2(function (data) {
            console.log(data.msg);
            alert(data.msg);
            if (data.err) {
                console.log(data.err);
                return;
            }
            console.log(data.data);
            aes = data.aes;
            // 从数据中获取昵称并显示在对话框中
            if (data != null && data.data != null) {
                data = CryptoUtil.aes_decrypt(data.data, aes);
                // 从数据中获取token供客户端存放于本地
                var token = data.token;
                console.log(token);
            }
            else {
                console.log("data == null");
            }
        });
    });
    $("#btn-logout-account").click(function () {
        console.log('点击"退出登录"');
        ajaxSubmit3(function (data) {
            console.log(data.msg);
            alert(data.msg);
            if (data.err) {
                console.log(data.err);
                return;
            }
            console.log(data.data);
        });
    });
    $("#btn-get-day-reward").click(function () {
        console.log('点击"领取签到奖励"');
        ajaxSubmit4(function (data) {
            console.log(data.msg);
            alert(data.msg);
            if (data.err) {
                console.log(data.err);
                return;
            }
            console.log(data.data);
        });
    });
    $("#btn-get-online-time").click(function () {
        console.log('点击"获取当前在线时间"');
        ajaxSubmit5(function (data) {
            console.log(data.msg);
            alert(data.msg);
            if (data.err) {
                console.log(data.err);
                return;
            }
            console.log(data.data);
            aes = data.aes;
            // 从数据中获取昵称并显示在对话框中
            if (data != null && data.data != null) {
                data = CryptoUtil.aes_decrypt(data.data, aes);
                // 从数据中获取token供客户端存放于本地
                var online_time = data.online_time;
                console.log(online_time);
            }
            else {
                console.log("data == null");
            }
        });
    });

    $("#btn-get-static").click(function () {
        console.log('点击"获取静态文件"');
        
        function getStatic(fnSuccess, fnFail) {
            console.log('getStatic(): ajax请求');
            var url = "http://192.169.7.180/app_hot_update/assets/version.manifest";
            HttpUtil.get(url, fnSuccess, fnFail, Cfg.http_type);
        }

        getStatic(function (data) {
            console.log(data);
        });
    });
});