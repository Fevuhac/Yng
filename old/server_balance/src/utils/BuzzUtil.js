


var StringUtil = require('./StringUtil');
var DateUtil = require('./DateUtil');

var SERVER_CFG = require('../cfgs/server_cfg').SERVER_CFG;


exports.getOrderId = getOrderId;
exports.getServerUrlById = getServerUrlById;
exports.getServerInfoById = getServerInfoById;

function getOrderId(sn) {
    return DateUtil.format(new Date(), "yyyyMMdd") + fillNumber(sn, '0', 10);
}

/**
 * 根据用户ID获取当前所在服务器URL(192.168.35.220:1337)
 */
function getServerUrlById(server_id) {
    var api_server_cfg = SERVER_CFG.API_SERVER_LIST.HTTP;
    var net_type = "http://";
    if (SERVER_CFG.HTTPS) {
        api_server_cfg = SERVER_CFG.API_SERVER_LIST.HTTPS;
    	net_type = "https://";
    }
    for (var i = 0; i < api_server_cfg.length; i++) {
        var server_info = api_server_cfg[i];
        if (server_info.server_id == server_id) {
            return net_type + server_info.server_ip + ":" + server_info.server_port;
        }
    }
    return null;
}

/**
 * 根据用户ID获取当前所在服务器URL(192.168.35.220:1337)
 */
function getServerInfoById(server_id) {
    var api_server_cfg = SERVER_CFG.API_SERVER_LIST.HTTP;
    var net_type = "http://";
    if (SERVER_CFG.HTTPS) {
        api_server_cfg = SERVER_CFG.API_SERVER_LIST.HTTPS;
    	net_type = "https://";
    }
    for (var i = 0; i < api_server_cfg.length; i++) {
        var server_info = api_server_cfg[i];
        if (server_info.server_id == server_id) {
            return server_info;
        }
    }
    return null;
}

function fillNumber(input, fill_char, total_length) {
    var cur_length = StringUtil.strLen("" + input);
    console.log('total_length: ' + total_length);
    console.log('cur_length: ' + cur_length);
    for (var i = 0; i < total_length - cur_length; i++) {
        input = fill_char + input;
    }
    console.log('input: ' + input);
    return input;
}