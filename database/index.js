module.exports = {
    dbclient:require('./dbclient'),
    dbUtils:require('./utils'),
    dbConsts:require('./consts'),
    databaseConfig:{
        redis:require('./config/database/redis.json'),
        mongo:require('./config/database/mongo.json'),
        mysql:require('./config/database/mysql.json'),
    },
};