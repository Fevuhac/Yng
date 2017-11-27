'use strict';
import { EggAppConfig } from 'egg';
import * as fs from 'fs';
import * as path from 'path';
import defaultConfig from './defaultConfig';

export default (appInfo: EggAppConfig) => {
    const config: any = {};
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
        'uppercase'
    ];

    config.logger ={
        level:'DEBUG',
        consoleLevel: 'DEBUG',
    }

    config.mysql = {
        client:{
            host:'127.0.0.1',
            port:'3306',
            user:'root',
            password:'root',
            database:'fishjoy',
        },
        app:true,
        agent:false,
    }

    config.sequelize = {
        dialect: 'mysql', // support: mysql, mariadb, postgres, mssql
        database: 'fishjoy',
        host: 'localhost',
        port: '3306',
        username: 'root',
        password: 'root',
    }

    return { ...config, ...defaultConfig };
}
