//==========================================================
// local
//==========================================================

const DATA_SERVER_ADDRESS = "127.0.0.1";
const DATA_SERVER_PORT = 1337;

const CHAT_SERVER_ADDRESS = "127.0.0.1";
const CHAT_SERVER_PORT = 5001;

const BALANCE_SERVER_ADDRESS = "127.0.0.1";
const BALANCE_SERVER_PORT = 1338;

const SERVER_POOL_ADDRESS = "127.0.0.1"
const SERVER_POOL_SOCKET_PORT = 4747

const RESOURCE_SERVER_ADDRESS = "127.0.0.1"
const RESOURCE_SERVER_PORT = 6700

const FIGHTING_SERVER_ADDRESS = "127.0.0.1"
const FIGHTING_SERVER_PORT = 3010

var SERVER_CFG = {
    PATH_TO_PRIVATE_PEM: "/home/server/cert/ca-key.pem",
	PATH_TO_FILE_CRT: "/home/server/cert/ca-cert.pem",
	HTTP_PORT: BALANCE_SERVER_PORT,
	HTTP: true,
	HTTPS_PORT: 10000 + BALANCE_SERVER_PORT,
    HTTPS: false,
    
    DB: {
        host: 'localhost',
        user: 'root',
        pwd: 'root',
        database: 'fishjoy',
    },

    API_SERVER_LIST: {
        HTTP:{
            server_ip: DATA_SERVER_ADDRESS,
            server_port: DATA_SERVER_PORT,
        },
        HTTPS:{
            server_ip: DATA_SERVER_ADDRESS,
            server_port: 10000 + DATA_SERVER_PORT,
        }
    },

	MSGBOARD_SERVER: {
        HTTP: {
            server_ip: CHAT_SERVER_ADDRESS,
            server_port: CHAT_SERVER_PORT,
        },
        HTTPS: {
            server_ip: CHAT_SERVER_ADDRESS,
            server_port: 10000 + CHAT_SERVER_PORT,
        }
    },

	BALANCE_SERVER: {
        HTTP: {
            server_ip: BALANCE_SERVER_ADDRESS,
            server_port: BALANCE_SERVER_PORT,
        },
        HTTPS: {
            server_ip: BALANCE_SERVER_ADDRESS,
            server_port: 10000 + BALANCE_SERVER_PORT,
        }
    },

	ENTER_SERVER: {
        HTTP: {
            server_ip: SERVER_POOL_ADDRESS,
            server_port: SERVER_POOL_SOCKET_PORT,
        },
        HTTPS: {
            server_ip: SERVER_POOL_ADDRESS,
            server_port: 10000 + SERVER_POOL_SOCKET_PORT,
        }
    },

    CHAT_SERVER: {
        HTTP: {
            server_ip: CHAT_SERVER_ADDRESS,
            server_port: CHAT_SERVER_PORT,
        },
        HTTPS: {
            server_ip: CHAT_SERVER_ADDRESS,
            server_port: 10000 + CHAT_SERVER_PORT,
        }
    },


    RESOURCE_SERVER:{
        HTTP: {
            server_ip: RESOURCE_SERVER_ADDRESS,
            server_port: RESOURCE_SERVER_PORT,
        },
        HTTPS: {
            server_ip: RESOURCE_SERVER_ADDRESS,
            server_port: 10000 + RESOURCE_SERVER_PORT,
        }
    },

    FIGHTING_SERVER:{
        HTTP: {
            server_ip: FIGHTING_SERVER_ADDRESS,
            server_port: FIGHTING_SERVER_PORT,
        },
        HTTPS: {
            server_ip: FIGHTING_SERVER_ADDRESS,
            server_port: 10000 + FIGHTING_SERVER_PORT,
        }
    }
};
exports.SERVER_CFG = SERVER_CFG;