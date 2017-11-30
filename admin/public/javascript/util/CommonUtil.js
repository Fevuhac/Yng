var DEBUG = 1;
// 共用方法: 处理返回结果
function handleResponse(data, cb) {
    if (DEBUG) console.log("msg:", data.msg);
    if (data.err) {
        if (DEBUG) console.log("err:", data.err);
        if (cb) cb(data.err);
        return;
    }
    if (data.data) {
        if (DEBUG) console.log("data:", data.data);
        if (cb) cb(null, data.data);
        return;
    }
}

/**
 * 发送HTTP请求——GET.
 */
function sendCommandGet(api, fnSucc, fnFail) {
    if (DEBUG) console.log("sendCommandGet");
    sendCommand(api, "get", fnSucc, fnFail);
}

/**
 * 发送HTTP请求——POST.
 */
function sendCommandPost(api, fnSucc, fnFail) {
    if (DEBUG) console.log("sendCommandPost");
    sendCommand(api, "post", fnSucc, fnFail);
}

/**
 * 发送HTTP请求——POST.
 */
function sendPost(url, data, fnSucc, fnFail) {
    if (DEBUG) console.log("url:", url);
    var dataPara = data;
    $.ajax({
        url: url,
        type: "post",
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}

function sendCommand(api, type, fnSucc, fnFail) {
    if (DEBUG) console.log("api:", api);
    var dataPara = {};
    var url = getBaseUrl() + api;
    $.ajax({
        url: url,
        type: type,
        data: { data: JSON.stringify(dataPara) },
        success: fnSucc
    });
}
