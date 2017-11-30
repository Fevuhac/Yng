/**
 * 设置按钮"添加角色"的响应代码
 */
function setBtnAdd() {
    $("#btn-add-role").click(function () {
        console.log('点击"添加角色"');
        // TODO: 发送请求
        _clickBtnAddRole(function (data) {
            // TODO: 处理返回后的请求，修改权限列表
            console.log(data.msg);
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
                console.log(data);
            }
            else {
                console.log("data == null");
            }
        });
    });
}

function _clickBtnAddRole(fnSuccess, fnFail) {
    console.log('_clickBtnAddRole(): ajax请求');
    
    var dataPara = HttpUtil.getFormJson([
        "#input-role-name",
        "#input-role-description",
        "#input-role-auth"
    ]);
    var aes = getAes();
    var url = getBaseUrl() + "/admin_api/mgmt/add_role";
    
    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}