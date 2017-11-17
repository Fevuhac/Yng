const LogHelper = require('../base/logHelper');
const redisConf = require('./config/redis.json');
const mysqlConf = require('./config/mysql.json');
const taskPool = require('../base/task').taskPool;
const Application = require('../base/application');
const AccountSync = require('./task/accountSync');
const AccountKick = require('./task/accountKick');
const task_conf = require('./config/task');

class PlayerSyncApp extends Application {
    constructor() {
        super({
            db: {
                redis: redisConf,
                mysql: mysqlConf
            }
        });
        this.logHelper = new LogHelper('playerSync');
        this.logHelper.configure(require('./config/log4js'));
        // this.logHelper.setLevel('DEBUG');
    }

    async start() {

        let ret = await super.start();

        if (!ret) {
            return;
        }

        this._addTask();
    }


    stop(){
        this.logHelper.flush();
        taskPool.removeTask();

        console.log('-----------------------')
    }

    dbEvent(type, db) {
        // console.log(type, db);
    }

    _addTask() {
        let accountSync = new AccountSync(task_conf.userSync);
        let accountKick = new AccountKick(task_conf.userKick);
        taskPool.addTask('userSync', accountSync);
        taskPool.addTask('userKick', accountKick);
    }
}


let app = new PlayerSyncApp();
app.start();

// setTimeout(function () {
//     app.stop();
// },10000)

process.on('exit',function(){
    console.log('playerSync exit.......')
    app.stop();
});

process.on('SIGINT', function() {
    console.log('Got SIGINT.  Press Control-D/Control-C to exit.');
    process.exit(1)
});

process.on('uncaughtException', function (err) {
    console.error("【" + new Date() + "】uncaughtException:", err);
    console.error("stack:", err.stack);
});
