//==========================================================
// import
//==========================================================
// var server_cfg = require('./local/server_cfg');
// var server_cfg = require('./180/server_cfg');
var server_cfg = require('./ucloud/server_cfg');
// var server_cfg = require('./wanba/server_cfg');


//==========================================================
// exports
//==========================================================
exports.API_SERVER_LIST = server_cfg.API_SERVER_LIST;
exports.MSGBOARD_SERVER = server_cfg.MSGBOARD_SERVER;
exports.BALANCE_SERVER = server_cfg.BALANCE_SERVER;
exports.ENTER_SERVER = server_cfg.ENTER_SERVER;
exports.DB = server_cfg.DB;
