/**
 * 设置按钮"禁止"的响应代码
 */
function setBtnDelete() {
    $(".btn-auth-delete").click(function () {
        console.log('点击"禁止"');
        
        var $thisBtn = $(this);
        var $parent = $(this).parent().parent();
        console.log("$parent: " + $parent.html());
        console.log("auth-id: " + $parent.find(".auth-id").html());

        var auth_id = parseInt($parent.find(".auth-id").html());

        _clickBtnDeleteAuth(auth_id, function (data) {

            console.log(data.msg);
            if (data.err) {
                console.log(data.err);
                return;
            }
            console.log(data.data);
            console.log(data.aes);
            aes = data.aes;

            if (data != null && data.data != null) {
                data = CryptoUtil.aes_decrypt(data.data, aes);
                console.log(data);
                _resetButtn($thisBtn, false);
            }
            else {
                console.log("data == null");
            }
        });
    });
    $(".btn-auth-valid").click(function () {
        console.log('点击"激活"');
        
        var $thisBtn = $(this);
        var $parent = $(this).parent().parent();
        console.log("$parent: " + $parent.html());
        console.log("auth-id: " + $parent.find(".auth-id").html());
        
        var auth_id = parseInt($parent.find(".auth-id").html());
        
        _clickBtnValidAuth(auth_id, function (data) {
            
            console.log(data.msg);
            if (data.err) {
                console.log(data.err);
                return;
            }
            console.log(data.data);
            console.log(data.aes);
            aes = data.aes;
            
            if (data != null && data.data != null) {
                data = CryptoUtil.aes_decrypt(data.data, aes);
                console.log(data);
                _resetButtn($thisBtn, true);
            }
            else {
                console.log("data == null");
            }
        });
    });
}

function _resetButtn($btn, isValid) {
    // 注意: 按钮的绑定是一开始就做好了的，如果只改变按钮的属性并不会改变按钮的行为
    // 需要改变按钮的行为需要更多的代码来实现这个过程

    //console.log("isValid: " + isValid);
    //if (isValid) {
    //    console.log("按钮文字变为禁止");
    //    $btn.removeClass("btn-auth-valid");
    //    $btn.addClass("btn-auth-delete");
    //    $btn.text("禁止");
    //}
    //else {
    //    console.log("按钮文字变为激活");
    //    $btn.removeClass("btn-auth-delete");
    //    $btn.addClass("btn-auth-valid");
    //    $btn.text("激活");
    //}

    _refresh();
}

function _refresh() {
    window.location.reload();
}

function _clickBtnDeleteAuth(auth_id, fnSuccess, fnFail) {
    console.log('_clickBtnDeleteAuth(): ajax请求');
    
    var dataPara = { auth_id: auth_id };
    var aes = getAes();
    var url = getBaseUrl() + "/admin_api/mgmt/delete_auth";
    
    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

function _clickBtnValidAuth(auth_id, fnSuccess, fnFail) {
    console.log('_clickBtnValidAuth(): ajax请求');
    
    var dataPara = { auth_id: auth_id };
    var aes = getAes();
    var url = getBaseUrl() + "/admin_api/mgmt/valid_auth";
    
    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}