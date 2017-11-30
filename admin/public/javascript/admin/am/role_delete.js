/**
 * 设置按钮"禁止"的响应代码
 */
function setBtnDelete() {
    $(".btn-role-delete").click(function () {
        console.log('点击"禁止"');
        
        var $thisBtn = $(this);
        var $parent = $(this).parent().parent();
        console.log("$parent: " + $parent.html());
        console.log("role-id: " + $parent.find(".role-id").val());

        var role_id = parseInt($parent.find(".role-id").val());

        _clickBtnDeleteRole(role_id, function (data) {

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
    $(".btn-role-valid").click(function () {
        console.log('点击"激活"');
        
        var $thisBtn = $(this);
        var $parent = $(this).parent().parent();
        console.log("$parent: " + $parent.html());
        console.log("role-id: " + $parent.find(".role-id").val());
        
        var role_id = parseInt($parent.find(".role-id").val());
        
        _clickBtnValidRole(role_id, function (data) {
            
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
    _refresh();
}

function _refresh() {
    window.location.reload();
}

function _clickBtnDeleteRole(role_id, fnSuccess, fnFail) {
    console.log('_clickBtnDeleteRole(): ajax请求');
    
    var dataPara = { role_id: role_id };
    var aes = getAes();
    var url = getBaseUrl() + "/admin_api/mgmt/delete_role";
    
    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

function _clickBtnValidRole(role_id, fnSuccess, fnFail) {
    console.log('_clickBtnValidRole(): ajax请求');
    
    var dataPara = { role_id: role_id };
    var aes = getAes();
    var url = getBaseUrl() + "/admin_api/mgmt/valid_role";
    
    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}