//==============================================================================
// import
//==============================================================================
var _ = require('underscore');
var io = require('socket.io-client');
var admin_common = require('./admin_common');
var SERVER_CFG = require('../../src/cfgs/server_cfg').SERVER_CFG;


//==============================================================================
// const
//==============================================================================
var ERROR = 1;
var DEBUG = 0;

var TAG = "【routes/api/admin_match】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getEnterPoolInfo = getEnterPoolInfo;
exports.getPlazaInfo = getPlazaInfo;


//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 获取报名池的信息
 */
function getEnterPoolInfo(req, res) {
    const FUNC = TAG + "getEnterPoolInfo()---";
    
    console.log(FUNC + "CALL...");
    
    var data = admin_common.getDataObj(req);

    connectEnterpool(function(cache) {
        admin_common.response('获取报名池的信息', res, null, cache);
    });
}

/**
 * 获取房间服的信息
 */
function getPlazaInfo(req, res) {
    const FUNC = TAG + "getPlazaInfo()---";
    
    console.log(FUNC + "CALL...");

    var data = admin_common.getDataObj(req);

    connectPlaza(function(roominfo) {
        admin_common.response('获取房间服的信息', res, null, roominfo);
    });

}


//==============================================================================
// private
//==============================================================================

function connectEnterpool(cb) {
    const FUNC = TAG + "connectEnterPool() --- ";
    var socket = socketConnect();
    socket.on('connect', function () {
        console.log(FUNC + " connect to query api...");
        
        // 获取报名池信息
        socket.emit('get_enterpool_info', function(cache) {
            cb(cache);
            socket.disconnect();
        });
    });

    function socketConnect() {
        var socket = null;
        if (SERVER_CFG.HTTP) {
            socket = io.connect(SERVER_CFG.ADDRESS.ENTERPOOL_QUERY_API.HTTP);
        }
        else if (SERVER_CFG.HTTPS) {
            socket = io.connect(SERVER_CFG.ADDRESS.ENTERPOOL_QUERY_API.HTTPS);
        }
        return socket;
    }
}

function connectPlaza(cb) {
    const FUNC = TAG + "connectPlaza() --- ";
    var socket = socketConnect();
    socket.on('connect', function () {
        console.log(FUNC + " connect to query api...");
        
        // 获取报名池信息
        socket.emit('get_plaza_info', function(cache) {
            console.log(FUNC + "cache return:\n", cache);
            cb(cache);
            socket.disconnect();
        });
    });

    function socketConnect() {
        var socket = null;
        var api_url = null;
        if (SERVER_CFG.HTTP) {
            api_url = SERVER_CFG.ADDRESS.ROOM_QUERY_API.HTTP;
        }
        else if (SERVER_CFG.HTTPS) {
            api_url = SERVER_CFG.ADDRESS.ROOM_QUERY_API.HTTPS;
        }
        console.log(FUNC + "api_url:\n", api_url);
        socket = io.connect(api_url);
        return socket;
    }
}