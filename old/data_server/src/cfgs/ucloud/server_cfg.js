var SERVERB_ADDRESS = "106.75.95.208";
var SERVER1_ADDRESS = "106.75.95.208";
var SERVERC_ADDRESS = "127.0.0.1";

var SERVER_CFG = {
    PATH_TO_PRIVATE_PEM: "/home/server/cert/ca-key.pem",
	PATH_TO_FILE_CRT: "/home/server/cert/ca-cert.pem",
	HTTP_PORT: 3001,
	HTTP: true,
	HTTPS_PORT: 13001,
	HTTPS: false,
    // 以下是服务器ID, 需要每次配置时注意修改
    SID: 1,

    REDIS: {
        RDS_PORT: 6379,
        RDS_HOST: '10.19.145.195',
        RDS_PWD: 'Chu13579_Redis',
    },

    DB:  {
        host: '10.19.95.223',
        user: 'fjclient',
        pwd: 'fjclient@FishJoy2017',
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
        /** 图片服务器地址*/
        IMG_SERVER:{
            IP: SERVERC_ADDRESS,
            IPS: SERVERC_ADDRESS,
            PORT: "6700",
            PORTS: "16700"
        }
    },

    SYSTEM:  {
        WINDOWS: 0,
        LINUX: 1,
        COMMAND: "/home/server/fjs/tar_cfgs.sh",
        SYSTIME: "/home/server/shell/time_m.sh",
    },
};
exports.SERVER_CFG = SERVER_CFG;