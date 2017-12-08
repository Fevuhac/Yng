//==========================================================
// local
//==========================================================

const HOST_PORT = 5001;

var SERVER_CFG = {
    PATH_TO_PRIVATE_PEM: "/home/server/cert/ca-key.pem",
    PATH_TO_FILE_CRT: "/home/server/cert/ca-cert.pem",
    HTTP_PORT: HOST_PORT,
    HTTP: true,
    HTTPS_PORT: 10000 + HOST_PORT,
    HTTPS: false,

    DB: {
        host: '172.16.1.11',
        user: 'root',
        pwd: 'Chufeng123456',
        database: 'fishjoy',
    },

    //redis地址
    REDIS: {
        RDS_PORT: 6379,
        RDS_HOST: '172.16.1.12',
        RDS_PWD: 'Chufeng123456',
    },
};
exports.SERVER_CFG = SERVER_CFG;