//==========================================================
// 180
//==========================================================
//var SERVER0_ADDRESS = "120.92.45.236";
var SERVER0_ADDRESS = "2144-bulao1.triumbest.net";
//var SERVER1_ADDRESS = "120.92.116.162";
var SERVER1_ADDRESS = "2144-bulao2.triumbest.net";
var FJB_HTTP_PORT = 3010;
var FJB_HTTPS_PORT = 13010;

var FJS_HTTP_PORT = "3001";
var FJS_HTTPS_PORT = "13001";

var SERVER_CFG = {
    PATH_TO_PRIVATE_PEM: "/home/server/cert/ca-key.pem",
	PATH_TO_FILE_CRT: "/home/server/cert/ca-cert.pem",
	HTTP_PORT: FJB_HTTP_PORT,
	HTTP: true,
	HTTPS_PORT: FJB_HTTPS_PORT,
	HTTPS: false,

    ServerRange:[
        [[1, 100000]],
        [[100001, 120000]],
        [[120001, 140000]],
        [[140001, 160000]],
        [[160001, 180000]],
        [[180001, 200000]]
    ],

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

	DB: {
        host: '172.31.252.131',
        user: 'admin',
        pwd: 'Chu123456',
        database: 'fishjoy',
    },
};
exports.SERVER_CFG = SERVER_CFG;
