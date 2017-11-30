//将form转为AJAX提交
function signupTempAccount(fn, fnFail) {
    console.log('signupTempAccount(): ajax请求');

    var aes = getAes();
    var url = getBaseUrl() + "/account_api/get_temp_account";

    $.ajax({
        url: url,
        type: "post",
        data: { aes: aes },
        success: fn
    });
}

function signupNicknameAccount(fnSuccess, fnFail) {
    console.log('signupNicknameAccount(): ajax请求');

    var dataPara = HttpUtil.getFormJson([
        "#input-signup-nickname",
        "#input-signup-password"
    ]);
    var aes = getAes();
    var url = getBaseUrl() + "/account_api/signup_nickname_account";

    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

function signupChannelAccount(fnSuccess, fnFail) {
    console.log('signupChannelAccount(): ajax请求');
    
    var dataPara = HttpUtil.getFormJson([
        "#input-signup-channel",
        "#input-signup-channel-id",
        "#input-signup-channel-name",
        "#input-signup-channel-info"
    ]);
    var aes = getAes();
    var url = getBaseUrl() + "/account_api/signup_channel_account";
    
    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

function channelLogin(fnSuccess, fnFail) {
    console.log('channelLogin(): ajax请求');
    
    var dataPara = HttpUtil.getFormJson([
        "#input-channel-uid"
    ]);
    var aes = getAes();
    var url = getBaseUrl() + "/account_api/channel_login";
    
    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

function setSignup() {
    console.log("setSignup()");

    $("#btn-signup-temp-account").click(function () {
        console.log('点击"注册临时账户"');
        signupTempAccount(function (data) {
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
    $("#btn-signup-nickname-account").click(function () {
        console.log('点击"注册昵称账户"');
        signupNicknameAccount(function (data) {
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
    $("#btn-signup-channel-account").click(function () {
        console.log('点击"注册渠道账户"');
        signupChannelAccount(function (data) {
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

    $("#btn-channel-login").click(function () {
        console.log('点击"点击游戏按钮"');
        channelLogin(function (data) {
            console.log(data.msg);
            alert(data.msg);
            if (data.err) {
                console.log(data.err);
                return;
            }
            console.log(data.data);
        });
    });
}