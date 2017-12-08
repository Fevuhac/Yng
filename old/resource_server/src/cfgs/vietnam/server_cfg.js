const HOST_PORT = 6700;

const SERVER_CFG = {
    PATH_TO_PRIVATE_PEM: "/home/server/cert/ca-key.pem",
    PATH_TO_FILE_CRT: "/home/server/cert/ca-cert.pem",
    HTTP_PORT: HOST_PORT,
    HTTP: true,
    HTTPS_PORT: 10000 + HOST_PORT,
    HTTPS: false,
};
exports.SERVER_CFG = SERVER_CFG;