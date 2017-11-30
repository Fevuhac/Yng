'use strict';
import { EggAppConfig } from 'egg';
import defaultConfig from './defaultConfig';
import * as fs from 'fs';
import * as path from 'path';

export default (appInfo: EggAppConfig) => {
    
    const config: any = {};
    config.keys = appInfo.name + '123456';

    config.siteFile = {
        '/favicon.ico': fs.readFileSync(path.join(appInfo.baseDir, 'app/public/favicon.png')),
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
            password:'linyng',
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

    config.i18n ={
        defaultLocale: 'en_US',
    }

    config.view = {
        defaultViewEngine: 'nunjucks',
        mapping: {
            '.tpl': 'nunjucks',
        },
        root: [
            path.join(appInfo.baseDir, 'app/view'),
            path.join(appInfo.baseDir, 'view'),
          ].join(',')
    };

    // config.view = {
    //     defaultViewEngine: 'ejs',
    //     mapping: {
    //         '.html': 'ejs',
    //     },
    //     root: [
    //         path.join(appInfo.baseDir, 'app/view'),
    //         path.join(appInfo.baseDir, 'path/to/another'),
    //       ].join(',')
    // };

    config.static = {
        prefix:'/',
        dir:[path.join(appInfo.baseDir, 'public')]
    }

    return {...config, ...defaultConfig};
}
