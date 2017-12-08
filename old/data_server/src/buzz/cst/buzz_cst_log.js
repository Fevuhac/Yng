var REDIS_KEYS = require('./buzz_cst_redis_keys').REDIS_KEYS,
    LOG = REDIS_KEYS.LOG;

var SYS_LOG = {
    TYPE: [
        {redis_key: LOG.BAN_USER},//0
        // {redis_key: LOG.BAN_USER},//1
        // {redis_key: LOG.BAN_USER},//2
    ],
};

exports.SYS_LOG = SYS_LOG;