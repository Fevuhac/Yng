class PlayerCache{
    constructor(){}
    static setData(uid, data){
        const key = `playerInfo_uid_${uid}`;
        logger.info("redis hmset " + key);
        redisClient.cmd.hmset(key, data, function (err) {
            if(err){
                logger.error(err);
            }
        })
    }

    static getData(uid, cb){
        const key = `playerInfo_uid_${uid}`;
        logger.info("redis hgetall " + key);
        redisClient.cmd.hgetall(key, function (err, data) {
            if(err){
                logger.error(err);
                utils.invokeCallback(cb, CONSTS.SYS_CODE.DB_ERROR);
                return;
            }
            console.log(data);
            console.log(data.info);
            utils.invokeCallback(cb, null, data);
        })
    }
}

module.exports = PlayerCache;