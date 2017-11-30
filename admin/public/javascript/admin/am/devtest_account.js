function logout(fnSuccess, fnFail) {
    console.log('logout(): ajax请求');
    
    var dataPara = getFormJsonAccount();
    var aes = getAes();
    var url = getBaseUrl() + "/account_api/logout_account";

    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

function getDayReward(fnSuccess, fnFail) {
    console.log('getDayReward(): ajax请求');
    
    var dataPara = getFormJsonAccount();
    var aes = getAes();
    var url = getBaseUrl() + "/data_api/get_day_reward";

    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

function getOnlineTime(fnSuccess, fnFail) {
    console.log('getOnlineTime(): ajax请求');

    var dataPara = getFormJsonAccount();
    var aes = getAes();
    var url = getBaseUrl() + "/data_api/get_online_time";

    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

function getBroke(fnSuccess, fnFail) {
    console.log('getBroke(): ajax请求');

    var dataPara = getFormJsonAccount();
    var aes = getAes();
    var url = getBaseUrl() + "/data_api/get_bankruptcy_compensation";

    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

// 都是以账户ID和token作为参数
function getFormJsonAccount() {
    console.log('getFormJsonAccount()');
    return HttpUtil.getFormJson([
        "#input-account-id",
        "#input-account-token"
    ]);
}

function setAccount() {
    $("#btn-logout-account").click(function () {
        console.log('点击"退出登录"');
        logout(function (data) {
            console.log(data.msg);
            alert(data.msg);
            if (data.err) {
                console.log(data.err);
                return;
            }
            console.log(data.data);
            // DONE: 置空class='account-id'
            $('.account-id').val('');
            // DONE: 置空class='account-token'
            $('.account-token').val('');
        });
    });
    $("#btn-get-day-reward").click(function () {
        console.log('点击"领取签到奖励"');
        getDayReward(function (data) {
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
        getOnlineTime(function (data) {
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
    $("#btn-get-broke").click(function () {
        console.log('点击"破产领取"');
        getBroke(function (data) {
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