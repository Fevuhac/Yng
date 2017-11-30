const LogHelper = require('../base/logHelper');
const mysqlConf = require('./config/mysql.json');
const redisConf = require('./config/redis.json');
const taskPool = require('../base/task').taskPool;
const Application = require('../base/application');
const DailyResetTask = require('./task/dailyResetTask');
const MonthResetTask = require('./task/monthResetTask');
const WeekResetTask = require('./task/weekResetTask');
const RankBuildTask = require('./task/rankBuildTask');
const RankRewardTask = require('./task/rankRewardTask');
const task_conf = require('./config/task');

class PlayerSyncApp extends Application {
    constructor() {
        super({
            db: {
                mysql: mysqlConf,
                redis: redisConf
            }
        });
        this.logHelper = new LogHelper('rankSync');
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

    _addTask() {
        let dailyTask = new DailyResetTask(task_conf.dailyReset);
        let weekTask = new WeekResetTask(task_conf.weekReset);
        let monthTask = new MonthResetTask(task_conf.monthReset);
        let rankBuildTask = new RankBuildTask(task_conf.rankBuild);
        let rankRewardTask = new RankRewardTask(task_conf.rankReward);
        taskPool.addTask('dailyTask', dailyTask);
        taskPool.addTask('weekTask', weekTask);
        taskPool.addTask('monthTask', monthTask);
        taskPool.addTask('rankBuild', rankBuildTask);
        taskPool.addTask('rankReward', rankRewardTask);
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
