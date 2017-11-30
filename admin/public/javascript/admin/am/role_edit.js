/**
 * 设置按钮"修改角色"的响应代码
 */
function setBtnEdit() {
    $(".btn-role-edit").click(function () {
        console.log('点击"修改"');
        var $thisBtn = $(this);
        _clickBtnEditRole($thisBtn, function (data) {
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
                console.log(data);
            }
            else {
                console.log("data == null");
            }
        });
    });
}

function _clickBtnEditRole($thisBtn, fnSuccess, fnFail) {
    console.log('_clickBtnEditRole(): ajax请求');

    var $parent = $thisBtn.parent().parent();

    var rname = $parent.find("input[name='rname']").val();
    var description = $parent.find("input[name='description']").val();
    var auth_ids = $parent.find("input[name='auth_ids']").val();
    var id = $parent.find("input[name='id']").val();

    console.log("rname: " + rname);
    console.log("description: " + description);
    console.log("auth_ids: " + auth_ids);
    console.log("id: " + id);
    
    var dataPara = {
        role_name: rname,
        role_description: description,
        role_auth: auth_ids,
        role_id: id
    };
    var aes = getAes();
    var url = getBaseUrl() + "/admin_api/mgmt/edit_role";
    
    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}