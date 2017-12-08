// var SERVER1_ADDRESS = "211.159.173.200";
var SERVER1_ADDRESS = "bulao9.tcdn.szhlsg.com";

var SERVER_CFG = {
    PATH_TO_PRIVATE_PEM: "/home/server/cert/ca-key.pem",
    PATH_TO_FILE_CRT: "/home/server/cert/ca-cert.pem",
    HTTP_PORT: 5001,
    HTTP: 0,
    HTTPS_PORT: 15001,
    HTTPS: 1,
    // 以下是服务器ID, 需要每次配置时注意修改
    SID: 1,

    REDIS: {
        RDS_PORT: 6379,
        // RDS_HOST: '10.66.122.41',
        // RDS_PWD: 'bulao@test1234',
        RDS_HOST: '10.66.232.136',
        RDS_PWD: 'crs-cwxtb7al:pwd1234@^@',
    },
    
    DB:  {
        host: '10.66.204.213',
        user: 'root',
        pwd: 'Ch123456',
        // database: 'fishjoy_test',
        database: 'fishjoy',         // 数据库名
    },

    ADDRESS:  {
        /** 报名池查询API */
        ENTERPOOL_DATA_API: {
            IP: "http://" + SERVER1_ADDRESS,
            IPS: "https://" + SERVER1_ADDRESS,
            PORT: "3109",
            PORTS: "13109",
        },
        /** 报名池查询API */
        ENTERPOOL_QUERY_API: {
            HTTP: "http://" + SERVER1_ADDRESS + ":4748/query_api",
            HTTPS: "https://" + SERVER1_ADDRESS + ":14748/query_api",
        },
        /** 广场服管理API */
        ROOM_ADMIN_API: {
            HTTP: "http://" + SERVER1_ADDRESS + ":4902/plaza/admin_api",
            HTTPS: "https://" + SERVER1_ADDRESS + ":14902/plaza/admin_api",
        },
        /** 广场服查询API */
        ROOM_QUERY_API: {
            HTTP: "http://" + SERVER1_ADDRESS + ":4902/plaza/query_api",
            HTTPS: "https://" + SERVER1_ADDRESS + ":14902/plaza/query_api",
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