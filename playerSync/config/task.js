module.exports = {
    /**
     * 非活跃用户数据移除redis,存入到mysql
     */
    userKick: {
        enable: false,
        time: '*/5,*,*,*,*,*',
        active_timeout: 30 * 24 * 60 * 60 * 1000,
        readLimit: 2000,
        writeLimit: 100,
    },

    /**
     * 玩家游戏数据实时同步到mysql
     */
    userSync: {
        enable: true,
        time: '*/10,*,*,*,*,*',
        readLimit: 1000,
        writeLimit: 100,
    }
};