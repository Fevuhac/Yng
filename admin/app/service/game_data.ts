
const Service = require('egg').Service;
const moment = require('moment');


class GameData extends Service {

    /**
     * 实时数据
     */
    public async realtime(first_date: string, second_date: string) {

        try {
            let sql = "select created_at, new_account, login_count, account_count from tbl_stat_hour where date(created_at)=?";

            let first = await this.app.mysql.query(sql, [first_date]);
            let second = await this.app.mysql.query(sql, [second_date]);
            for (var i = 0; i < first.length; i++) {
                var log_date = first[i]['created_at'];
                first[i]['created_at'] = moment().format(log_date, 'yyyy-MM-dd HH');
            }
            for (var i = 0; i < second.length; i++) {
                var log_date = second[i]['created_at'];
                second[i]['created_at'] = moment().format(log_date, 'yyyy-MM-dd HH');
            }
            return [first, second];
        } catch (err) {
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }

    }

    /**
     * 在线状态
     */
    public async online(start_time: string, end_time: string) {
        try {
            let sql = "select time, online_count, link_count from tbl_link_sum where time>'?' and time<'?' group by time";
            let result =await this.app.mysql.query(sql, [start_time, end_time]);
            return { result: true, data: result };
        } catch (err) {
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }


    }

    /**
     * 注册激活
     */
    public async register(start_date: string, end_date: string) {
        try {
            let sql = "select log_date, new_temp_account, new_nickname_account, new_bind_account from tbl_stat_day where log_date "
            sql += "BETWEEN STR_TO_DATE('" + start_date + "','%Y-%m-%d')";
            sql += "AND STR_TO_DATE('" + end_date + "','%Y-%m-%d')";
            let result =await this.app.mysql.query(sql, []);
            return { result: true, data: result };
        } catch (err) {
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    /**
     * 活跃用户
     */
    public async active(start_date: string, end_date: string){
        try {
            let sql = "";
            sql += "SELECT * ";
            sql += "FROM tbl_stat_day  ";
            sql += "WHERE log_date ";
            sql += "BETWEEN STR_TO_DATE('" + start_date + "','%Y-%m-%d') ";
            sql += "AND STR_TO_DATE('" + end_date + "','%Y-%m-%d')";
            let result =await this.app.mysql.query(sql, []);
            return { result: true, data: result };
        } catch (err) {
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    /**
     * 付费用户
     */
    public async payuser(start_date: string, end_date: string){
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
            let result =await this.app.mysql.query(sql, []);
            for (var i = 0; i < result.length; i++) {
                var log_date = result[i]['log_date'];
                result[i]['log_date'] = moment().format(log_date, 'yyyy-MM-dd');
            }
            return { result: true, data: result };
        } catch (err) {
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    /**
     * 留存趋势
     */
    public async retention(start_date: string, end_date: string){
        try {
            let sql = "";
            sql += "SELECT log_date, (new_temp_account + new_nickname_account) AS new_account, drr, wrr, mrr FROM ";
            sql += "tbl_stat_day  ";
            sql += "WHERE log_date ";
            sql += "BETWEEN STR_TO_DATE('" + start_date + "','%Y-%m-%d') ";
            sql += "AND STR_TO_DATE('" + end_date + "','%Y-%m-%d')";
            let result =await this.app.mysql.query(sql, []);
            for (var i = 0; i < result.length; i++) {
                var log_date = result[i]['log_date'];
                result[i]['log_date'] = moment().format(log_date, 'yyyy-MM-dd');
                result[i]['drr'] = formatData(result[i]['drr'] * 100) + '%';
                result[i]['wrr'] = formatData(result[i]['wrr'] * 100) + '%';
                result[i]['mrr'] = formatData(result[i]['mrr'] * 100) + '%';
            }
            return { result: true, data: result };
        } catch (err) {
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }

        function formatData(input) {
            return input.toFixed(2);
        }
    }

     /**
     * 日志记录
     */
    public async log(start_date: string, end_date: string){
        try {
            let sql = "";
            sql += "SELECT * ";
            // 查询约束
            sql += "FROM tbl_order ";
            sql += "WHERE created_at ";
            sql += "BETWEEN STR_TO_DATE('" + start_date + "','%Y-%m-%d') ";
            sql += "AND STR_TO_DATE('" + end_date + "','%Y-%m-%d') ";
            sql += "AND status=0 ";
            let result =await this.app.mysql.query(sql, []);
            for (var i = 0; i < result.length; i++) {
                var created_at = result[i]['created_at'];
                result[i]['created_at'] = moment().format(created_at, 'yyyy-MM-dd HH:mm:ss (EEE)');
                if (result[i]['channel_cb'] != null) {
                    result[i]['channel_cb'] = JSON.parse(result[i]['channel_cb']);
                }
            }
            return { result: true, data: result };
        } catch (err) {
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    /**
     * 盈利排行榜
     */
    public async gain(){
        try{
            let android =await this.app.redis.get(`rank:gain:result:1`);
            let ios =await this.app.redis.get(`rank:gain:result:2`);
            console.log(android);
            return { result: true, data: {android:android,ios:ios}};
        }catch(err){
            console.log(err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

     /**
     * 亏损排行榜
     */
    public async loss(){
        try{
            let android =await this.app.redis.get(`rank:loss:result:1`);
            let ios =await this.app.redis.get(`rank:loss:result:2`);
            return { result: true, data: {android:android,ios:ios}};
        }catch(err){
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }
    
}

export default GameData;