'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const defaultConfig_1 = require("./defaultConfig");
const fs = require("fs");
const path = require("path");
exports.default = (appInfo) => {
    const config = {};
    config.keys = appInfo.name + '123456';
    config.siteFile = {
        '/favicon.ico': fs.readFileSync(path.join(appInfo.baseDir, 'app/public/favicon.png')),
    };
    config.view = {
        defaultViewEngine: 'nunjucks',
        mapping: {
            '.tpl': 'nunjucks',
        },
    };
    config.middleware = [
        'errorHandler',
        'decryptBody',
        'cryptBody'
    ];
    config.logger = {
        level: 'DEBUG',
        consoleLevel: 'DEBUG',
    };
    config.security = {
        xframe: {
            enable: false,
        },
        csrf: {
            enable: false,
        }
    };
    config.mysql = {
        client: {
            host: '127.0.0.1',
            port: '3306',
            user: 'root',
            password: 'root',
            database: 'fishjoy',
        },
        app: true,
        agent: false,
    };
    config.sequelize = {
        dialect: 'mysql',
        database: 'fishjoy',
        host: 'localhost',
        port: '3306',
        username: 'root',
        password: 'root',
    };
    config.i18n = {
        defaultLocale: 'en_US',
    };
    return Object.assign({}, config, defaultConfig_1.default);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmRlZmF1bHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb25maWcuZGVmYXVsdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBRWIsbURBQTRDO0FBQzVDLHlCQUF5QjtBQUN6Qiw2QkFBNkI7QUFFN0Isa0JBQWUsQ0FBQyxPQUFxQixFQUFFLEVBQUU7SUFFckMsTUFBTSxNQUFNLEdBQVEsRUFBRSxDQUFDO0lBQ3ZCLE1BQU0sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7SUFFdEMsTUFBTSxDQUFDLFFBQVEsR0FBRztRQUNkLGNBQWMsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO0tBQ3hGLENBQUM7SUFFRixNQUFNLENBQUMsSUFBSSxHQUFHO1FBQ1YsaUJBQWlCLEVBQUUsVUFBVTtRQUM3QixPQUFPLEVBQUU7WUFDTCxNQUFNLEVBQUUsVUFBVTtTQUNyQjtLQUNKLENBQUM7SUFFRixNQUFNLENBQUMsVUFBVSxHQUFHO1FBQ2hCLGNBQWM7UUFDZCxhQUFhO1FBQ2IsV0FBVztLQUNkLENBQUM7SUFFRixNQUFNLENBQUMsTUFBTSxHQUFFO1FBQ1gsS0FBSyxFQUFDLE9BQU87UUFDYixZQUFZLEVBQUUsT0FBTztLQUN4QixDQUFBO0lBRUQsTUFBTSxDQUFDLFFBQVEsR0FBRztRQUNkLE1BQU0sRUFBRTtZQUNOLE1BQU0sRUFBRSxLQUFLO1NBQ2Q7UUFDRCxJQUFJLEVBQUM7WUFDRCxNQUFNLEVBQUMsS0FBSztTQUNmO0tBQ0YsQ0FBQztJQUVKLE1BQU0sQ0FBQyxLQUFLLEdBQUc7UUFDWCxNQUFNLEVBQUM7WUFDSCxJQUFJLEVBQUMsV0FBVztZQUNoQixJQUFJLEVBQUMsTUFBTTtZQUNYLElBQUksRUFBQyxNQUFNO1lBQ1gsUUFBUSxFQUFDLE1BQU07WUFDZixRQUFRLEVBQUMsU0FBUztTQUNyQjtRQUNELEdBQUcsRUFBQyxJQUFJO1FBQ1IsS0FBSyxFQUFDLEtBQUs7S0FDZCxDQUFBO0lBRUQsTUFBTSxDQUFDLFNBQVMsR0FBRztRQUNmLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLFFBQVEsRUFBRSxTQUFTO1FBQ25CLElBQUksRUFBRSxXQUFXO1FBQ2pCLElBQUksRUFBRSxNQUFNO1FBQ1osUUFBUSxFQUFFLE1BQU07UUFDaEIsUUFBUSxFQUFFLE1BQU07S0FDbkIsQ0FBQTtJQUVELE1BQU0sQ0FBQyxJQUFJLEdBQUU7UUFDVCxhQUFhLEVBQUUsT0FBTztLQUN6QixDQUFBO0lBRUQsTUFBTSxtQkFBSyxNQUFNLEVBQUssdUJBQWEsRUFBRTtBQUN6QyxDQUFDLENBQUEifQ==