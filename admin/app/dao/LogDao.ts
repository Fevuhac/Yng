exports.get = async (app, table, id, start, end) => {
    try {
        let sql = "select * from " + table + " where account_id=? and log_at ";
        sql += "BETWEEN STR_TO_DATE('" + start + "','%Y-%m-%d') ";
        sql += "AND STR_TO_DATE('" + end + "','%Y-%m-%d') ";
        sql += "ORDER BY log_at";
        let res = await app.mysql.query(sql, [id])
        console.log('logDao get:', res);
        return { result: true, data: res, errCode: null }
    }
    catch (err) {
        console.log('err:', err);
        return { result: false, data: null, errCode: this.app.config.ErrorCode.DB_ERROR }
    }
}