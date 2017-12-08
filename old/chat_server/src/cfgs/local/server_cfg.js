let YXL_IP = "127.0.0.1";
let DFC_IP = "127.0.0.1";
let COMMON_IP = "127.0.0.1";
var SERVERB_ADDRESS = COMMON_IP;
var SERVER1_ADDRESS = COMMON_IP;

var SERVER_CFG = {
    PATH_TO_PRIVATE_PEM: "F:/svn/project/FishjoyServer/cert/ca-key.pem",
	PATH_TO_FILE_CRT: "F:/svn/project/FishjoyServer/cert/ca-cert.pem",
	HTTP_PORT: 5001,
	HTTP: true,
	HTTPS_PORT: 15001,
	HTTPS: false,
    // 以下是服务器ID, 需要每次配置时注意修改
    SID: 1,

    DB: {
        host: 'localhost',
        user: 'root',
        pwd: 'root',
        database: 'fishjoy',
    },

	ADDRESS: {
        /** 负载均衡服地址及端口 */
        // TODO: 其他配置的修改
        BALANCE_SERVER: {
            // IP: "http://" + SERVERB_ADDRESS,
            IP: SERVERB_ADDRESS,
            PORT: "1338",
        },
        /** 报名池查询API */
        ENTERPOOL_DATA_API: {
            IP: "http://" + SERVER1_ADDRESS,
            PORT: "3009",
        },
        /** 报名池查询API */
        ENTERPOOL_QUERY_API: {
            HTTP: "http://" + SERVER1_ADDRESS + ":4747/query_api",
            HTTPS: "https://" + SERVER1_ADDRESS + ":14747/query_api",
        },
        /** 广场服管理API */
        ROOM_ADMIN_API: {
            HTTP: "http://" + SERVER1_ADDRESS + ":4901/plaza/admin_api",
            HTTPS: "https://" + SERVER1_ADDRESS + ":14901/plaza/admin_api",
        },
        /** 广场服查询API */
        ROOM_QUERY_API: {
            HTTP: "http://" + SERVER1_ADDRESS + ":4901/plaza/query_api",
            HTTPS: "https://" + SERVER1_ADDRESS + ":14901/plaza/query_api",
        },
    },

	SYSTEM: {
        WINDOWS: 1,
        LINUX: 0,
        COMMAND: "tar_cfgs.bat",
        SYSTIME: "time_m.bat",
    },

    REDIS:{
        RDS_PORT : 6379,
        RDS_HOST : '127.0.0.1',
        RDS_PWD : '',
        RDS_OPTS : {auth_pass : ''}
    }
};
exports.SERVER_CFG = SERVER_CFG;
