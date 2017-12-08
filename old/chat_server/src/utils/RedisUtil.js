////////////////////////////////////////////////////////////
// Redis Tools
////////////////////////////////////////////////////////////

//==============================================================================
// debug
//==============================================================================
var DEBUG = 0;
var ERROR = 1;
var TAG = "【RedisUtil】";

//==============================================================================
// import
//==============================================================================

var StringUtil = require("./StringUtil");

var EVENT = require("../buzz/cst/buzz_cst_event").EVENT;
var SERVER_CFG = require("../cfgs/server_cfg").SERVER_CFG;
var REDIS = SERVER_CFG.REDIS;

var redis = require('redis'),
    isReady = 0,
    isConnect = 0,
    RDS_PORT = REDIS.RDS_PORT,
    RDS_HOST = REDIS.RDS_HOST,
    RDS_PWD = REDIS.RDS_PWD,
    RDS_OPTS = {auth_pass : RDS_PWD};

var client = null;
/** 用于发布的Redis客户端 */
var pub = redis.createClient(RDS_PORT, RDS_HOST, RDS_OPTS);
/** 用于订阅的Redis客户端 */
var sub = redis.createClient(RDS_PORT, RDS_HOST, RDS_OPTS);

function prepare(next) {
    if (client == null) {
        client = redis.createClient(RDS_PORT, RDS_HOST, RDS_OPTS);

        client.on('connect', function(err){
            const FUNC = TAG + "clientConnect() --- ";
            isConnect = 1;
            console.log(FUNC + 'connect');
        });

        client.on('ready', function(err){
            const FUNC = TAG + "clientReady() --- ";
            isReady = 1;
            console.log(FUNC + 'ready');
            next && next();
        });
    }
    else {
        next && next();
    }
}


//==============================================================================
// export
//==============================================================================

exports.prepare = prepare;

exports.set = set;
exports.mset = mset;
exports.get = get;
exports.mget = mget;
exports.hset = hset;
exports.hmset = hmset;
exports.hget = hget;
exports.hmget = hmget;
exports.hgetall = hgetall;

exports.lpush = lpush;
exports.lrange = lrange;
exports.rpush = rpush;
exports.blpop = blpop;
exports.brpop = brpop;
exports.expire = expire;

exports.sadd = sadd;
exports.scard = scard;
exports.spop = spop;
exports.srandmember = srandmember;

exports.zadd = zadd;
exports.zcount = zcount;
exports.zcard = zcard;
exports.zrange = zrange;
exports.zrevrange = zrevrange;
exports.zrangewithscores = zrangewithscores;
exports.zrevrangewithscores = zrevrangewithscores;
exports.zscore = zscore;
exports.zrank = zrank;
exports.zrevrank = zrevrank;
exports.zrem = zrem;
exports.zremrangebyrank = zremrangebyrank;
exports.zrevremrangebyrank = zrevremrangebyrank;

exports.publish = publish;
exports.subscribe = subscribe;

// 排行榜
exports.initRank = initRank;
exports.updateRank = updateRank;
exports.getRank = getRank;

exports.ltrim = ltrim;
exports.del = del;
exports.multi = multi;
exports.getClient = getClient;
exports.sismember = sismember;
exports.smembers = smembers;
exports.lrem = lrem;
exports.zrangebyscore = zrangebyscore;

function getClient() {
    return client;
}

exports.addListener = addListener;


//==============================================================================
// implement
//==============================================================================

/**
 * 添加一个事件侦听(buzz_redis可以调用RedisUtil但是RedisUtil不能调用buzz_redis).
 */
function addListener(emmiter) {
    sub.on('message', function(channel, message){
        const FUNC = TAG + "addListener() --- ";
        if (DEBUG) console.log(FUNC + 'channel:', channel);
        if (DEBUG) console.log(FUNC + 'message:', message);
        emmiter.emit(EVENT.REDIS, {
            channel: channel,
            message: message,
        });
    });
}

/**
 * client.set(key,value,callback),callback 函数有2个回调参数,error和response, error表示操作过程中的错误提示值为null表示没有错误,response为布尔值
 * Set Value for Key.
 * client must be ready and connected.
 * @param cb callback(err, res) res usually will return "OK".
 */
function set(key, value, cb) {
    const FUNC = TAG + "set() --- ";
    if (isReadyAndConnected(cb)) {
        client.set(key, value, cb);
    }
}

/**
 * 批量设置键值对
var key_value = [
    "test_key1", "test_value1",
    "test_key2", "test_value2",
    "test_key3", "test_value3",
];
 */
function mset(key_value, cb) {
    const FUNC = TAG + "set() --- ";
    if (isReadyAndConnected(cb)) {
        client.mset(key_value, cb);
    }
}

/**
 * client.get(key,callback),callback 函数有2个回调参数,error和response, error表示操作过程中的错误提示值为null表示没有错误,response为获取到的值,null表示没有获取到数据
 * Get Value from Key.
 * client must be ready and connected.
 * @param cb callback(err, value) value will be returned.
 */
function get(key, cb) {
    const FUNC = TAG + "get() --- ";
    if (isReadyAndConnected(cb)) {
        client.get(key, cb);
    }
}

/**
 * 批量获取键对应的值
var key_list = [
    "test_key1",
    "test_key2",
    "test_key3",
];
 * return
[ 'test_value1', 'test_value2', 'test_value3' ]
 */
function mget(key_list, cb) {
    const FUNC = TAG + "mget() --- ";
    if (isReadyAndConnected(cb)) {
        client.mget(key_list, cb);
    }
}

/**
 * client.hset(hashkey,field,value,callback) 哈希数据类型, 第一个参数为KEY名称,第二个为需要设置的字段KEY,第三个为值,第四个参数为回调参数,内容和set一致
 * Set Hash Value for Key.
 * client must be ready and connected.
 */
function hset(hashkey, field, value, cb) {
    const FUNC = TAG + "hset() --- ";
    if (isReadyAndConnected(cb)) {
        if (undefined == value) {
            console.log(FUNC + "hashkey:", hashkey);
            console.log(FUNC + "field:", field);
        }
        if (cb) {
            client.hset(hashkey, field, value, cb);
        }
        else {
            client.hset(hashkey, field, value);
        }
    }
}

/**
 * client.hmset(hashkey,field,value,field,value ….. callback) 哈希数据类型, 第一个参数为KEY名称,后面的参数为不固定参数,数据格式是 key,value ,key, value 
 * Set Multi Value for Key.
 * client must be ready and connected.
 */
function hmset(hashkey, map, cb) {
    const FUNC = TAG + "hmset() --- ";
    if (isReadyAndConnected(cb)) {
        client.hmset(hashkey, map, function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}

/**
 * client.hget(hashkey,field,callback) 获取hash数据中的某一个字段值
 * Set Hash Value from Key.
 * client must be ready and connected.
 */
function hget(hashkey, field, cb) {
    const FUNC = TAG + "hget() --- ";
    if (isReadyAndConnected(cb)) {
        client.hget(hashkey, field, cb);
    }
}

/**
 * 批量获取hmset设置的值
 * hashkey = "list2"
 * field_list = ["key1", "key2"]
 */
function hmget(hashkey, field_list, cb) {
    const FUNC = TAG + "hmget() --- ";
    if (isReadyAndConnected(cb)) {
        client.hmget(hashkey, field_list, cb);
    }
}

/**
 * client.hgetall(hashkey,callback) 获取hash数据种所有的数据,包括字段与值
 * Get Multi Value from Key.
 * client must be ready and connected.
 * cb(err, res)
 */
function hgetall(hashkey, cb) {
    const FUNC = TAG + "hgetall() --- ";
    if (isReadyAndConnected(cb)) {
        client.hgetall(hashkey, function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            // console.log(FUNC + 'print res');
            // console.dir(res);
            cb && cb(null, res);
        });
    }
}

/**
 * client.lpush(key, value, callback) 队列操作, 左推进入队列
 * 示例:
 * lpush("alist", "1")
 * lpush("alist", "2")
 * lpush("alist", "3")
 * alist:["3","2","1"]
 */
function lpush(key, value, cb) {
    const FUNC = TAG + "lpush() --- ";
    if (isReadyAndConnected(cb)) {
        client.lpush(key, value, function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}

/**
 * client.lrange(key, min, max, callback) 队列操作, 从左边开始获取队列的元素
 * 示例:
 * alist:["3","2","1"]
 * lrange("alist", 0, 1) = ["3","2"]
 * lrange("alist", 1, 2) = ["2","1"]
 */
function lrange(key, min, max, cb) {
    const FUNC = TAG + "lrange() --- ";
    if (isReadyAndConnected(cb)) {
        client.lrange(key, min, max, function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}

/**
 * client.rpush(key, value, callback) 队列操作, 右推进入队列
 * 示例:
 * rpush("alist", "1")
 * rpush("alist", "2")
 * rpush("alist", "3")
 * alist:["1","2","3"]
 */
function rpush(key, value, cb) {
    const FUNC = TAG + "rpush() --- ";
    if (isReadyAndConnected(cb)) {
        client.rpush(key, value, function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}

/**
 * Block Left Pop.
 * 阻塞式弹出队列数据, 从数据顶部(左侧)弹出,
 * 当 BLPOP 被调用时, 如果给定 key 内至少有一个非空列表，那么弹出遇到的第一个非空列表的头元素，
 * 并和被弹出元素所属的列表的名字一起，组成结果返回给调用者。
 * 当存在多个给定 key 时， BLPOP 按给定 key 参数排列的先后顺序，依次检查各个列表。
 */
function blpop(key, timeout, cb) {
    const FUNC = TAG + "blpop() --- ";
    if (isReadyAndConnected(cb)) {
        client.blpop(key, timeout, function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}

/**
 * Block Right Pop.
 * 阻塞式弹出队列数据,从数据尾部(右侧)弹出,当给定多个 key 参数时，
 * 按参数 key 的先后顺序依次检查各个列表，弹出第一个非空列表的尾部元素。
 * 使用方法同 BLPOP一致,只是数据弹出的方式不一样 
 */
function brpop(key, timeout, cb) {
    const FUNC = TAG + "brpop() --- ";
    if (isReadyAndConnected(cb)) {
        client.brpop(key, timeout, function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}

/**
 * 将一个或多个 member 元素加入到集合 key 当中，已经存在于集合的 member 元素将被忽略。
 * 假如 key 不存在，则创建一个只包含 member 元素作成员的集合。
 * 当 key 不是集合类型时，返回一个错误。
 */
function sadd(key, member, cb) {
    const FUNC = TAG + "sadd() --- ";
    if (isReadyAndConnected(cb)) {
        client.sadd(key, member, function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}

/**
 * 返回集合 key 的基数(集合中元素的数量)。
 */
function scard(key, cb) {
    const FUNC = TAG + "scard() --- ";
    if (isReadyAndConnected(cb)) {
        client.scard(key, function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}

/**
 * 移除并返回集合中的一个随机元素。
 * 如果只想获取一个随机元素，但不想该元素从集合中被移除的话，可以使用 SRANDMEMBER 命令。
 */
function spop(key, cb) {
    const FUNC = TAG + "spop() --- ";
    if (isReadyAndConnected(cb)) {
        client.spop(key, function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}

/**
 * 如果命令执行时，只提供了 key 参数，那么返回集合中的一个随机元素。
 */
function srandmember(key, cb) {
    const FUNC = TAG + "srandmember() --- ";
    if (isReadyAndConnected(cb)) {
        client.srandmember(key, function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}

/**
 * 添加一个或多个成员到有序集合，或者如果它已经存在更新其分数
 */
function zadd(key, score, member, cb) {
    const FUNC = TAG + "zadd() --- ";
    if (isReadyAndConnected(cb)) {
        client.zadd(key, score, member, function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}

/**
 * 计算在有序集合中指定区间分数的成员数.
 */
function zcount(key, cb) {
    const FUNC = TAG + "zcount() --- ";
    if (isReadyAndConnected(cb)) {
        client.zcount(key, -Infinity, Infinity, function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}

/**
 * 获取有序集合的成员数
 */
function zcard(key, cb) {
    const FUNC = TAG + "zcard() --- ";
    if (isReadyAndConnected(cb)) {
        client.zcard(key, function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}

/**
 * 由索引返回一个成员范围的有序集合。
 * 升序
 */
function zrange(key, start, stop, cb) {
    const FUNC = TAG + "zrange() --- ";
    if (isReadyAndConnected(cb)) {
        client.zrange(key, start, stop, function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}

/**
 * 由索引返回一个成员范围的有序集合。
 * 升序带分数
 */
function zrangewithscores(key, start, stop, cb) {
    const FUNC = TAG + "zrangewithscores() --- ";
    if (isReadyAndConnected(cb)) {
        client.zrange(key, start, stop, 'withscores', function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}

/**
 * 由索引返回一个成员范围的有序集合。
 * 降序
 */
function zrevrange(key, start, stop, cb) {
    const FUNC = TAG + "zrevrange() --- ";
    if (isReadyAndConnected(cb)) {
        client.zrevrange(key, start, stop, function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}

/**
 * 由索引返回一个成员范围的有序集合。
 * 降序带分数
 */
function zrevrangewithscores(key, start, stop, cb) {
    const FUNC = TAG + "zrevrangewithscores() --- ";
    if (isReadyAndConnected(cb)) {
        client.zrevrange(key, start, stop, 'withscores', function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}

/**
 * 获取给定成员相关联的分数在一个有序集合。
 */
function zscore(key, member, cb) {
    const FUNC = TAG + "zscore() --- ";
    if (isReadyAndConnected(cb)) {
        client.zscore(key, member, function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}

/**
 * 确定成员的索引中有序集合。
 * 升序排名
 */
function zrank(key, member, cb) {
    const FUNC = TAG + "zrank() --- ";
    if (isReadyAndConnected(cb)) {
        client.zrank(key, member, function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}

/**
 * 确定成员的索引中有序集合。
 * 降序排名
 */
function zrevrank(key, member, cb) {
    const FUNC = TAG + "zrevrank() --- ";
    if (isReadyAndConnected(cb)) {
        client.zrevrank(key, member, function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}

function zrem(key, member, cb) {
    const FUNC = TAG + "zrem() --- ";
    if (isReadyAndConnected(cb)) {
        client.zrem(key, member, function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}

/**
 * Redis Zremrangebyrank 命令用于移除有序集中，指定排名(rank)区间内的所有成员。
 * ZREMRANGEBYRANK salary 0 1       # 移除下标 0 至 1 区间内的成员
 * 
 */
function zremrangebyrank(key, start, stop, cb) {
    const FUNC = TAG + "zremrangebyrank() --- ";
    if (isReadyAndConnected(cb)) {
        client.zremrangebyrank(key, start, stop, function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}

/**
 * zremrangebyrank只能按升序移除, 需要自定义一个方法按降序移除
 * 
 */
function zrevremrangebyrank(key, start, stop, cb) {
    const FUNC = TAG + "zrevremrangebyrank() --- ";
    if (isReadyAndConnected(cb)) {
        client.zcard(key, function(err, count) {
            if (!handleErr(FUNC, err, cb)) return;
            if (count <= start) {
                return cb && cb(null, 0);
            }
            else {
                stop = count - start - 1;
                start = 0;
                client.zremrangebyrank(key, start, stop, function(err, res) {
                    if (!handleErr(FUNC, err, cb)) return;
                    cb && cb(null, res);
                });
            }
        });
    }
}

/**
 * 测试Redis的Client的publish方法
 */
function publish(channel, message, cb) {
    const FUNC = TAG + "publish() --- ";
    pub.publish(channel, message, function(err, res) {
        if (!handleErr(FUNC, err, cb)) return;
        if (DEBUG) {
            console.log(FUNC + "channel:", channel);
            if (StringUtil.isString(message)) {
                console.log(FUNC + "message length:", StringUtil.strLen(message));
            }
            else {
                console.log(FUNC + "message:", message);
            }
        }
        cb && cb(null, res);
    });
}

/**
 * 测试Redis的Client的subscribe方法
 */
function subscribe(channel, cb) {
    const FUNC = TAG + "subscribe() --- ";
    sub.subscribe(channel, function(err, res) {
        if (!handleErr(FUNC, err, cb)) return;
        cb && cb(null, res);
    });
}


function initRank(rank_name, score, member) {
    const FUNC = TAG + "initRank() --- ";
}

/**
 * 更新一个玩家member在排行榜rank_name上的分数.
 */
function updateRank(rank_name, platform, score, member) {
    const FUNC = TAG + "updateRank() --- ";
    zadd(rank_name + ":" + platform, score, member);
    hset(rank_name + ":timestamp", member, new Date().getTime());
}

/**
 * 获取排行榜rank_name的前面1000个玩家排行纪录.
 * 获取后缓存到服务器缓存中并进行时间排序, 每隔1秒执行一次
 */
function getRank(rank_name, platform, cb) {
    const FUNC = TAG + "getRank() --- ";
    zrevrangewithscores(rank_name + ":" + platform, 0, 9999, cb);
}

/**
 * ltrim命令，对一个列表进行修剪
 */
function ltrim(key, start, end, cb) {
    const FUNC = TAG + "ltrim() --- ";
    if (isReadyAndConnected(cb)) {
        client.ltrim(key, start, end, function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}

/**
 * 删除一个键.
 */
function del(key, cb) {
    const FUNC = TAG + "del() --- ";
    if (isReadyAndConnected(cb)) {
        client.del(key, function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}



//==============================================================================
// private
//==============================================================================

function isReadyAndConnected(cb) {
    if (isReady && isConnect) {
        return 1;
    }
    else {
        cb && cb(new Error("Redis is not ready!"));
        return 0;
    }
}

function handleErr(FUNC, err, cb) {
    if (err) {
        console.error(FUNC + "err:", err);
        cb && cb(err);
        return 0;
    }
    return 1;
}

/**
 * 设置过期时间expire
 */
function expire(key,time,cb) {
    const FUNC = TAG + "expire() --- ";
    if (isReadyAndConnected(cb)) {
        client.expire(key, time, function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}

/**
 * multi() 多个语句查询
 */
function multi(data,cb) {
    const FUNC = TAG + "multi() --- ";
    if (isReadyAndConnected(cb)) {
        client.multi(data).exec(function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}

/**
 * sismember() 查看member是否在集合key中
 */
function sismember(key,member,cb) {
    const FUNC = TAG + "sismember() --- ";
    if (isReadyAndConnected(cb)) {
        client.sismember(key,member,function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}

/**
 * smembers() 返回一个集合中的所有元素
 */
function smembers(key,cb) {
    const FUNC = TAG + "smembers() --- ";
    if (isReadyAndConnected(cb)) {
        client.smembers(key,function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}

/**
 * lrem(key,count,value,cb) 从存于 key 的列表里移除前 count 次出现的值为 value 的元素。 这个 count 参数通过下面几种方式影响这个操作：
 * count > 0: 从头往尾移除值为 value 的元素。
 * count < 0: 从尾往头移除值为 value 的元素。
 * count = 0: 移除所有值为 value 的元素。
 * 比如， LREM list -2 “hello” 会从存于 list 的列表里移除最后两个出现的 “hello”。
 * 需要注意的是，如果list里没有存在key就会被当作空list处理，所以当 key 不存在的时候，这个命令会返回 0。
 */
function lrem(key,count,value,cb) {
    const FUNC = TAG + "lrem() --- ";
    if (isReadyAndConnected(cb)) {
        client.lrem(key,count,value,function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}
/**
 * ZRANGEBYSCORE zrangebyscore 通过score区间返回member
 * @param key
 * @param count
 * @param value
 * @param cb
 * @constructor
 */
function zrangebyscore(key,min,max,cb) {
    const FUNC = TAG + "zrangebyscore() --- ";
    if (isReadyAndConnected(cb)) {
        client.zrangebyscore(key,min,max,function(err, res) {
            if (!handleErr(FUNC, err, cb)) return;
            cb && cb(null, res);
        });
    }
}
//==============================================================================
// More
//==============================================================================
// 1. Another method use auth
/*
var redis = require('redis'),
    RDS_PORT = 6379,
    RDS_HOST = '127.0.0.1',
    RDS_PWD = 'show_me_your_pwd',
    RDS_OPTS = {},
    client = redis.createClient(RDS_PORT, RDS_HOST, RDS_OPTS);

client.auth(RDS_PWD, function(err){
    console.log('certificate success');
});

client.on('ready', function(err){
    console.log('ready');
});
*/