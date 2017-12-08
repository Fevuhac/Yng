'use strict';
import { EggAppConfig } from 'egg';
import defaultConfig from './defaultConfig';
import * as fs from 'fs';
import * as path from 'path';

export default (appInfo: EggAppConfig) => {
    
    const config: any = {};
    config.keys = appInfo.name + '123456';

    config.siteFile = {
        '/favicon.ico': fs.readFileSync(path.join(appInfo.baseDir, 'public/favicon.ico')),
    };

    // config.view = {
    //     defaultViewEngine: 'nunjucks',
    //     mapping: {
    //         '.tpl': 'nunjucks',
    //     },
    // };
    // 103511857097236/friendlists?limit=25&offset=0
    // 101814943933594
    config.view = {
        defaultViewEngine: 'ejs',
        mapping: {
            '.ejs': 'ejs',
        },
        root: [
            path.join(appInfo.baseDir, 'app/view'),
            // path.join(appInfo.baseDir, 'path/to/another'),
        ].join(',')
    };

    config.middleware = [
        'errorHandler',
        'decryptBody',
        'cryptBody'
    ];

    config.logger ={
        level:'DEBUG',
        consoleLevel: 'DEBUG',
    }

    config.security = {
        xframe: {
          enable: false,
        },
        csrf:{
            enable:false,
        }
      };

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

    config.redis = {
        client:{
            host:'127.0.0.1',
            port:'6379',
            password:'',
            db: 0,
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

    config.i18n ={
        // defaultLocale: 'en_US',
        locale: 'en_US',
        // locale: 'zh-CN',
    }

    config.static = {
        prefix:'/',
        dir:[path.join(appInfo.baseDir, 'public')]
    }

    return {...config, ...defaultConfig};
}
