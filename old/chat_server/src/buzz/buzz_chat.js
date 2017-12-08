/**
 * 聊天
 * Created by zhenghang on 2017/9/6.
 */
var RedisUtil = require('../utils/RedisUtil');
var DateUtil = require('../utils/DateUtil');
var CstError = require('./cst/buzz_cst_error'),
    ERROR_OBJ = CstError.ERROR_OBJ;
var REDIS_KEYS = require('./cst/buzz_cst_redis_keys').REDIS_KEYS,
    CHANNEL = REDIS_KEYS.CHANNEL,
    MSG = REDIS_KEYS.MSG,
    PAIR = REDIS_KEYS.PAIR;

var TAG = "【buzz_chat】";
var DEBUG = 0;

//messages 内存存储世界聊天信息
var messages_other = [], messages_ios = [], maxMessage = 200;

//处理世界聊天消息
function worldChat(channel, message) {
    const FUNC = TAG + "worldChat() --- ";
    if (!message)return;
    var messages = (channel == CHANNEL.WORLD_CHAT + ":2") ? messages_ios : messages_other;
    message = JSON.parse(message);
    if (DEBUG)console.log(FUNC + "message:", message);
    if (messages.length <= maxMessage) {
        messages.push(message);
    } else {
        messages.shift();
        messages.push(message);
    }

}

//处理私人聊天消息
function privateChat(channel, message) {
    if (!message)return;
    const FUNC = TAG + "privateChat() --- ";
    var msg = JSON.parse(message);
    //获取sender,receiver
    var recver = msg.recver;
    var sender = msg.sender;
    if (DEBUG)console.log(FUNC + "message:", recver, sender, message);
    RedisUtil.lpush(MSG.PRIVATE_MSG + "_" + recver, message);
    RedisUtil.ltrim(MSG.PRIVATE_MSG + "_" + recver, 0, 20);
    RedisUtil.expire(MSG.PRIVATE_MSG + "_" + recver, DateUtil.SECONDS_IN_ONE_DAY * 2);
    RedisUtil.lpush(MSG.PRIVATE_MSG + "_" + sender, message);
    RedisUtil.ltrim(MSG.PRIVATE_MSG + "_" + sender, 0, 20);
    RedisUtil.expire(MSG.PRIVATE_MSG + "_" + sender, DateUtil.SECONDS_IN_ONE_DAY * 2);
}

//拉取聊天信息
function getChat(dataObj, cb) {
    const FUNC = TAG + "getChat() --- ";
    var re = {time: new Date().getTime()};
    var result = [];
    //筛选
    var messages = dataObj.platform != 1 ? messages_ios : messages_other;
    if (DEBUG)console.log(FUNC + "dataObj:", dataObj);
    if (DEBUG)console.log(FUNC + "messages:", messages);
    var timestamp = dataObj.logintime || dataObj.timestamp;
    for (var i = messages.length - 1; i >= 0; i--) {
        var info = messages[i];
        if (info.time > timestamp) {
            result.push(info);
        } else {
            break;
        }
    }
    //拉取私人聊天信息
    getPrivateMessage(dataObj, function (err, r) {
        //re.msg = result.concat(r);
        //拉取好友请求
        var tmp = [];
        if (r)tmp = result.concat(r);
        getFriendAskMsg1(dataObj, function (err, reply) {
            if (err) {
                cb(err);
                return;
            }
            if (reply)tmp = tmp.concat(reply);
            re.msg = tmp;
            if (DEBUG)console.log(FUNC + "getWorldChat:", result);
            if (DEBUG)console.log(FUNC + "getPrivateMessage:", r);
            if (DEBUG)console.log(FUNC + "getFriendAskMsg:", reply);
            if (DEBUG)console.log(FUNC + "getChat:", re);
            cb(err, re);
        });
    });
}

//拉取私人聊天信息
function getPrivateMessage(dataObj, cb) {
    const FUNC = TAG + "getPrivateMessage() --- ";
    var uid = dataObj.token.split("_")[0];
    var timestamp = dataObj.timestamp;
    var result = [];
    RedisUtil.lrange(MSG.PRIVATE_MSG + "_" + uid, 0, -1, function (err, res) {
        if (err) {
            cb(err);
            return;
        }
        if (res) {
            for (var i = 0; i < res.length; i++) {
                var obj = JSON.parse(res[i]);
                if (DEBUG)console.log(FUNC + "obj:", obj);
                if (DEBUG)console.log(FUNC + "time:", timestamp, obj.time);
                if (obj.time > timestamp) {
                    result.push(obj);
                } else {
                    break;
                }
            }
        }
        if (DEBUG)console.log(FUNC + "result:", result);
        cb(null, result);
    })
}
function userInfo(req, dataObj, cb) {
    const FUNC = TAG + "userInfo() --- ";
    if (DEBUG)console.log(FUNC + "dataObj:", dataObj);
    getUserInfo(req.pool, dataObj, function (err, result) {
        if (err) {
            cb(err);
        }
        if (DEBUG)console.log(FUNC + "getUserInfo", result);
        cb(null, result);
    });
}

function getUserInfo(pool, dataObj, cb) {
    var ids = dataObj.uids;
    var uid = dataObj.token.split("_")[0];
    const FUNC = TAG + "getUserInfo() --- ";
    if (!ids) {
        cb(ERROR_OBJ.PARAM_MISSING);
        return;
    }
    var result = [];
    //首先查询redis
    var data = [
        ['hmget', PAIR.UID_NAME, ids],
        ['hmget', PAIR.UID_RANK, ids],
        ['hmget', PAIR.UID_VIP, ids],
        ['hmget', PAIR.UID_WEAPON, ids],
        ['hmget', PAIR.UID_WEAPON_SKIN_OWN, ids],
        ['hmget', PAIR.UID_FIGURE, ids],
        ['hmget', PAIR.UID_LEVEL, ids],
        ['hmget', PAIR.UID_SEX, ids],
        ['hmget', PAIR.UID_CITY, ids],
        ['hmget', PAIR.UID_QQ_FRIEND, ids],
        ['hmget', PAIR.UID_GAME_FRIEND, ids],
        ['hmget', PAIR.UID_CHARM_RANK, ids],
    ];
    RedisUtil.multi(data, function (err, replies) {
        if (err) {
            console.log(FUNC + "err:", err);
            cb(err);
            return;
        }
        var noid = [];
        if (DEBUG)console.log(FUNC + "replies:", replies);
        for (var i = 0; i < ids.length; i++) {
            var temp = {};
            if (!replies[0][i]) {
                noid.push(i);
            } else {
                temp['uid'] = parseInt(ids[i]);
                temp['nickname'] = replies[0][i];
                temp['rank'] = parseInt(replies[1][i]) || 0;
                temp['vip'] = parseInt(replies[2][i]) || 0;
                temp['wp'] = replies[3][i];
                temp['skin'] = replies[4][i] && JSON.parse(replies[4][i]) || [];
                temp['figure_url'] = replies[5][i];
                temp['lv'] = parseInt(replies[6][i]);
                temp['sex'] = parseInt(replies[7][i]);
                temp['city'] = replies[8][i];
                var qqf = replies[9][i];
                var gamef = replies[10][i];
                temp['charm_rank'] = replies[11][i];
                qqf = qqf && JSON.parse(qqf) || [];
                gamef = gamef && JSON.parse(gamef) || [];
                temp['friend'] = 0;
                for (var j = 0; j < qqf.length; j++) {
                    if (qqf[j] == uid) {
                        temp['friend'] = 2;
                    }
                }
                if (!temp['friend']) {
                    for (var k = 0; k < gamef.length; k++) {
                        if (gamef[k] == uid) {
                            temp['friend'] = 1;
                        }
                    }
                }
                result.push(temp);
            }
        }

        //缓存中没有的数据到数据库中查询
        if (noid.length > 0) {
            var sql = "SELECT a.id,a.tempname,a.channel_account_name,i.web_url,a.nickname,a.level,a.vip,a.weapon,a.weapon_skin, r.rank FROM `tbl_account` a " +
                "left join `tbl_img` i on a.figure=i.id " +
                "left join `tbl_rankgame` r on r.id=a.id " +
                "where a.id in (" + noid.toString() + ")";
            pool.query(sql, [], function (err, results) {
                if (err) {
                    console.log(FUNC + "err:", err);
                    cb(err);
                    return;
                }
                if (DEBUG)console.log(FUNC + "查询数据库:", results);
                for (var i = 0; i < results.length; i++) {
                    var r = results[i];
                    var nickname = r.channel_account_name;
                    if (!nickname)nickname = r.nickname;
                    if (!nickname)nickname = r.tempname;
                    var weapon_skin = r.weapon_skin;
                    weapon_skin = JSON.parse(weapon_skin);
                    var temp = {
                        uid: r.id,
                        figure_url: r.web_url,
                        nickname: nickname,
                        lv: r.level,
                        sex: 0,
                        friend: 0,
                        rank: r.rank,
                        vip: r.vip,
                        wp: r.weapon,
                        skin: weapon_skin.own,
                        city: ""
                    };
                    result.push(temp);
                    //保存至redis
                    var tmp = {};
                    tmp[r.id] = nickname;
                    // RedisUtil.hset(PAIR.UID_NAME, tmp);
                    tmp[r.id] = r.rank;
                    // RedisUtil.hset(PAIR.UID_RANK, tmp);
                    tmp[r.id] = r.vip;
                    // RedisUtil.hset(PAIR.UID_VIP, tmp);
                    tmp[r.id] = r.weapon;
                    // RedisUtil.hset(PAIR.UID_WEAPON, tmp);
                    tmp[r.id] = JSON.stringify(weapon_skin.own);
                    // RedisUtil.hset(PAIR.UID_WEAPON_SKIN_OWN, tmp);
                    tmp[r.id] = JSON.stringify(weapon_skin.equip);
                    // RedisUtil.hset(PAIR.UID_WEAPON_SKIN_EQUIP, tmp);
                    tmp[r.id] = r.web_url;
                    // RedisUtil.hset(PAIR.UID_FIGURE, tmp);
                    tmp[r.id] = r.level;
                    // RedisUtil.hset(PAIR.UID_LEVEL, tmp);
                }
                cb(null, result);
            });
        } else {
            cb(null, result);
        }
    });
}

/**
 * 使用redis的有序集合存储好友请求消息
 * @param dataObj
 * @param cb
 */
function friendAsk1(dataObj, cb) {
    const FUNC = TAG + "friendAsk1() --- ";
    var id = dataObj.receiver;
    var uid = dataObj.token.split("_")[0];
    //查询是否已经存在好友信息
    RedisUtil.zrank(MSG.ASK_FRIEND + "_" + id, uid, function (err, reply) {
        if (err) {
            cb(err);
            return;
        }
        if (reply != null) {
            cb(ERROR_OBJ.CHAT_FRIEND_ERROR);
            return;
        }
        if (DEBUG)console.log(FUNC + "add---------------------------", reply);
        RedisUtil.zadd(MSG.ASK_FRIEND + "_" + id, new Date().getTime(), uid);
        RedisUtil.expire(MSG.ASK_FRIEND + "_" + id, DateUtil.SECONDS_IN_ONE_DAY * 2);
        cb(null, []);
    });
}

/**
 * 使用有序集合处理好友请求消息
 * @param dataObj
 * @param cb
 */
function getFriendAskMsg1(dataObj, cb) {
    const FUNC = TAG + "getFriendAskMsg() --- ";
    var uid = dataObj.token.split("_")[0];
    var timestamp = dataObj.applytime;
    //var timestamp = dataObj.timestamp;
    if (DEBUG)console.log(FUNC + "timestamp:", timestamp);
    var result = [];
    RedisUtil.zrangebyscore(MSG.ASK_FRIEND + "_" + uid, timestamp, new Date().getTime(), function (err, reply) {
        if (err) {
            cb(err);
            return;
        }
        if (reply) {
            var data = [];
            for (var i = 0; i < reply.length; i++) {
                data.push(["zscore", MSG.ASK_FRIEND + "_" + uid, reply[i]]);
            }
            RedisUtil.multi(data, function (err, replies) {
                if (err) {
                    cb(err);
                    return;
                }
                for (var i = 0; i < replies.length; i++) {
                    var obj = {
                        type: 2,
                        time: replies[i],
                        sender: reply[i],
                        recver: uid,
                        content: ""
                    };
                    result.push(obj);
                }
                if (DEBUG)console.log(FUNC + "getFriendAskMsg1:", result);
                cb(null, result);
            });

        } else {
            cb(null, result);
        }
    });
}


exports.userInfo = userInfo;
exports.getChat = getChat;
exports.worldChat = worldChat;
exports.privateChat = privateChat;