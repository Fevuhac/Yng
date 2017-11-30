function sendSkillLog(fnSuccess, fnFail) {
    console.log('sendSkillLog(): ajax请求');

    var dataPara = getFormJsonSkillLog();
    var aes = getAes();
    var url = getBaseUrl() + "/data_api/add_skill_log";

    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

//将form中的值转换为键值对。
function getFormJsonSkillLog() {
    console.log('getFormJsonSkillLog()');
    var o = {};
    var item_list = ["#input-account-id", "#input-account-token", "#input-skill-data"];
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
function setSkill() {
    $("#btn-add-skill-log").click(function () {
        console.log('点击"发送记录"');
        sendSkillLog(function (data) {
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