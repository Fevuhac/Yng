module.exports = {
    DBType:{
        MYSQL:0,
        REDIS:1,
        MONGO:2,
        checkValid:function (dbtype) {
            switch (dbtype){
                case module.exports.DBType.REDIS:
                case module.exports.DBType.MYSQL:
                case module.exports.DBType.MONGO:
                    return true;
                default:
                    return false;
            }
        }
    },

    RankType:{
        GODDESS: "rank:goddess", //女神波数排行
        MATCH: "rank:match", //排位赛胜点
        AQUARIUM: "rank:aquarium", //宠物鱼总等级排行
        CHARM: "rank:charm", //魅力值排行
        BP: "rank:bp", //捕鱼积分
        FLOWER: "rank:flower", //人气王排行

        //排行数据最佳值，达成时间，用于排名相同时，先达成的玩家排名靠前
        GODDESS_TIMESTAMP: "rank:goddess:timestamp",
        MATCH_TIMESTAMP: "rank:match:timestamp",
        AQUARIUM_TIMESTAMP: "rank:aquarium:timestamp",
        CHARM_TIMESTAMP: "rank:charm:timestamp",
        BP_TIMESTAMP: "rank:bp:timestamp",
        FLOWER_TIMESTAMP: "rank:flower:timestamp",
    }


};