//调用
function setUpdateAi() {
    $("#btn-update-ai").click(function () {
        console.log('点击"更新AI"');
        updateAi(function (data) {
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

function updateAi(fnSuccess, fnFail) {
    console.log('updateAi(): ajax请求');
    
    var ai_data = getAiData();
    var dataPara = getFormJsonUpdateAi();
    //dataPara["ai_data"] = JSON.stringify(ai_data);
    dataPara["ai_data"] = ai_data;

    var aes = getAes();
    var url = getBaseUrl() + "/data_api/update_ai";
    
    HttpUtil.post(url, JSON.stringify(dataPara), aes, fnSuccess, fnFail, Cfg.http_type);
}

//将form中的值转换为键值对。
function getAiData() {
    console.log('getAiData()');
    var o = {};
    var item_list = [
        "#wpTimes",
        "#firstFireSeconds",
        "#noFireQuitTimes"
    ];
    for (var i = 0; i < item_list.length; i++) {
        var $input = $(item_list[i]);
        var attr_name = $input.attr('name');
        var attr_val = $input.val();
        console.log(attr_name + ': ' + attr_val);
        if (attr_name == "wpTimes") {
            o[attr_name] = JSON.parse(attr_val) || '';
        }
        if (attr_name == "firstFireSeconds") {
            attr_val = parseFloat(attr_val);
            o[attr_name] = attr_val;
        }
        if (attr_name == "noFireQuitTimes") {
            attr_val = parseFloat(attr_val);
            o[attr_name] = attr_val;
        }
    }
    
    return o;
}

//将form中的值转换为键值对。
function getFormJsonUpdateAi() {
    console.log('getFormJsonUpdateAi()');
    var o = {};
    var item_list = [
        "#input-account-id",
        "#input-account-token"
    ];
    for (var i = 0; i < item_list.length; i++) {
        var $input = $(item_list[i]);
        var attr_name = $input.attr('name');
        var attr_val = $input.val();
        console.log(attr_name + ': ' + attr_val);
        if (attr_name == "group") {
            attr_val = JSON.parse(attr_val);
        }
        o[attr_name] = attr_val || '';
    }
    
    return o;
}

