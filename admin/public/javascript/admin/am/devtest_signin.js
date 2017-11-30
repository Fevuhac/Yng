function signinTempAccount(fnSuccess, fnFail) {
    console.log('signinTempAccount(): ajax请求');
    
    var dataPara = { nickname: $('#input-temp-account').val() }
    var aes = getAes();
    var url = getBaseUrl() + "/account_api/login_temp_account";

    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

function signinNicknameAccount(fnSuccess, fnFail) {
    console.log('signinNicknameAccount(): ajax请求');
    
    var dataPara = getFormJsonSigninNicknameAccount();
    var aes = getAes();
    var url = getBaseUrl() + "/account_api/login_nickname_account";

    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

function signinChannelAccount(fnSuccess, fnFail) {
    console.log('signinNicknameAccount(): ajax请求');
    
    var dataPara = getFormJsonSigninChannelAccount();
    var aes = getAes();
    var url = getBaseUrl() + "/account_api/login_channel_account";
    
    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

//将form中的值转换为键值对。
function getFormJsonSigninNicknameAccount() {
    console.log('getFormJsonSigninNicknameAccount()');

    var o = {};
    var item_list = ["#input-signup-nickname", "#input-signup-password"];
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
function getFormJsonSigninChannelAccount() {
    console.log('getFormJsonSigninChannelAccount()');
    
    var o = {};
    var item_list = ["#input-signup-channel", "#input-signup-channel-id"];
    for (var i = 0; i < item_list.length; i++) {
        var $input = $(item_list[i]);
        var attr_name = $input.attr('name');
        var attr_val = $input.val();
        console.log(attr_name + ': ' + attr_val);
        o[attr_name] = attr_val || '';
    }
    
    return o;
}

function setAccountData(data) {
    // DONE: 将获取的用户ID设置到class='account-id'中
    $('.account-id').val(data.id);
    // DONE: 将获取的用户token设置到class='account-token'中
    $('.account-token').val(data.token);
    // DONE: 将获取的用户gold设置到class='account-gold'中
    $('.account-gold').val(data.gold);
    // DONE: 将获取的用户pearl设置到class='account-pearl'中
    $('.account-pearl').val(data.pearl);
}

function setSignin() {
    console.log('setSignin()');

    $("#btn-signin-temp-account").click(function () {
        console.log('点击"登录"');
        signinTempAccount(function (data) {
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
                setAccountData(data);
            }
            else {
                console.log("data == null");
            }
        });
    });
    $("#btn-signin-nickname-account").click(function () {
        console.log('点击"登录"');
        signinNicknameAccount(function (data) {
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
                setAccountData(data);
            }
            else {
                console.log("data == null");
            }
        });
    });
    $("#btn-signin-channel-account").click(function () {
        console.log('点击"登录"');
        signinChannelAccount(function (data) {
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
                setAccountData(data);
            }
            else {
                console.log("data == null");
            }
        });
    });
}