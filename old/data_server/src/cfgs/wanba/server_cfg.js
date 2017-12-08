// 内网地址(ia): Intranet addressc
// 外网地址(ea): Extranet address
// 域名(dn): Domain Name
const SERVER_INFO = [
    {
        id: 1,
        ia:'10.163.56.148',
        ea:'58.87.69.167',
        dn:'bulao2.tcdn.szhlsg.com',
        desc:'捕捞季游戏服务器01'
    },
    {
        id: 2,
        ia:'10.163.21.197',
        ea:'58.87.95.24',
        dn:'bulao3.tcdn.szhlsg.com',
        desc:'捕捞季游戏服务器02'
    },
    {
        id: 3,
        ia:'10.163.21.193',
        ea:'211.159.162.80',
        dn:'bulao4.tcdn.szhlsg.com',
        desc:'捕捞季游戏服务器03'
    },
    {
        id: 4,
        ia:'10.163.36.187',
        ea:'58.87.84.46',
        dn:'bulao5.tcdn.szhlsg.com',
        desc:'捕捞季游戏服务器04'
    },
    {
        id: 5,
        ia:'10.163.33.91',
        ea:'58.87.96.206',
        dn:'bulao6.tcdn.szhlsg.com',
        desc:'捕捞季游戏服务器05'
    },
    {
        id: 6,
        ia:'10.163.37.43',
        ea:'211.159.148.149',
        dn:'bulao7.tcdn.szhlsg.com',
        desc:'捕捞季游戏服务器06'
    },
    {
        id: 7,
        ia:'10.163.2.179',
        ea:'211.159.162.241',
        dn:'bulao8.tcdn.szhlsg.com',
        desc:'捕捞季游戏服务器07'
    },
    {
        id: 8,
        ia:'10.163.37.28',
        ea:'211.159.173.200',
        dn:'bulao9.tcdn.szhlsg.com',
        desc:'捕捞季游戏服务器08'
    },
];

// var SERVERB_ADDRESS = "58.87.69.167";
var SERVERB_ADDRESS = "bulao2.tcdn.szhlsg.com";

// var SERVER1_ADDRESS = "58.87.105.192";
var SERVER1_ADDRESS = "bulao1.tcdn.szhlsg.com";

// var SERVERC_ADDRESS = "211.159.173.200";
var SERVERC_ADDRESS = "bulao9.tcdn.szhlsg.com";

global.local_ip = null;

function getLocalIp() {
	let os = require('os'),
	    iptable = {},
	    ifaces = os.networkInterfaces();
	for (let dev in ifaces) {
	    ifaces[dev].forEach(function(details,alias) {
	        if (details.family == 'IPv4') {
	            iptable[dev + (alias ? ':' + alias : '')] = details.address;
	        }
	    });
	}

	global.local_ip = iptable.eth0;//Linux
    if (!global.local_ip) {
	    global.local_ip = iptable['本地连接:1'];//Windows
    }
}

if (!global.local_ip) {
	getLocalIp();
    console.log(global.local_ip);
}

global.server_id = 0;
for (let i = 0; i < SERVER_INFO.length; i++) {
    if (global.local_ip == SERVER_INFO[i].ia) {
        global.server_id = SERVER_INFO[i].id;
    }
}

const SERVER_CFG = {
    PATH_TO_PRIVATE_PEM: "/home/server/cert/ca-key.pem",
    PATH_TO_FILE_CRT: "/home/server/cert/ca-cert.pem",
    HTTP_PORT: 3101,
    HTTP: 1,
    HTTPS_PORT: 13101,
    HTTPS: 0,
    // 主服务器, 所有的定时操作和跨天操作都由这个服务器来完成
    // 需要提取一个单独的服务器来做定时任务(董封成正在做?)
    MAIN_SID: 1,
    // 以下是服务器ID, 需要每次配置时注意修改
    SID: global.server_id,

    REDIS: {
        RDS_PORT: 6379,
        RDS_HOST: '10.66.232.136',
        RDS_PWD: 'crs-cwxtb7al:pwd1234@^@',
    },

    DB: {
        host: '10.66.204.213',
        user: 'root',
        pwd: 'Ch123456',
        database: 'fishjoy',
    },

    ADDRESS:  {
        /** 负载均衡服地址及端口 */
        BALANCE_SERVER: {
            IP: SERVERB_ADDRESS,
            IPS: SERVERB_ADDRESS,
            PORT: "3010",
            PORTS: "13010",
        },
        /** 报名池查询API */
        ENTERPOOL_DATA_API: {
            IP: "http://" + SERVER1_ADDRESS,
            IPS: "https://" + SERVER1_ADDRESS,
            PORT: "3009",
            PORTS: "13009",
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