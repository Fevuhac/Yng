//==========================================================
// wanba
// myqcloud
// szhlsg
//==========================================================

// let SERVER0_ADDRESS = "bulao.tcdn.szhlsg.com";
// let SERVER0_ADDRESS = "211.159.173.200";
let SERVER0_ADDRESS = "bulao9.tcdn.szhlsg.com";

// let SERVER1_ADDRESS = "211.159.173.200";
let SERVER1_ADDRESS = "bulao9.tcdn.szhlsg.com";

// let SERVER1_ADDRESS = "bulao1.tcdn.szhlsg.com";
// let SERVER_DOWNLOAD = '211.159.173.200';
let SERVER_DOWNLOAD = "bulao9.tcdn.szhlsg.com";
let SERVER_FIGHTING = "bulao9.tcdn.szhlsg.com";

var FJB_HTTP_PORT = 3110;
var FJB_HTTPS_PORT = 13110;

var FJS_HTTP_PORT = "3101";
var FJS_HTTPS_PORT = "13101";

var SERVER_CFG = {
    PATH_TO_PRIVATE_PEM: "/home/server/cert/ca-key.pem",
	PATH_TO_FILE_CRT: "/home/server/cert/ca-cert.pem",
    HTTP_PORT: FJB_HTTP_PORT,
    HTTP: 1,
    HTTPS_PORT: FJB_HTTPS_PORT,
    HTTPS: 0,

    API_SERVER_LIST: {
        HTTP: [
            {
                server_id: 1,
                server_ip: SERVER0_ADDRESS,
                server_port: FJS_HTTP_PORT,
            }
        ],
        HTTPS: [
            {
                server_id: 1,
                server_ip: SERVER0_ADDRESS,
                server_port: FJS_HTTPS_PORT,
            }
        ]
    },

	MSGBOARD_SERVER: {
        HTTP: {
            server_ip: SERVER0_ADDRESS,
            server_port: FJS_HTTP_PORT,
        },
        HTTPS: {
            server_ip: SERVER0_ADDRESS,
            server_port: FJS_HTTPS_PORT,
        }
    },

	BALANCE_SERVER: {
        HTTP: {
            server_ip: SERVER0_ADDRESS,
            server_port: "" + FJB_HTTP_PORT,
        },
        HTTPS: {
            server_ip: SERVER0_ADDRESS,
            server_port: "" + FJS_HTTPS_PORT,
        }
    },

	ENTER_SERVER: {
        HTTP: {
            server_ip: SERVER1_ADDRESS,
            server_port: "4748",
        },
        HTTPS: {
            server_ip: SERVER1_ADDRESS,
            server_port: "14748",
        }
    },

    DOWNLOAD_SERVER:{
        HTTP: {
            server_ip: SERVER_DOWNLOAD,
            server_port: "1700",
        },
        HTTPS: {
            server_ip: SERVER_DOWNLOAD,
            server_port: "11700",
        }
    },

    FIGHTING_SERVER:{
        HTTP: {
            server_ip: SERVER_FIGHTING,
            server_port: "3021",
        },
        HTTPS: {
            server_ip: SERVER_FIGHTING,
            server_port: "13021",
        }
    },

	DB: {
        host: '10.66.204.213',
        user: 'root',
        pwd: 'Ch123456',
        // database: 'fishjoy_test',
        database: 'fishjoy',         // 数据库名
    },
};
exports.SERVER_CFG = SERVER_CFG;