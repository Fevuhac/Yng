const Service = require('egg').Service;
const moment = require('moment');

const REDIS_KEYS = require('../../../database/consts/redisKey');
const accountKey = require('../../../database/consts/accountKey');
import import_utils from '../util/import_utils';
import import_def from '../util/import_def';
const operationDao = require('../dao/OperationDao');
const logDao = require('../dao/LogDao');
const userDao = require('../dao/UserDao');
const dailyStatisticsDao = require('../dao/DailyStatisticsDao');

new import_utils.application({
    db: {
        redis: import_utils.databaseConfig.redis,
        mysql: import_utils.databaseConfig.mysql
    }
}).start();

class GameData extends Service {

    /**
     * 实时数据
     */
    public async realtime(data: any) {
        let first_date = data.first_date;
        let second_date = data.second_date;
        try {
            let sql = "select created_at, new_account, login_count, account_count from tbl_stat_hour where date(created_at)=?";

            let first = await this.app.mysql.query(sql, [first_date]);
            let second = await this.app.mysql.query(sql, [second_date]);
            for (var i = 0; i < first.length; i++) {
                var log_date = first[i]['created_at'];
                first[i]['created_at'] = moment(log_date).format('YYYY-MM-DD HH');
            }
            for (var i = 0; i < second.length; i++) {
                var log_date = second[i]['created_at'];
                second[i]['created_at'] = moment(log_date).format('YYYY-MM-DD HH');
            }
            let ret = {
                data: [first, second],
            };
            return { result: true, data: ret };
        } catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }

    }

    /**
     * 在线状态
     */
    public async online(data: any) {
        let start_time = data.start_time;
        let end_time = data.end_time;
        try {
            let sql = "select time, online_count, link_count from tbl_link_sum where time>'?' and time<'?' group by time";
            let result = await this.app.mysql.query(sql, [start_time, end_time]);
            let ret = {
                data: result
            };
            return { result: true, data: ret };
        } catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }


    }

    /**
     * 注册激活
     */
    public async register(data: any) {
        let start_date = data.start_date;
        let end_date = data.end_date;
        try {
            let sql = "select log_date, new_temp_account, new_nickname_account, new_bind_account from tbl_stat_day where log_date "
            sql += "BETWEEN STR_TO_DATE('" + start_date + "','%Y-%m-%d')";
            sql += "AND STR_TO_DATE('" + end_date + "','%Y-%m-%d')";
            let result = await this.app.mysql.query(sql, []);
            console.log('result:', result);
            for (var i = 0; i < result.length; i++) {
                var log_date = result[i]['log_date'];
                result[i]['log_date'] = moment(log_date).format('YYYY-MM-DD');
            }
            return { result: true, data: result };
        } catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    /**
     * 活跃用户
     */
    public async active(data: any) {
        let start_date = data.start_date;
        let end_date = data.end_date;
        try {
            let sql = "";
            sql += "SELECT * ";
            sql += "FROM tbl_stat_day  ";
            sql += "WHERE log_date ";
            sql += "BETWEEN STR_TO_DATE('" + start_date + "','%Y-%m-%d') ";
            sql += "AND STR_TO_DATE('" + end_date + "','%Y-%m-%d')";
            let result = await this.app.mysql.query(sql, []);
            for (var i = 0; i < result.length; i++) {
                var log_date = result[i]['log_date'];
                result[i]['log_date'] = moment(log_date).format('YYYY-MM-DD');
            }
            return { result: true, data: result };
        } catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    /**
     * 付费用户
     */
    public async payuser(data: any) {
        let start_date = data.start_date;
        let end_date = data.end_date;
        try {
            let sql = "";
            sql += "SELECT ";
            // 返回值列表
            sql += "log_date, ";
            sql += "(new_temp_account + new_nickname_account) AS new_account, ";
            sql += "(nickname_count + temp_count) AS active_account, ";
            sql += "shop_time_count, ";
            sql += "shop_account_count, ";
            sql += "shop_tpa, ";
            sql += "shop_pafft, ";
            sql += "shop_paffd, ";
            sql += "shop_pta, ";
            sql += "shop_arpu, ";
            sql += "shop_arrpu ";
            // 查询约束
            sql += "FROM tbl_stat_day ";
            sql += "WHERE log_date ";
            sql += "BETWEEN STR_TO_DATE('" + start_date + "','%Y-%m-%d') ";
            sql += "AND STR_TO_DATE('" + end_date + "','%Y-%m-%d')";
            let result = await this.app.mysql.query(sql, []);
            for (var i = 0; i < result.length; i++) {
                var log_date = result[i]['log_date'];
                result[i]['log_date'] = moment(log_date).format('YYYY-MM-DD');
            }
            return { result: true, data: result };
        } catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    /**
     * 留存趋势
     */
    public async retention(data: any) {
        let start_date = data.start_date;
        let end_date = data.end_date;
        try {
            let sql = "";
            sql += "SELECT log_date, (new_temp_account + new_nickname_account) AS new_account, drr, wrr, mrr FROM ";
            sql += "tbl_stat_day  ";
            sql += "WHERE log_date ";
            sql += "BETWEEN STR_TO_DATE('" + start_date + "','%Y-%m-%d') ";
            sql += "AND STR_TO_DATE('" + end_date + "','%Y-%m-%d')";
            let result = await this.app.mysql.query(sql, []);
            for (var i = 0; i < result.length; i++) {
                var log_date = result[i]['log_date'];
                result[i]['log_date'] = moment(log_date).format('YYYY-MM-DD');
                result[i]['drr'] = formatData(result[i]['drr'] * 100) + '%';
                result[i]['wrr'] = formatData(result[i]['wrr'] * 100) + '%';
                result[i]['mrr'] = formatData(result[i]['mrr'] * 100) + '%';
            }
            console.log('result:', result);
            return { result: true, data: result };
        } catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }

        function formatData(input) {
            return input.toFixed(2);
        }
    }

    /**
     * 生成留存
     */
    public async generateRetention(data: any) {
        //todo
        try {
            return { result: true, data: data };
        } catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    /**
     * 重启服务器
     */
    public async restart(data: any) {
        //todo
        try {
            return { result: true, data: data };
        } catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    /**
    * 日志记录
    */
    public async log(data: any) {
        let start_date = data.start_date;
        let end_date = data.end_date;
        try {
            let sql = "";
            sql += "SELECT * ";
            // 查询约束
            sql += "FROM tbl_order ";
            sql += "WHERE created_at ";
            sql += "BETWEEN STR_TO_DATE('" + start_date + "','%Y-%m-%d') ";
            sql += "AND STR_TO_DATE('" + end_date + "','%Y-%m-%d') ";
            sql += "AND status=0 ";
            let result = await this.app.mysql.query(sql, []);
            for (var i = 0; i < result.length; i++) {
                var created_at = result[i]['created_at'];
                result[i]['created_at'] = moment(created_at).format('YYYY-MM-DD h:mm:ss (EEE)');
                if (result[i]['channel_cb'] != null) {
                    result[i]['channel_cb'] = JSON.parse(result[i]['channel_cb']);
                }
            }
            let ret = {
                data: result
            };
            return { result: true, data: ret };
        } catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    /**
     * 公告1:SERVER,2:GAME_EVENT,3:FAMOUS_ONLINE
     */
    public async broadcast(body: any) {
        let content = body.content;
        let type = body.type;
        try {
            let timestamp = new Date().valueOf();
            let obj = {
                content: content,
                timestamp: timestamp
            }
            let value = JSON.stringify(obj);
            switch (type) {
                case 1:
                    await this.app.redis.publish('channel:broadcast:server', value);
                    break;
                case 2:
                    await this.app.redis.publish('channel:broadcast:gameevent', value);
                    break;
                case 3:
                    await this.app.redis.publish('channel:broadcast:famousonline', value);
                    break;
            }
            return { result: true, data: {} };
        } catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    /**
     * 邮件   insertId
     * SYS :   1,// 系统
     * RANK :  2,// 排行榜
     * SPECIFY : 3,// 补偿邮件(指定玩家发送)
     */
    public async mail(sdata: any) {
        let data = JSON.parse(sdata);
        let type = data.type;
        let content = data.content;
        let reward = data.reward;
        let title = data.title;
        let player_list = data.player_list;
        try {

            let result = await this.app.mysql.insert('tbl_mail', {
                type: type,
                content: content,
                reward: reward,
                title: title
            });
            let insertId = result.insertId;
            let sql = "";
            sql += "UPDATE tbl_account ";
            sql += "SET mail_box = CASE ";
            sql += "WHEN mail_box IS NOT NULL AND LENGTH(TRIM(mail_box)) > 0 THEN ";
            sql += "    CONCAT(mail_box, ?) ";
            sql += "WHEN mail_box IS NULL OR (mail_box IS NOT NULL AND LENGTH(TRIM(mail_box)) < 1) THEN ";
            sql += "    ? ";
            sql += "END ";
            if (player_list) {
                sql += "WHERE id IN (" + player_list + ") ";
            }
            let sql_data = ["," + insertId, insertId];

            switch (Number(type)) {
                case 1:
                    //todo
                    break;
                case 3:
                    let play = player_list.split(',');

                    let platforms = await this.app.redis.hmget('pair:uid:platform', play);

                    for (let i in platforms) {
                        if (platforms[i]) {
                            let mail_box = await this.app.redis.hget('pair:uid:mail_box', play[i]);
                            if (!mail_box) {
                                this.app.redis.hset('pair:uid:mail_box', play[i], "[" + insertId + "]");
                            }
                            else {
                                let mail = JSON.parse(mail_box);
                                if (typeof mail == 'object') {

                                    mail.push(insertId);
                                    this.app.redis.hset('pair:uid:mail_box', play[i], JSON.stringify(mail));
                                }
                                else {
                                    return { result: false, errorCode: this.app.config.ErrorCode.REDIS_ERROR_DATA };
                                }
                            }
                        }
                    }
                    this.app.mysql.query(sql, sql_data);
                    break;
            }
            return { result: true, data: {} };
        } catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    /**
     * 获取用户信息
     */
    public async getAccount(cdata: any) {
        let data = JSON.parse(cdata);
        let account_id = data.account_id;

        console.log('data:=================', data);
        try {
            let account = await import_utils.redisAccountSync.getAccountAsync(account_id, [data.field]);
            console.log('account:\n', account);
            return { result: true, data: account.toJSON() };
        }
        catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    public async getDataWater(){
        try{
            let pumpInfo =  await this.app.redis.get(REDIS_KEYS.PLATFORM_DATA.PUMPWATER);
            return { result: true, data: pumpInfo};
        }catch(err){
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    //----------------------------------------------------------------------------
    // 提现相关实现
    //----------------------------------------------------------------------------

    /**
     * 获取实物兑换订单列表
     */
    public async queryChangeOrder(data) {
        let start_date = data.start_date;
        let end_date = data.end_date;
        let filter = data.filter;
        try {
            let start_timestamp = moment(new Date(start_date).getTime()).format('YYYY-MM-DD 00:00:00');
            let end_timestamp = moment(new Date(end_date).getTime() + 1000 * 60 * 60 * 24).format('YYYY-MM-DD 00:00:00');
            let catalog = filter.order_catalog;
            let status = filter.order_status;
            let sql = "";
            sql += "SELECT *, unix_timestamp(created_at) * 1000 AS created_at ";
            sql += ", unix_timestamp(ship_at) * 1000 AS ship_at ";
            sql += "FROM `tbl_change_log` ";
            sql += "WHERE `created_at`>'" + start_timestamp + "' ";
            sql += "AND `created_at`<'" + end_timestamp + "' ";
            sql += "AND `catalog` IN (" + catalog.toString() + ") ";
            sql += "AND `status` IN (" + status.toString() + ") ";
            let ret = await this.app.mysql.query(sql, []);
            return { result: true, data: ret };
        } catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }


    //----------------------------------------------------------------------------
    // 奖池相关实现
    //----------------------------------------------------------------------------


    /**
     * 获取全服奖池总览
     set fishjoy:room:platformCatchRate 1//平台捕获率
     set fishjoy:platform:bonusPool 10000//奖金池（金币）
     set fishjoy:platform:pumpPool 1000//抽水（金币）
     set fishjoy:platform:recharge 13000//平台充值总额度
     set fishjoy:platform:cash 4000//平台兑现总额度
     set fishjoy:platform:give 4000//平台赠送金币总量
     set fishjoy:platform:totalGold 40000//玩家持有金币总额
     */
    public async queryJackpot() {
        try {
            const KEYS = REDIS_KEYS.PLATFORM_DATA;
            let wc = this.app.cache;
            console.log('p:', wc);
            let gpctTimestamp = await this.app.redis.get(KEYS.G_GPCT_OUT_TIMESTAMP);
            let now = new Date().getTime();
            if (!gpctTimestamp) {
                now = -1;
            } else {
                now -= gpctTimestamp;
                now /= 1000;
                let dt = await this.app.redis.get(KEYS.G_GPCT_OUT);
                now = dt - now; //剩余时间
            }
            let text = JSON.parse(this.ctx.__("TXT_OM_CONTROL"));
            let warning_title = null;
            let warning_msg = null;
            let userCount = await userDao.getTotalUserCount(this.app) || 0;
            if(!userCount.result){
                return userCount;
            }
            let player_users_cfg = import_def.GAMECFG.player_users_cfg;
            if ('red' == wc.color) {
                warning_title = text.txt_warning_title_red;
                warning_msg = text.txt_warning_msg_red;
            }
            else if ('yellow' == wc.color) {
                warning_title = text.txt_warning_title_yellow;
                warning_msg = text.txt_warning_msg_yellow;
            }
            let jackpot = {
                globalGpctOut: now,
                platformCatchRate: await this.app.redis.get(KEYS.PLATFORM_CATCHRATE),
                bonusPool: wc.bonusPool,
                pump: wc.pump,
                recharge: wc.recharge,
                cash: wc.cash,
                give: userCount.data*player_users_cfg[0].gold,
                totalGold: wc.totalGold,
                warning: wc.warning || 1,
                warning_title: warning_title,
                warning_msg: warning_msg,
            };
            await this.initJackpot(jackpot);
            console.log('jackpot:', jackpot);
            return { result: true, data: jackpot };
        } catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    /**
     * 同步每分钟的奖池数据到MySQL，数据表初始化脚本如下：
CREATE TABLE `tbl_bonuspool` (
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '插入时间',
  `platformCatchRate` float NOT NULL DEFAULT '1' COMMENT '平台捕获率',
  `bonusPool` float NOT NULL DEFAULT '0' COMMENT '奖金池（金币）总为正数，可能带小数',
  `pump` float NOT NULL DEFAULT '0' COMMENT '抽水（金币）',
  `recharge` bigint(20) NOT NULL DEFAULT '0' COMMENT '平台充值总额度（越南盾）',
  `cash` bigint(20) NOT NULL DEFAULT '0' COMMENT '平台兑现总额度（越南盾）',
  `give` bigint(20) NOT NULL DEFAULT '0' COMMENT '平台赠送金币总量（初始玩家分金币时更新Redis字段）',
  `totalGold` bigint(20) NOT NULL DEFAULT '0' COMMENT '玩家持有金币总量'
) ENGINE=InnoDB DEFAULT CHARSET=utf8
     */
    public async syncJackpot() {
        try {
            const KEYS = REDIS_KEYS.PLATFORM_DATA;
            let jackpot = {
                time: moment(new Date()).format('YYYY-MM-DD hh:mm:00'),
                platformCatchRate: await this.app.redis.get(KEYS.PLATFORM_CATCHRATE),
                bonusPool: await this.app.redis.get(KEYS.BONUS_POOL),
                pumpPool: await this.app.redis.get(KEYS.PUMP_POOL),
                recharge: await this.app.redis.get(KEYS.PLATFORM_RECHARGE),
                cash: await this.app.redis.get(KEYS.PLATFORM_CASH),
                give: await this.app.redis.get(KEYS.PLATFORM_GIVE),
                totalGold: await this.app.redis.get(KEYS.TOTALGOLD),
            };
            await this.initJackpot(jackpot);
            let sql = ``;
            sql += `INSERT INTO tbl_bonuspool `;
            sql += `(time, platformCatchRate, bonusPool, pumpPool, recharge, cash, give, totalGold) `;
            sql += `VALUES(`;
            sql += "'" + jackpot.time + "',";
            sql += `${jackpot.platformCatchRate},`;
            sql += `${jackpot.bonusPool},`;
            sql += `${jackpot.pumpPool},`;
            sql += `${jackpot.recharge},`;
            sql += `${jackpot.cash},`;
            sql += `${jackpot.give},`;
            sql += `${jackpot.totalGold})`;
            await this.app.mysql.query(sql, []);
            return { result: true, data: 'success to sync jackpot' };
        } catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    /**
     * 初始化奖池相关数据.
     * @param jackpot 
     */
    private async initJackpot(jackpot) {
        const KEYS = REDIS_KEYS.PLATFORM_DATA;
        const jackpotDef = [
            { member: 'platformCatchRate', key: KEYS.PLATFORM_CATCHRATE, def: 1 },
            { member: 'bonusPool', key: KEYS.BONUS_POOL, def: 0 },
            { member: 'pumpPool', key: KEYS.PUMP_POOL, def: 0 },
            { member: 'recharge', key: KEYS.PLATFORM_RECHARGE, def: 0 },
            { member: 'cash', key: KEYS.PLATFORM_CASH, def: 0 },
            { member: 'give', key: KEYS.PLATFORM_GIVE, def: 0 },
            { member: 'totalGold', key: KEYS.TOTALGOLD, def: 0 },
        ];
        for (let i = 0; i < jackpotDef.length; i++) {
            let member = jackpotDef[i].member;
            let key = jackpotDef[i].key;
            let def = jackpotDef[i].def;
            if (null == jackpot[member]) {
                jackpot[member] = def;
                await this.app.redis.set(key, def);
            }
        }
    }

    /**
     * 获取指定玩家数据
    hset pair:uid:player_catch_rate 69914 1
     */
    public async queryPlayer(data) {
        let uid = data.uid;
        try {
            let account = {
                id: await this.app.redis.hget(REDIS_KEYS.ID, uid),
                nickname: await this.app.redis.hget(REDIS_KEYS.NICKNAME, uid),
                recharge: await this.app.redis.hget(REDIS_KEYS.RECHARGE, uid) || 0,
                cash: await this.app.redis.hget(REDIS_KEYS.CASH, uid) || 0,
                gold: await this.app.redis.hget(REDIS_KEYS.GOLD, uid) || 0,
                gain_loss: await this.app.redis.hget(REDIS_KEYS.GAIN_LOSS, uid) || 0,
                player_catch_rate: await this.app.redis.hget(REDIS_KEYS.PLAYER_CATCH_RATE, uid),
            };
            await this.initAccount(account);
            return { result: true, data: account };
        } catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    /**
     * 初始玩家捕获率.
     * @param account 
     */
    private async initAccount(account) {
        const accountDef = [
            { member: 'player_catch_rate', key: REDIS_KEYS.PLAYER_CATCH_RATE, def: 1 },
        ];
        for (let i = 0; i < accountDef.length; i++) {
            let member = accountDef[i].member;
            let key = accountDef[i].key;
            let def = accountDef[i].def;
            if (null == account[member]) {
                account[member] = def;
                await this.app.redis.hset(key, account.id, def);
            }
        }
    }

    /**
     * 获取盈亏排行榜
     * set rank:gain:result "[{\"uid\":1,\"nickname\":\"fj_1\",\"recharge\":1000,\"cash\":400,\"gold\":500,\"profit\":-100,\"player_catch_rate\":1}]"
     * set rank:loss:result "[{\"uid\":1,\"nickname\":\"fj_1\",\"recharge\":1000,\"cash\":400,\"gold\":500,\"profit\":-100,\"player_catch_rate\":1}]"
     */
    public async queryProfit(data) {
        const QUERY_PROFIT_TYPE = {
            GAIN: 1,
            LOSS: 2,
        };
        let type = data.type;
        try {
            switch (Number(type)) {
                case QUERY_PROFIT_TYPE.GAIN:
                    return await this.gain(data);
                case QUERY_PROFIT_TYPE.LOSS:
                    return await this.loss(data);
                default:
                    return { result: false, errorCode: this.app.config.ErrorCode.TYPE_UNDEFINED };
            }
        } catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    /**
     * 盈利排行榜
     * 数据结构:
     */
    public async gain(data) {
        try {
            let page = data.page || 1;
            let count = data.count || 10;
            const RANK = REDIS_KEYS.RANK;
            let page_int = Number(page);
            let count_int = Number(count);
            let start = (page_int - 1) * count_int;
            let end = page_int * count - 1;
            let ret = await this.app.redis.zrevrange(RANK.GAIN, start, end, 'WITHSCORES');
            let result: any = [];
            let fields = [
                accountKey.ID,
                accountKey.NICKNAME,
                accountKey.RECHARGE,
                accountKey.CASH,
                accountKey.GOLD,
                accountKey.PLAYER_CATCH_RATE
            ]
            for (let i = 0; i < ret.length; i += 2) {
                let id = ret[i];
                let profit = ret[i + 1];
                let account = await import_utils.redisAccountSync.getAccountAsync(id, fields);
                if (account) {
                    let gain_data = {
                        uid: id,
                        nickname: account.nickname,
                        recharge: account.recharge,
                        cash: account.cash,
                        gold: account.gold,
                        profit: profit,
                        player_catch_rate: account.player_catch_rate
                    }
                    result.push(gain_data);
                }
            }

            return { result: true, data: result };
        } catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    /**
    * 亏损排行榜
    */
    public async loss(data) {
        try {
            let page = data.page || 1;
            let count = data.count || 10;
            const RANK = REDIS_KEYS.RANK;
            let page_int = Number(page);
            let count_int = Number(count);
            let start = (page_int - 1) * count_int;
            let end = page_int * count - 1;
            let ret = await this.app.redis.zrange(RANK.LOSS, start, end, 'WITHSCORES');
            let result: any = [];
            let fields = [
                accountKey.ID,
                accountKey.NICKNAME,
                accountKey.RECHARGE,
                accountKey.CASH,
                accountKey.GOLD,
                accountKey.PLAYER_CATCH_RATE
            ]
            for (let i = 0; i < ret.length; i += 2) {
                let id = ret[i];
                let profit = ret[i + 1];
                let account = await import_utils.redisAccountSync.getAccountAsync(id, fields);
                if (account) {
                    let gain_data = {
                        uid: id,
                        nickname: account.nickname,
                        recharge: account.recharge,
                        cash: account.cash,
                        gold: account.gold,
                        profit: profit,
                        player_catch_rate: account.player_catch_rate
                    }
                    result.push(gain_data);
                }
            }

            return { result: true, data: result };
        } catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    /**
     * 参数修正
     */
    public async changeRate(data) {
        const CHANGE_RATE_TYPE = {
            JACKPOT: 1,
            PLAYER: 2,
        };

        let type = data.type;
        let rate = data.rate / 100;
        console.log('type:', type);
        console.log('rate:', rate);
        try {
            switch (Number(type)) {
                case CHANGE_RATE_TYPE.JACKPOT:
                    const KEYS = REDIS_KEYS.PLATFORM_DATA;
                    let timeDt = data.globalGpctOut;
                    await this.app.redis.set(KEYS.G_GPCT_OUT_TIMESTAMP, new Date().getTime());
                    await this.app.redis.set(KEYS.G_GPCT_OUT, timeDt);
                    await this.app.redis.set(KEYS.PLATFORM_CATCHRATE, rate);
                    await this.app.redis.publish(REDIS_KEYS.DATA_EVENT_SYNC.PLATFORM_CATCHRATE, JSON.stringify({ value: rate }));

                    await this.app.redis.expire(KEYS.G_GPCT_OUT, timeDt); //注意过期
                    await this.app.redis.expire(KEYS.PLATFORM_CATCHRATE, timeDt);
                    await this.app.redis.expire(KEYS.G_GPCT_OUT_TIMESTAMP, timeDt);
                    return { result: true, data: '全服命中修正成功' };
                case CHANGE_RATE_TYPE.PLAYER:
                    let uid = data.uid;
                    console.log('uid:', uid);
                    await this.app.redis.hset(REDIS_KEYS.GAIN_LOSS_LIMIT, uid, data.personalGpctOut);
                    await this.app.redis.publish(REDIS_KEYS.DATA_EVENT_SYNC.PLAYER_GAIN_LOSS_LIMIT, JSON.stringify({ uid: uid, value: data.personalGpctOut }));
                    await this.app.redis.hset(REDIS_KEYS.PLAYER_CATCH_RATE, uid, rate);
                    await this.app.redis.publish(REDIS_KEYS.DATA_EVENT_SYNC.PLAYER_CATCH_RATE, JSON.stringify({ uid: uid, value: rate }));
                    return { result: true, data: '玩家捕获率修正成功' };
                default:
                    return { result: false, errorCode: this.app.config.ErrorCode.TYPE_UNDEFINED };
            }
        } catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    /**
     * 读取对应类型的运营配置
     */
    public async queryOperation() {
        return await operationDao.getAll(this.app);
    }

    /**
     * 修改对应类型的运营配置
     */
    public async updateOperation(cdata) {
        let data = JSON.parse(cdata);
        return await operationDao.updateById(this.app, data);
    }

    /**
     * 获取实物兑换开关
     */
    public async getSwitch() {
        return await operationDao.getSwitch(this.app);
    }

    /**
     * 修改实物兑换开关
     */
    public async updateSwitch(data: number) {
        console.log("updateSwitch:", data);
        return await operationDao.updateSwitch(this.app, data);
    }

    /**
     * 日志查询
     */
    public async queryLog(cdata) {

        let data = JSON.parse(cdata);
        console.log("queryLog:", data)
        const DB_TABLE = {
            "1": "tbl_gold_log",
            "2": "tbl_pearl_log",
            "3": "tbl_weapon_log",
            "4": "tbl_skill_log",
        };
        let table = DB_TABLE[data.type];
        let ret = await logDao.get(this.app, table, data.uid, data.start_date, data.end_date);
        let res = ret.data;
        if (ret.result) {
            for (let i = 0; i < res.length; i++) {
                res[i]['log_at'] = moment(res[i]['log_at']).format('YYYY-MM-DD h:mm:ss');
            }
        }
        return ret;
    }

    /**
     * 每日游戏统计
     */
    public async getDailyStatistics(cdata) {

        let data = JSON.parse(cdata);
        console.log("getDailyStatistics:", data);
        let ret = await dailyStatisticsDao.getDailyStatistics(this.app, data.start_date, data.end_date);
        return ret;
    }

}

export default GameData;