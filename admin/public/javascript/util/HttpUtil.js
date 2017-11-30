////////////////////////////////////////////////////////////
// HttpUtil
// ---------------------------------------------------------
// 网络请求相关方法
// ---------------------------------------------------------
// 使用举例
// HttpUtil.func()
// ---------------------------------------------------------
// 工具列表
// get()
// post()
////////////////////////////////////////////////////////////


var _TYPE_JQUERY_AJAX = 1;
var _TYPE_XML_HTTP_REQUEST = 2;

var HttpUtil = {
    TYPE_JQUERY_AJAX: _TYPE_JQUERY_AJAX,
    TYPE_XML_HTTP_REQUEST: _TYPE_XML_HTTP_REQUEST,
    get: _get,
    post: _post,
    getFormJson: _getFormJson,
    simulateFormPost: _simulateFormPost,
};

/**
 * GET方式获取服务器数据.
 * @url
 * @fnSuccess
 * @fnFail
 */
function _get(url, fnSuccess, fnFail, type) {
    switch (type) {
        case _TYPE_JQUERY_AJAX:
            $.ajax({
                url: url,
                type: "get",
                data: null,
                success: fnSuccess,
                fail: fnFail
            });
            break;

        case _TYPE_XML_HTTP_REQUEST:
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    //console.log('xhr.responseText: ' + xhr.responseText);
                    fnSuccess(JSON.parse(xhr.responseText));
                }
            };
            xhr.open("GET", url, true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

            xhr.send();
            
            break;
    }
}

/**
 * POST方式获取服务器数据.
 * @url
 * @data string 向服务器发送的请求参数
 * @fnSuccess
 * @fnFail
 */
function _post(url, data, aes, fnSuccess, fnFail, type) {
    if (aes) {
        data = CryptoUtil.aes_encrypt(data, aes);
    }
    $.ajax({
        url: url,
        type: "post",
        data: {data: data, aes: aes},
        success: fnSuccess,
        fail: fnFail
    });
}

function _getFormJson(item_list) {
    console.log('getFormJson()');
    
    var o = {};
    for (var i = 0; i < item_list.length; i++) {
        var $input = $(item_list[i]);
        var attr_name = $input.attr('name');
        var attr_val = $input.val();
        console.log(attr_name + ': ' + attr_val);
        o[attr_name] = attr_val || '';
    }
    
    return o;
}

// 模拟form
function _simulateFormPost(URL, PARAMS) {
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