module.exports = {
    appenders: {
        file: {
            type: 'file',
            filename: './logs/playerSync.log',
            maxLogSize: 1024*1024,
            backups:50
        },
        console:{
            type:'console'
        }
    },
    categories: {
        default: {appenders: ['file','console'], level: 'debug'}
    },
    "replaceConsole": true, //// 替换 console.log
    "lineDebug": true
};