const pomelo = require('pomelo');
const sysConfig = require('../../config/sysConfig');

class AppConfigReader{
    constructor(){
    }
}

AppConfigReader.sysConfig = sysConfig;


module.exports = AppConfigReader;