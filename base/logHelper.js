const log4js = require('log4js');

class LogHelper{
    constructor(module){
        this._defaultConfig = {
            appenders: {
                file: {
                    type: 'file',
                    filename: `./logs/${module}.log`,
                    maxLogSize: 1024*1024,
                    backups:50
                },
                console:{
                    type:'console'
                }
            },
            categories: {
                default: {appenders: ['file','console'], level: 'trace'}
            },
            "replaceConsole": true, //// 替换 console.log
            "lineDebug": true
        };
        log4js.configure(this._defaultConfig);
        global.logger = log4js.getLogger(module);
    }

    setLevel(level){
        global.logger.level = level;
    }


    configure(config){
        log4js.configure(config);
    }

    flush(){
        log4js.shutdown();
    }

}

module.exports = LogHelper;