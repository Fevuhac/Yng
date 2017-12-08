const HOST_PORT = 1337;

//网关服务器
const BALANCE_SERVER_ADDRESS = '119.28.176.122';
const BALANCE_SERVER_PORT = [1338, 11338];

//排位赛报名服
const SERVER_POOL_ADDRESS = "119.28.176.122"
const SERVER_POOL_PORT = 3009

//排位赛服
const SERVER_ROOM_ADDRESS = "119.28.176.122"
const SERVER_ROOM_SOCKET_PORT = 4901

const SERVER_CFG = {
    PATH_TO_PRIVATE_PEM: "/home/server/cert/ca-key.pem",
    PATH_TO_FILE_CRT: "/home/server/cert/ca-cert.pem",
    HTTP_PORT: HOST_PORT,
    HTTP: true,
    HTTPS_PORT: 10000 + HOST_PORT,
    HTTPS: false,
    // 以下是服务器ID, 需要每次配置时注意修改
    SID: 1,
    MAIN_SID: 1,

    //mysql 地址
    DB: {
        host: '172.16.1.11',
        user: 'root',
        pwd: 'Chufeng123456',
        database: 'fishjoy',
    },
    //redis地址
    REDIS:{
        RDS_PORT : 6379,
        RDS_HOST : '172.16.1.12',
        RDS_PWD : 'Chufeng123456',
    },

    ADDRESS: {
        /** 负载均衡服地址及端口 */
        // TODO: 其他配置的修改
        BALANCE_SERVER: {
            IP: BALANCE_SERVER_ADDRESS,
            IPS: BALANCE_SERVER_ADDRESS,
            PORT: BALANCE_SERVER_PORT[0],
            PORTS: BALANCE_SERVER_PORT[1],
        },
        /** 报名池查询API */
        ENTERPOOL_DATA_API: {
            IP: "http://" + SERVER_POOL_ADDRESS,
            PORT: SERVER_POOL_PORT,
        },
        /** 报名池查询API */
        ENTERPOOL_QUERY_API: {
            HTTP: `http://${SERVER_POOL_ADDRESS}:${SERVER_POOL_PORT}/query_api`,
            HTTPS: `https://${SERVER_POOL_ADDRESS}:${10000 + SERVER_POOL_PORT}/query_api`,
        },
        /** 广场服管理API */
        ROOM_ADMIN_API: {
            HTTP: `http://${SERVER_ROOM_ADDRESS}:${SERVER_ROOM_SOCKET_PORT}/plaza/admin_api`,
            HTTPS: `https://${SERVER_ROOM_ADDRESS}:${10000 + SERVER_ROOM_SOCKET_PORT}/plaza/admin_api`,
        },
        /** 广场服查询API */
        ROOM_QUERY_API: {
            HTTP: `http://${SERVER_ROOM_ADDRESS}:${SERVER_ROOM_SOCKET_PORT}/plaza/query_api`,
            HTTPS: `https://${SERVER_ROOM_ADDRESS}:${10000 + SERVER_ROOM_SOCKET_PORT}/plaza/query_api`,
        }
    },

    SYSTEM: {
        WINDOWS: 1,
        LINUX: 0,
        COMMAND: "tar_cfgs.bat",
        SYSTIME: "time_m.bat",
    }
};
exports.SERVER_CFG = SERVER_CFG;