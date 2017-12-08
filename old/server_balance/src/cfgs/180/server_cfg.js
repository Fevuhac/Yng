//==========================================================
// 180
//==========================================================
var SERVER0_ADDRESS = "192.169.7.180";
var SERVER1_ADDRESS = "192.169.7.180";
var SERVERC_ADDRESS = "192.169.7.180";

var FJB_HTTP_PORT = 3010;
var FJB_HTTPS_PORT = 3011;

var FJS_HTTP_PORT = "80";
var FJS_HTTPS_PORT = "11337";

var FJC_HTTP_PORT = "80";
var FJC_HTTPS_PORT = "15001";

var SERVER_CFG = {
    PATH_TO_PRIVATE_PEM: "/home/server/cert/ca-key.pem",
	PATH_TO_FILE_CRT: "/home/server/cert/ca-cert.pem",
	HTTP_PORT: FJB_HTTP_PORT,
	HTTP: true,
	HTTPS_PORT: FJB_HTTPS_PORT,
	HTTPS: false,

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
            server_port: "" + FJB_HTTPS_PORT,
        }
    },

	ENTER_SERVER: {
        HTTP: {
            server_ip: SERVER1_ADDRESS,
            server_port: "4747",
        },
        HTTPS: {
            server_ip: SERVER1_ADDRESS,
            server_port: "14747",
        }
    },

    CHAT_SERVER: {
        HTTP: {
            server_ip: SERVERC_ADDRESS,
            server_port: FJC_HTTP_PORT,
        },
        HTTPS: {
            server_ip: SERVERC_ADDRESS,
            server_port: "15001",
        }
    },

	DB: {
        host: 'localhost',
        user: 'root',
        pwd: 'root',
        database: 'fishjoy',
    },
};
exports.SERVER_CFG = SERVER_CFG;