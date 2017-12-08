//var SERVERB_ADDRESS = "120.92.45.236";
var SERVERB_ADDRESS = "2144-bulao1.triumbest.net";
//var SERVER1_ADDRESS = "120.92.116.162";
var SERVER1_ADDRESS = "2144-bulao2.triumbest.net";

var SERVER_CFG = {
    PATH_TO_PRIVATE_PEM: "/home/server/cert/ca-key.pem",
	PATH_TO_FILE_CRT: "/home/server/cert/ca-cert.pem",
	HTTP_PORT: 3001,
	HTTP: true,
	HTTPS_PORT: 13001,
	HTTPS: false,

    // 以下是服务器ID, 需要每次配置时注意修改
    SID: 1,

    DB:  {
        host: '172.31.252.131',
        user: 'admin',
        pwd: 'Chu123456',
        database: 'fishjoy',
    },

    ADDRESS:  {
        /** 负载均衡服地址及端口 */
        BALANCE_SERVER: {
            IP: SERVERB_ADDRESS,
            PORT: "3010",
        },
        /** 报名池查询API */
        ENTERPOOL_DATA_API: {
            IP: "http://" + SERVER1_ADDRESS,
            IPS: "https://" + SERVER1_ADDRESS,
            PORT: "3009",
            PORTS: "13009",
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

    SYSTEM:  {
        WINDOWS: 0,
        LINUX: 1,
        COMMAND: "/home/server/fjs/tar_cfgs.sh",
        SYSTIME: "/home/server/shell/time_m.sh",
    },
};
exports.SERVER_CFG = SERVER_CFG;
