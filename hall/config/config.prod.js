'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const defaultConfig_1 = require("./defaultConfig");
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
    return Object.assign({}, config, defaultConfig_1.default);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLnByb2QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb25maWcucHJvZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBRWIseUJBQXlCO0FBQ3pCLDZCQUE2QjtBQUM3QixtREFBNEM7QUFFNUMsa0JBQWUsQ0FBQyxPQUFxQixFQUFFLEVBQUU7SUFDckMsTUFBTSxNQUFNLEdBQVEsRUFBRSxDQUFDO0lBQ3ZCLE1BQU0sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7SUFDdEMsTUFBTSxDQUFDLFFBQVEsR0FBRztRQUNkLGNBQWMsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO0tBQ3hGLENBQUM7SUFDRixNQUFNLENBQUMsSUFBSSxHQUFHO1FBQ1YsaUJBQWlCLEVBQUUsVUFBVTtRQUM3QixPQUFPLEVBQUU7WUFDTCxNQUFNLEVBQUUsVUFBVTtTQUNyQjtLQUNKLENBQUM7SUFFRixNQUFNLG1CQUFNLE1BQU0sRUFBSyx1QkFBYSxFQUFHO0FBQzNDLENBQUMsQ0FBQSJ9