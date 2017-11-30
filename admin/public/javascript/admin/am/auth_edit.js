/**
 * 设置按钮"添加权限"的响应代码
 */
function setBtnEdit() {
    $(".btn-auth-edit").click(function () {
        console.log('点击"修改"');
        var $thisBtn = $(this);
        _clickBtnEditAuth($thisBtn, function (data) {
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

function _clickBtnEditAuth($thisBtn, fnSuccess, fnFail) {
    console.log('_clickBtnEditAuth(): ajax请求');

    var $parent = $thisBtn.parent().parent();

    var page = $parent.find("input[name='page']").val();
    var description = $parent.find("input[name='description']").val();
    var parent = $parent.find("input[name='parent']").val();
    var level = $parent.find("input[name='level']").val();
    var id = $parent.find("input[name='id']").val();
    console.log("page: " + page);
    
    var dataPara = {
        auth_page: page,
        auth_description: description,
        auth_parent: parent,
        auth_level: level,
        auth_id: id
    };
    var aes = getAes();
    var url = getBaseUrl() + "/admin_api/mgmt/edit_auth";
    
    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}