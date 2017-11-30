/**
 * 设置按钮"添加用户"的响应代码
 */
function setBtnAdd() {
    $("#btn-add-user").click(function () {
        console.log('点击"添加用户"');
        _clickBtnAddUser(function (data) {
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
            }
            else {
                console.log("data == null");
            }
        });
    });
}

function _clickBtnAddUser(fnSuccess, fnFail) {
    console.log('_clickBtnAddUser(): ajax请求');
    
    var dataPara = HttpUtil.getFormJson([
        "#input-user-name",
        "#input-user-pwd",
        "#input-user-role"
    ]);
    var aes = getAes();
    var url = getBaseUrl() + "/admin_api/mgmt/add_user";
    
    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}