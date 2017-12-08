
exports.getDailyStatistics = async (app, start_date, end_date) => {
    try {
        let sql = '';
        sql += 'SELECT ';
        sql += '`account_id`, ';
        sql += '`login_count`, ';
        sql += '`logout_count`, ';
        sql += '`gold_gain`, ';
        sql += '`gold_cost`, ';
        sql += '`game_time`, ';
        sql += '`pearl_gain`, ';
        sql += '`pearl_cost`, ';
        sql += '`skill_gain`, ';
        sql += '`skill_cost`, ';
        sql += '`weapon_levelup_exp`, ';
        sql += '`weapon_levelup_pearl`, ';
        sql += '`gold_shop_count`, ';
        sql += '`gold_shop_amount`, ';
        sql += '`pearl_shop_count`, ';
        sql += '`pearl_shop_amount`, ';
        sql += "DATE_FORMAT(`date`,'%Y-%m-%d') AS log_date, ";
        sql += "`date` ";
        sql += 'FROM tbl_daily_statistics ';
        sql += "WHERE date ";
        sql += "BETWEEN STR_TO_DATE('" + start_date + "','%Y-%m-%d') ";
        sql += "AND STR_TO_DATE('" + end_date + "','%Y-%m-%d')";
        let res = await app.mysql.query(sql, []);
        console.log('dailyStatisticsDao:', res);
        return { result: true, data: res, errCode: null }
    }
    catch (err) {
        console.log('err:', err);
        return { result: false, data: null, errCode: this.app.config.ErrorCode.DB_ERROR }
    }
}