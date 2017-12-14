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
    config.middleware = [
        'uppercase'
    ];
    return Object.assign({}, config, defaultConfig_1.default);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFFYix5QkFBeUI7QUFDekIsNkJBQTZCO0FBQzdCLG1EQUE0QztBQUU1QyxrQkFBZSxDQUFDLE9BQXFCLEVBQUUsRUFBRTtJQUNyQyxNQUFNLE1BQU0sR0FBUSxFQUFFLENBQUM7SUFDdkIsTUFBTSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztJQUN0QyxNQUFNLENBQUMsUUFBUSxHQUFHO1FBQ2QsY0FBYyxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLHdCQUF3QixDQUFDLENBQUM7S0FDeEYsQ0FBQztJQUNGLE1BQU0sQ0FBQyxJQUFJLEdBQUc7UUFDVixpQkFBaUIsRUFBRSxVQUFVO1FBQzdCLE9BQU8sRUFBRTtZQUNMLE1BQU0sRUFBRSxVQUFVO1NBQ3JCO0tBQ0osQ0FBQztJQUVGLE1BQU0sQ0FBQyxVQUFVLEdBQUc7UUFDaEIsV0FBVztLQUNkLENBQUM7SUFFRixNQUFNLG1CQUFNLE1BQU0sRUFBSyx1QkFBYSxFQUFHO0FBQzNDLENBQUMsQ0FBQSJ9