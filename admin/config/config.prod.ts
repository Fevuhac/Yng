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

    return { ...config, ...defaultConfig };
}
