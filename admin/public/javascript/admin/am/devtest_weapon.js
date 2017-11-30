function sendWeaponLog(fnSuccess, fnFail) {
    console.log('sendWeaponLog(): ajax请求');

    var dataPara = getFormJsonWeaponData();
    var aes = getAes();
    var url = getBaseUrl() + "/data_api/add_weapon_log";
    
    // 转化vip_weapon_id为数组对象
    //dataPara.vip_weapon_id = JSON.parse(dataPara.vip_weapon_id);

    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

//将form中的值转换为键值对。
function getFormJsonWeaponData() {
    console.log('getFormJsonWeaponData()');
    var o = {};
    var item_list = ["#input-account-id", "#input-account-token", "#input-weapon-level", "#input-weapon-type", "#input-weapon-vip"];
    for (var i = 0; i < item_list.length; i++) {
        var $input = $(item_list[i]);
        var attr_name = $input.attr('name');
        var attr_val = $input.val();
        console.log(attr_name + ': ' + attr_val);
        o[attr_name] = attr_val || '';
    }
    
    return o;
}

//调用
function setWeapon() {
    $("#btn-add-weapon-log").click(function () {
        console.log('点击"发送记录"');
        sendWeaponLog(function (data) {
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