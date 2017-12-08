//==========================================================
// wanba
// myqcloud
// szhlsg
//==========================================================

// var SERVER0_ADDRESS = "211.159.155.61";
var SERVER0_ADDRESS = "bulao.tcdn.szhlsg.com";

// var SERVER1_ADDRESS = "58.87.105.192";
var SERVER1_ADDRESS = "bulao1.tcdn.szhlsg.com";

// var SERVER2_ADDRESS = "58.87.69.167";
var SERVER2_ADDRESS = "bulao2.tcdn.szhlsg.com";

// var SERVER3_ADDRESS = "58.87.95.24";
var SERVER3_ADDRESS = "bulao3.tcdn.szhlsg.com";

// var SERVER4_ADDRESS = "211.159.162.80";
var SERVER4_ADDRESS = "bulao4.tcdn.szhlsg.com";

// var SERVER5_ADDRESS = "58.87.84.46";
var SERVER5_ADDRESS = "bulao5.tcdn.szhlsg.com";

// var SERVER6_ADDRESS = "58.87.96.206";
var SERVER6_ADDRESS = "bulao6.tcdn.szhlsg.com";

// var SERVER7_ADDRESS = "211.159.148.149";
var SERVER7_ADDRESS = "bulao7.tcdn.szhlsg.com";

var FJB_HTTP_PORT = 3010;
var FJB_HTTPS_PORT = 13010;

var FJS_HTTP_PORT = "3001";
var FJS_HTTPS_PORT = "13001";

var SERVER_CFG = {
    PATH_TO_PRIVATE_PEM: "/home/server/cert/ca-key.pem",
	PATH_TO_FILE_CRT: "/home/server/cert/ca-cert.pem",
    HTTP_PORT: FJB_HTTP_PORT,
    HTTP: false,
    HTTPS_PORT: FJB_HTTPS_PORT,
    HTTPS: true,

    ServerRange:[
        [[1, 100000]],
        [[100001, 120000]],
        [[120001, 140000]],
        [[140001, 160000]],
        [[160001, 180000]],
        [[180001, 200000]],
    ],

    S1Range:[1, 100000],
    S2Range:[100001, 200000],
    S3Range:[200001, 300000],
    S4Range:[300001, 400000],
    S5Range:[400001, 500000],

    API_SERVER_LIST: {
        HTTP: [
            {
                server_id: 1,
                server_ip: SERVER2_ADDRESS,
                server_port: FJS_HTTP_PORT,
            }
            ,{
                server_id: 2,
                server_ip: SERVER3_ADDRESS,
                server_port: FJS_HTTP_PORT,
            }
            ,{
                server_id: 3,
                server_ip: SERVER4_ADDRESS,
                server_port: FJS_HTTP_PORT,
            }
            ,{
                server_id: 4,
                server_ip: SERVER5_ADDRESS,
                server_port: FJS_HTTP_PORT,
            }
            ,{
                server_id: 5,
                server_ip: SERVER6_ADDRESS,
                server_port: FJS_HTTP_PORT,
            }
            ,{
                server_id: 6,
                server_ip: SERVER7_ADDRESS,
                server_port: FJS_HTTP_PORT,
            }
        ],
        HTTPS: [
            {
                server_id: 1,
                server_ip: SERVER2_ADDRESS,
                server_port: FJS_HTTPS_PORT,
            }
            ,{
                server_id: 2,
                server_ip: SERVER3_ADDRESS,
                server_port: FJS_HTTPS_PORT,
            }
            ,{
                server_id: 3,
                server_ip: SERVER4_ADDRESS,
                server_port: FJS_HTTPS_PORT,
            }
            ,{
                server_id: 4,
                server_ip: SERVER5_ADDRESS,
                server_port: FJS_HTTPS_PORT,
            }
            ,{
                server_id: 5,
                server_ip: SERVER6_ADDRESS,
                server_port: FJS_HTTPS_PORT,
            }
            ,{
                server_id: 6,
                server_ip: SERVER7_ADDRESS,
                server_port: FJS_HTTPS_PORT,
            }
        ]
    },

	MSGBOARD_SERVER: {
        HTTP: {
            server_ip: SERVER2_ADDRESS,
            server_port: FJS_HTTP_PORT,
        },
        HTTPS: {
            server_ip: SERVER2_ADDRESS,
            server_port: FJS_HTTPS_PORT,
        }
    },

	BALANCE_SERVER: {
        HTTP: {
            server_ip: SERVER2_ADDRESS,
            server_port: "" + FJB_HTTP_PORT,
        },
        HTTPS: {
            server_ip: SERVER2_ADDRESS,
            server_port: "" + FJS_HTTPS_PORT,
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
        host: '10.66.204.213',
        user: 'root',
        pwd: 'Ch123456',
        database: 'fishjoy',
    },
};
exports.SERVER_CFG = SERVER_CFG;