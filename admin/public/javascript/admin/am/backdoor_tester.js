////////////////////////////////////////////////////////////////////////////////
// 测试账号相关设置
////////////////////////////////////////////////////////////////////////////////

// 初始化, 绑定按钮事件
function setTester() {
    console.log("【CALL】 setTester");

    $("#btn-account-forbidden").click(function () {
        console.log("【CLICK】 btn-account-forbidden");
        accountForbidden(function (data) {
            handleResponse(data);
            alert("账号已经被禁止");
        });
    });
    
    $("#btn-account-ban").click(function () {
        console.log("【CLICK】 btn-account-ban");
        accountBan(function (data) {
            handleResponse(data);
            alert("玩家已经被封号");
        });
    });

    $("#btn-account-auth").click(function () {
        console.log("【CLICK】 btn-account-auth");
        accountAuth(function (data) {
            handleResponse(data);
            alert("账号权限已设置");
        });
    });

    $("#btn-account-match-on").click(function () {
        console.log("【CLICK】 btn-account-match-on");
        matchOn(function (data) {
            handleResponse(data);
            alert("账号排位赛已开启");
        });
    });

    $("#btn-account-match-off").click(function () {
        console.log("【CLICK】 btn-account-match-off");
        matchOff(function (data) {
            handleResponse(data);
            alert("账号排位赛已关闭");
        });
    });

    $("#btn-account-cik-on").click(function () {
        console.log("【CLICK】 btn-account-cik-on");
        cikOn(function (data) {
            handleResponse(data);
            alert("账号实物兑换功能已开启");
        });
    });

    $("#btn-account-cik-off").click(function () {
        console.log("【CLICK】 btn-account-cik-off");
        cikOff(function (data) {
            handleResponse(data);
            alert("账号实物兑换功能已关闭");
        });
    });
}

function accountForbidden(fnSucc, fnFail) {
    var uid = $("#input-tester-uid").val();

    var dataPara = {
        uid: uid,
    };

    var url = getBaseUrl() + "/admin_api/account_forbidden";

    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}

function accountBan(fnSucc, fnFail) {
    var uid = $("#input-tester-uid").val();

    var dataPara = {
        token: "admin",
        uid_list: uid,
    };

    var url = getBaseUrl() + "/data_api/ban_user";

    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}

function accountAuth(fnSucc, fnFail) {
    var uid = $("#input-tester-uid").val();
    var test = $("#input-tester-auth").val();

    var dataPara = {
        uid: uid,
        test: test,
    };

    var url = getBaseUrl() + "/admin_api/account_auth";

    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}

//==========================================================
// Match

function matchOn(fnSucc, fnFail) {
    var uid = $("#input-tester-uid").val();

    var dataPara = {
        uid: uid,
        action: "on",
    };

    var url = getBaseUrl() + "/admin_api/match_switch";

    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}

function matchOff(fnSucc, fnFail) {
    var uid = $("#input-tester-uid").val();

    var dataPara = {
        uid: uid,
        action: "off",
    };

    var url = getBaseUrl() + "/admin_api/match_switch";

    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}

//==========================================================
// Change In Kind

function cikOn(fnSucc, fnFail) {
    var uid = $("#input-tester-uid").val();

    var dataPara = {
        uid: uid,
        action: "on",
    };

    var url = getBaseUrl() + "/admin_api/cik_switch";

    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}

function cikOff(fnSucc, fnFail) {
    var uid = $("#input-tester-uid").val();

    var dataPara = {
        uid: uid,
        action: "off",
    };

    var url = getBaseUrl() + "/admin_api/cik_switch";

    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}