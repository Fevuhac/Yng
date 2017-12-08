var SERVER_CFG = require('../cfgs/server_cfg').SERVER_CFG;
var DaoAccount = require('../dao/dao_account');
var buzz_mail = require('./buzz_mail');
var buzz_bigdata = require('./buzz_bigdata');
var HappyWeekend = require('../../routes/data/happy_weekend');

var GameLog = require('../log/GameLog');


//==============================================================================
// 定时任务
var ONE_SECOND_TIME = '00 */1 * * * *';
var FIVE_SECOND_TIME = '*/5 * * * * *';
var ONE_MINUTES_TIME = '00 */1 * * * *';
var FIVE_MINUTES_TIME = '00 */5 * * * *';
var TEN_MINUTES_TIME = '00 */10 * * * *';
var DAILY_RESET_TIME = '01 00 00 * * *';
var DAILY_JOB_TIME = '01 00 00 * * *';
var DAILY_JOB_TIME_SAVE_DB = '00 55 23 * * *';
var DAILY_JOB_TIME_GEN_CHART = '00 59 23 * * *';
// var DAILY_JOB_TIME_GEN_CHART = '00 36 18 * * *';
var DAILY_JOB_TIME_B = '55 59 23 * * *';// 赛季奖励计算的时间
var STATISTICS_JOB_TIME = '00 03 00 * * *';
var WEEKLY_JOB_TIME = '05 00 00 * * 1';
var WEEKLY_JOB_TIME2 = '00 01 00 * * 1';
var MONTHLY_JOB_TIME = '01 00 00 1 * *';// 每月1日凌晨重置数据
var HOUR_JOB_TIME = '01 00 * * * *';
var HOUR_RESET_TIME = '00 00 * * * *';
var DAILY_REWARD_ADV_RESET_TIME = '00 00 21 * * *';// 每日的21点(晚上9点进行数据重置)

var DAILY_STATISTICS = '00 00 02 * * *';// 每日的凌晨2点生成统计数据()最近一周)

var JOB_TIME_GENERATE_CHARTS = ONE_MINUTES_TIME;//FIVE_MINUTES_TIME;//FIVE_SECOND_TIME;
var JOB_TIME_MATCH_SEASON = DAILY_JOB_TIME_B;// 赛季奖励计算的时间
var JOB_TIME_CHART_WEEKLY_RESET = WEEKLY_JOB_TIME2;// 每周排行榜重置

var CronJob = require('cron').CronJob;
var DateUtil = require('../utils/DateUtil');
var buzz_reward = require('./buzz_reward');
var buzz_goddess = require('./buzz_goddess');
var buzz_drop = require('./buzz_drop');
var buzz_account = require('./buzz_account');
var buzz_charts = require('./buzz_charts');
var DropRecord = require('./pojo/DropRecord');
var dao_drop = require('../dao/dao_drop');
var CacheAccount = require('./cache/CacheAccount');
var CacheOperation = require('./cache/CacheOperation');
var activeReset = require('./activeReset');


var TAG = "【buzz_cron】";

exports.startCronJob = startCronJob;
exports.restartAll = restartAll;
exports.stopAll = stopAll;

var job_1_second = null;
var job_1_minute = null;
var job_10_minute = null;
var job_daily_reset = null;
var job_daily_reward_adv_reset = null;
var job_daily_statistics = null;
var job_1_week = null;
var job_daily = null;
var job_daily_mail = null;
var job_daily_season = null;
var job_1_month = null;
var job_1_hour = null;
var job_1_hour_reset = null;

var dao = null;
var pool = null;

/**
 * 重启所有定时任务.
 */
function restartAll() {
    // stopAll();
    // startCronJob(dao, pool);
    var admin_server = require('../../routes/api/admin_server');
    admin_server.shutdownWithCrash(pool);
}

/**
 * 停止所有定时任务.
 */
function stopAll() {
    if (job_1_second) job_1_second.stop();
    if (job_1_minute) job_1_minute.stop();
    if (job_10_minute) job_10_minute.stop();
    if (job_daily_reset) job_daily_reset.stop();
    if (job_daily_reward_adv_reset) job_daily_reward_adv_reset.stop();
    if (job_daily_statistics) job_daily_statistics.stop();
    if (job_1_week) job_1_week.stop();
    if (job_daily) job_daily.stop();
    if (job_daily_mail) job_daily_mail.stop();
    if (job_daily_season) job_daily_season.stop();
    if (job_1_month) job_1_month.stop();
    if (job_1_hour) job_1_hour.stop();
    if (job_1_hour_reset) job_1_hour_reset.stop();
}

function startCronJob(myDao, myPool) {

    const FUNC = TAG + "startCronJob() --- ";
    console.log(FUNC + "CALL...");

    dao = myDao;
    pool = myPool;

    activeReset.runActiveReset(pool);

    // 每秒进行的任务, 更新数据库中的当前小时的话费券剩余数量
    job_1_second = new CronJob(ONE_SECOND_TIME, function () {
        buzz_drop.updateLeftDropCount(myPool, function(info) {
            // console.log(FUNC + info);
        });
    }, null, true, "Asia/Shanghai");

    // 每分钟进行一次link_log记录, 仅在缓存中有数据时进行
    job_1_minute = new CronJob(ONE_MINUTES_TIME, function () {

        if (SERVER_CFG.MAIN_SID == SERVER_CFG.SID) {
            buzz_bigdata.genGoldLeftToday();
        }
        myDao.writeLinkLog(function (err) {
            log_error(err, "写link_log");
            myDao.writeSkillLog(function (err) {
                log_error(err, "写skill_log");
                myDao.writeGoldLog(function (err) {
                    log_error(err, "写gold_log");
                    myDao.writePearlLog(function (err) {
                        log_error(err, "写pearl_log");
                        myDao.writeWeaponLog(function (err) {
                            log_error(err, "写weapon_log");
                            myDao.writeUserException(function (err) {
                                log_error(err, "写UserException");
                                myDao.writeLogMailReward(function (err) {
                                    log_error(err, "写LogMailReward");
                                    buzz_account.flushAccountServer(pool, function (err) {
                                        log_error(err, "写tbl_account_server");
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
        GameLog.flushLog(function(err) {
            log_error(err, "写所有日志到数据库");
        });

    }, null, true, "Asia/Shanghai");


    // 每10分钟进行一次AI数据的计算, 计算的输入就是上一次计算统计值和过去的10分钟的新值合在一起统计
    job_10_minute = new CronJob(TEN_MINUTES_TIME, function () {
        console.log("每隔十分钟的定时更新");
        myDao.makeNewAi(function (err) {
            log_error(err, "更新AI数据");
        });
        // 每十分钟剪切一次排行榜数据
        if (SERVER_CFG.MAIN_SID == SERVER_CFG.SID) {
            buzz_charts.trimAll();
        }
    }, null, true, "Asia/Shanghai");

    // 用于重置tbl_account中的first_login, day_reward, vip_daily_fill字段(每日凌晨00:00:01执行)
    job_daily_reset = new CronJob(DAILY_RESET_TIME, function () {

        // TODO: 这里的缓存数据每日重置需要确定一下...
        CacheAccount.dailyReset();
        CacheOperation.dailyReset();
        // 数据库操作只有1服来做
        if (SERVER_CFG.MAIN_SID == SERVER_CFG.SID) {
            //每日分享数据重置
            myDao.resetDaillyShare(null,function(err) {
                console.log(err, "测试每日分享数据");
            });
            myDao.resetDayInfoForAll(null, function (err) {
                log_error(err, "重置每日数据");
            });
        }
    }, null, true, "Asia/Shanghai");

    if (SERVER_CFG.MAIN_SID == SERVER_CFG.SID) {
        new CronJob(DAILY_STATISTICS, function () {
            var DaoAdminFillData = require('../dao/dao_admin_fill_data');
            var data = {};
            var timestamp = new Date().getTime();
            data.start_date = DateUtil.format(new Date(timestamp - 86400000 * 7), "yyyy-MM-dd");
            data.end_date = DateUtil.format(new Date(timestamp), "yyyy-MM-dd");

            console.log(FUNC + "start_date:", data.start_date);
            console.log(FUNC + "end_date:", data.end_date);

            DaoAdminFillData.fillDayData(pool, data, function (err, results) {
                // handleDaoResult(res, err, results, "手动生成留存数据", FUNC);
                console.log(FUNC + "定时生成留存数据完成");
            });
        }, null, true, "Asia/Shanghai");

        // 用于重置tbl_account中的daily_reward_adv字段(每日21:00:00执行)
        job_daily_reward_adv_reset = new CronJob(DAILY_REWARD_ADV_RESET_TIME, function () {
            myDao.resetDayInfoForDailyRewardAdv(function (err) {
                log_error(err, "重置广告礼包数据");
            });
        }, null, true, "Asia/Shanghai");

        // 用于每日统计当日的游戏数据(每日凌晨00:03:00执行)
        job_daily_statistics = new CronJob(STATISTICS_JOB_TIME, function () {
            myDao.genStatistics(function (err) {
                log_error(err, "统计当日的游戏数据");
            });
        }, null, true, "Asia/Shanghai");

        // 用于每周数据重置(每周一凌晨00:00:05执行)
        job_1_week = new CronJob(WEEKLY_JOB_TIME, function () {
            buzz_goddess.putWeekReward(myPool, function() {
                myDao.resetWeeklyInfoForAll(null, function (err) {
                    log_error(err, "重置本周数据");
                });
            });
        }, null, true, "Asia/Shanghai");

        new CronJob(JOB_TIME_CHART_WEEKLY_RESET, function () {
            buzz_charts.resetChartWeekly(function(err, result) {
                log_error(err, "重置本周数据" + result);
            });
            
            //清空周末狂欢数据 added by scott on 2017.10.17
            if (HappyWeekend) {
                var hw = new HappyWeekend();
                hw.clear();
            }
        }, null, true, "Asia/Shanghai");
        
        // buzz_goddess.putWeekReward(myPool, function() {
        // });

        // 用于每日生成tbl_stat_day数据(每小时00:00:01执行)
        job_daily = new CronJob(DAILY_JOB_TIME, function () {
            myDao.sumUpLastDay(function (err, results) {
                log_error(err, "统计昨天的数据");
            });
        }, null, true, "Asia/Shanghai");

        // 考虑到女神数据在每周会重置, 所以将发放排行榜邮件的时间提前到每日零时的前一分钟
        // 产生新的昨日排行榜(邮件会稍后发送, 如果需要的话)
        new CronJob(DAILY_JOB_TIME_GEN_CHART, function () {
            buzz_charts.generateDailyReward();
            buzz_bigdata.genGoldHistory();
        }, null, true, "Asia/Shanghai");
	
        // 每月最后一天的23:59:55进行赛季结算
        job_daily_season = new CronJob(JOB_TIME_MATCH_SEASON, function () {
            console.log(FUNC + "每月最后一天的23:59:55进行赛季结算");
            myDao.seasonEnd(function (err, result) {
                console.log(FUNC + "赛季结算结束");
                if (err) {
                    console.error(FUNC + "err:\n", err);
                }
                else {
                    console.error(FUNC + "results:\n", result);
                }
            });
        }, null, true, "Asia/Shanghai");

        // 用于每小时生成tbl_stat_hour数据(每小时00:59:59执行)
        job_1_hour = new CronJob(HOUR_JOB_TIME, function () {
            console.log(FUNC + "统计上一个小时的数据");
            var data = {
                start_time: DateUtil.getLastHourStart(),
                end_time: DateUtil.getLastHourEnd(),
            };
            myDao.sumUpLastHour(data, function (err, results) {
                log_error(err, "统计上一个小时的数据");
            });
        }, null, true, "Asia/Shanghai");

        job_1_hour_reset = new CronJob(HOUR_RESET_TIME, function () {
            console.log(FUNC + "重置全服限制的掉落数量");
            DropRecord.resetEveryHour();
            dao_drop.resetEveryHour(myPool, function() {
                console.log(FUNC + "全服限制数据库重置完成");
            });
        }, null, true, "Asia/Shanghai");

        ///////////////////////////////////////////////////////////////
        // 新增定时任务
        ///////////////////////////////////////////////////////////////
        // 仅由主服(1服来生成排行榜)
        new CronJob(JOB_TIME_GENERATE_CHARTS, function () {
            buzz_charts.generate();
        }, null, true, "Asia/Shanghai");
    }

    // 每月1日凌晨重置数据.
    job_1_month = new CronJob(MONTHLY_JOB_TIME, function () {
        buzz_reward.resetMonthSign(myPool);
        buzz_charts.resetChartMonthly(function(err, result) {
            log_error(err, "重置本月数据" + result);
        });
    }, null, true, "Asia/Shanghai");

    // myDao.genCharts(function (err, results) {
    //     log_error(err, "每小时生成一次排行榜");
    // });
    
}

function log_error(err, info) {
    if (err)
        console.error(info + ' 【失败】, err:', err);
    else
        console.log(info + ' 【成功】');
}
