$(document).ready(function () {
    if (getLan()) {
        setLan(getLan());
    }
    else {
        setLan($('#lan_selector').val());
    }
    $('#lan_selector').change(function () {
        var val = $(this).val();
        console.log(val);
        setLan(val);
    });
});

function getLan() {
    return localStorage.getItem('lan');
}

function setLan(lan) {
    $.cookie('locale', lan);
    localStorage.setItem('lan', lan);
    $("#lan_selector").find("option[value='" + lan + "']").attr("selected", true);
    switch (lan) {
        case 'zh-CN':
            $('#label_uname').html('用户名');
            $('#label_pwd').html('密码');
            break;
        case 'en-US':
            $('#label_uname').html('User Name');
            $('#label_pwd').html('Password');
            break;
        case 'vi-VN':
            $('#label_uname').html('Tên người dùng');
            $('#label_pwd').html('Mật mã.');
            break;
    }
}


function login() {
    console.log('login(): ajax请求');
    var params = { token: sessionStorage.getItem('user_token') };
    var url = getBaseUrl() + "/home";

    console.log('url: ', url);
    console.log('params: ', params);

    simulateFormPost(url, params);
}

// 模拟form
function simulateFormPost(URL, PARAMS) {
    var temp_form = document.createElement("form");
    temp_form.action = URL;
    temp_form.target = "_self";
    temp_form.method = "post";
    temp_form.style.display = "none";
    for (var x in PARAMS) {
        var opt = document.createElement("textarea");
        opt.name = x;
        opt.value = PARAMS[x];
        temp_form.appendChild(opt);
    }
    document.body.appendChild(temp_form);
    temp_form.submit();
}


function adminSignin(fnSuccess, fnFail) {
    console.log('adminSignin(): ajax请求');
    var dataPara = HttpUtil.getFormJson([
        "#input-username",
        "#input-password"
    ]);

    console.log('dataPara:', dataPara);

    var aes = getAes();
    var url = getBaseUrl() + "/admin_api/mgmt/signin";
    console.log('aes:', aes);
    HttpUtil.post(url, dataPara, aes, fnSuccess, fnFail, Cfg.http_type);
}