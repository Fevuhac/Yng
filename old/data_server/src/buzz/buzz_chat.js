/**
 * 聊天
 * Created by zhenghang on 2017/9/6.
 */
var CacheAccount = require('./cache/CacheAccount');
var RedisUtil = require('../utils/RedisUtil');
var data_util = require('../../routes/data/data_util');
var DaoCommon = require('../dao/dao_common');
var dao_reward = require('../dao/dao_reward');
var BuzzUtil = require('../utils/BuzzUtil');
var ObjUtil = require('./ObjUtil');
var buzz_online = require('./buzz_online');
var redisSync = require('./redisSync');
var async = require('async');
var CstError = require('./cst/buzz_cst_error'),
    ERROR_OBJ = CstError.ERROR_OBJ;
var REDIS_KEYS = require('./cst/buzz_cst_redis_keys').REDIS_KEYS,
    CHANNEL = REDIS_KEYS.CHANNEL,
    MSG = REDIS_KEYS.MSG,
    PAIR = REDIS_KEYS.PAIR;

const shop_shop_buy_type_cfg = require('../../cfgs/shop_shop_buy_type_cfg');

var TAG = "【buzz_chat】";
var DEBUG = 0;

function sendChat(req, dataObj, cb) {
    const FUNC = TAG + "sendChat() --- ";

    // console.log(FUNC + "dataObj:", dataObj);
    var sender = dataObj.token.split("_")[0];
    var receiver = dataObj.receiver;
    //不能和自己对话
    if (dataObj.type != 1 && sender == receiver) {
        cb("不能给自己发消息");
        return;
    }

    async.waterfall([
            function (cb) {
                //检查是否被禁言
                RedisUtil.hget(PAIR.UID_TALK_FORBIDDEN, sender, cb);
            }], function (err, res) {
            if (err) {
                cb(err);
            }
            if (DEBUG) console.log("禁言-------------->>>>>>>>", res);
            if (res == 1) {
                cb("你已被管理员禁言");
                return;
            }
            var obj = {
                type: dataObj.type,
                time: new Date().getTime(),
                sender: sender,
                recver: receiver,
                content: dataObj.content,
            };
            //判断发送消息类型type=1世界消息type=0是私人消息type=2是好友请求
            if (dataObj.type == 1) {
                //扣除钻石或者喇叭
                costChat(req, dataObj, function (err, ret) {
                    if (err) {
                        console.log(FUNC + "err:", err);
                        cb(err);
                        return;
                    }
                    RedisUtil.publish(dataObj.platform != 1 ? CHANNEL.WORLD_CHAT + ":2" : CHANNEL.WORLD_CHAT + ":1", JSON.stringify(obj));
                    cb(err, ret);
                });
            } else if (dataObj.type == 0) {
                RedisUtil.publish(CHANNEL.PRIVATE_CHAT, JSON.stringify(obj));
                //返回在线状态
                buzz_online.isOnline(receiver, function (err, is_online) {
                    var ret = {
                        online: is_online
                    };
                    DEBUG = 0;
                    if (DEBUG) console.log(FUNC + "is_online:", is_online);
                    DEBUG = 0;
                    cb(null, ret);
                });
            } else if (dataObj.type == 2) {
                friendAsk1(dataObj, function (err, f) {
                    if (err) {
                        cb(err);
                        return;
                    }
                    cb(null, f);
                });
            }
        }
    );
}

function userInfo(req, dataObj, cb) {
    const FUNC = TAG + "userInfo() --- ";
    if (DEBUG) console.log(FUNC + "dataObj:", dataObj);
    getUserInfo(req.pool, dataObj, function (err, result) {
        if (err) {
            cb(err);
        }
        if (DEBUG) console.log(FUNC + "getUserInfo", result);
        cb(null, result);
    });
}

function getUserInfo(pool, dataObj, cb) {
    var ids = dataObj.uids;
    var id = dataObj.token.split("_")[0];
    const FUNC = TAG + "getUserInfo() --- ";
    if (!ids) {
        cb(ERROR_OBJ.PARAM_MISSING);
        return;
    }
    async.mapSeries(ids, function (uid, cb) {
            var fields = [
                'id',
                'nickname',
                'match_rank',
                'vip',
                'weapon',
                'weapon_skin',
                'figure_url',
                'level',
                'sex',
                'city',
                "charm_rank",
                "game_friend",
                "channel_account_name",
                "tempname"
            ];
            redisSync.getAccountById(uid, fields, function (err, res) {
                cb(null, res);
            });
        }, function (err, res) {
            if (err) {
                cb && cb(err);
                return;
            }
            let noid = [];

            for (var i in res) {
                if (res[i]) {
                    res[i] = res[i].toJSON();
                    res[i].uid = res[i].id;
                    res[i].wp = res[i].weapon;
                    res[i].skin = res[i].weapon_skin.own;
                    res[i].lv = res[i].level;
                    res[i].rank = res[i].match_rank;
                    var game_friend = res[i].game_friend;
                    res[i].friend = 0;
                    if (game_friend && game_friend.length > 0) {
                        for (var j in game_friend) {
                            if (game_friend[j] == id) {
                                res[i].friend = 1;
                            }
                        }
                    }
                    if (!res[i].nickname || res[i].nickname == "") {
                        res[i].nickname = res[i].channel_account_name;
                    }
                    if (!res[i].nickname || res[i].nickname == "") {
                        res[i].nickname = res[i].tempname;
                    }
                } else {
                    res[i] = {};
                    res[i].id = ids[i];
                    noid.push(ids[i]);
                }
            }
            //todo mysql 查询
            if (noid.length > 0) {
                var sql = "SELECT ";
                sql += "a.id,";
                sql += "a.tempname,";
                sql += "a.channel_account_name,";
                sql += "a.nickname,";
                sql += "i.`web_url` AS figure_url,";
                sql += "a.vip,";
                sql += "a.level,";
                sql += "a.weapon,";
                sql += "a.weapon_skin,";
                sql += "a.charm_rank,";
                sql += "r.rank ";
                sql += "FROM `tbl_account` a ";
                sql += "left join `tbl_img` i on a.figure=i.id ";
                sql += "left join `tbl_rankgame` r on r.id=a.id ";
                sql += "where a.id in (" + noid.toString() + ")";

                pool.query(sql, [], function (err, row) {
                    if (err) {
                        cb(err);
                        return;
                    }
                    for (let j = 0; j < row.length; j++) {
                        let result = row[j];
                        let acc = {};
                        for (let k in res) {
                            if (res[k].id == result.id) {
                                acc = res[k];
                            }
                        }
                        acc.uid = acc.id;
                        acc.nickname = result.channel_account_name;
                        if (!acc.nickname || acc.nickname == "") acc.nickname = result.nickname;
                        if (!acc.nickname || acc.nickname == "") acc.nickname = result.tempname;
                        acc.figure_url = result.figure_url;
                        acc.wp = result.weapon;
                        acc.lv = result.level;
                        var weapon_skin = result.weapon_skin && JSON.parse(result.weapon_skin);
                        acc.skin = weapon_skin && weapon_skin.own;
                        acc.charm_rank = result.charm_rank;
                        acc.rank = result.rank;
                        acc.vip = result.vip;
                        acc.points = result.points;
                    }
                    cb && cb(null, res);
                });
            }
            else {
                cb && cb(null, res);
            }
        }
    );

}

/**
 * 扣除钻石或者喇叭
 * @type {userInfo}
 */
function costChat(req, dataObj, cb) {
    const FUNC = TAG + "costChat() --- ";
    DaoCommon.checkAccount(req.pool, dataObj.token, function (err, account) {
        if (err) {
            cb(err);
            return;
        }
        doNextWithAccount(account, cb);
    });

    function doNextWithAccount(account, cb) {
        let coinType = shop_shop_buy_type_cfg.CHAT_COST.name;
        let coinId = shop_shop_buy_type_cfg.CHAT_COST.id;
        var item1 = [['i006', 1]];
        var item2 = [[coinId, 10]];
        if (dao_reward.enough(account, item1)) {
            var tmp1 = [{
                item_id: item1[0][0],
                item_num: item1[0][1]
            }];
            //使用一个喇叭，增加对应魅力值
            remove(req, account, tmp1);
        } else if (dao_reward.enough(account, item2)) {
            var tmp2 = [{
                item_id: item2[0][0],
                item_num: item2[0][1]
            }];
            remove(req, account, tmp2);
        } else {
            cb(ERROR_OBJ.CHAT_COST_ERROR);
        }

    }

    function remove(req, account, costitem) {
        BuzzUtil.removeFromPack(req, account, costitem, function (cost_info) {
            if (DEBUG) console.log(FUNC + "cost_info:", cost_info);
            var change = BuzzUtil.getChange(account, cost_info);
            var ret = {
                item_list: costitem,
                change: change
            };
            RedisUtil.hincr(PAIR.UID_HORN_USED, account.id, function (err, res) {
                if (err) {
                    cb(null, ret);
                    return;
                }
                CacheAccount.setCharmPointWithUsingOneHorn(account, function (chs) {
                    if (chs && chs.length == 2) {
                        var charmPoint = chs[0];
                        var charmRank = chs[1];
                        charmPoint >= 0 && (ret.change.charm_point = charmPoint);
                        charmRank >= 0 && (ret.change.charm_rank = charmRank);
                    }
                    if (DEBUG) console.log(FUNC + "ret:", ret);
                    cb(null, ret);
                });
            });
        });
    }
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
    if (id == uid) {
        cb("不能加自己为好友");
        return;
    }
    //查看好友列表,如果已经满了则不能发送请求
    var tmp = [
        ['hget', PAIR.UID_GAME_FRIEND, uid],
        ['hget', PAIR.UID_GAME_FRIEND, id],
        ['hget', PAIR.UID_VIP, uid],
        ['hget', PAIR.UID_VIP, id]
    ];
    RedisUtil.multi(tmp, function (err, replies) {
        if (err) {
            console.log(FUNC + "err:", err);
            cb(err);
            return;
        }
        var my_friend = replies[0] && JSON.parse(replies[0]) || [];
        var his_friend = replies[1] && JSON.parse(replies[1]) || [];
        var my_vip = replies[2] && JSON.parse(replies[2]) || 0;
        var his_vip = replies[3] && JSON.parse(replies[3]) || 0;
        var myFrindCount = my_friend.length;
        var hisFrindCount = his_friend.length;
        if (DEBUG) console.log(FUNC + "myvip,yourvip,myFrindCount,yourFrindCount", my_vip, his_vip, myFrindCount, hisFrindCount);
        if (BuzzUtil.getMaxFriendNum(my_vip) <= myFrindCount) {
            cb("好友已经达到上限,请提升vip等级");
            return;
        }
        else if (BuzzUtil.getMaxFriendNum(his_vip) <= hisFrindCount) {
            cb("对方好友满了");
            return;
        }

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
            if (DEBUG) console.log("add---------------------------", reply);
            RedisUtil.zadd(MSG.ASK_FRIEND + "_" + id, new Date().getTime(), uid);
            cb(null, []);
        });
    });
}

function forbid_player_world(req, dataObj, cb) {
    const FUNC = TAG + "forbid_player_world() --- ";
    console.log(FUNC + "call---");
    var id = dataObj.token.split("_")[0];
    var forbiddenId = dataObj.forbiddenId;
    async.waterfall([
            function (cb) {
                DaoCommon.checkAccount(req.pool, dataObj.token, cb);
            },
            function (res, cb) {
                RedisUtil.hget(PAIR.UID_SWITCH_MSGBOARD_MGMT, id, cb);
            },
            function (isAdmin, cb) {
                if (isAdmin == 0) {
                    cb(1);
                } else {
                    RedisUtil.hget(PAIR.UID_SWITCH_MSGBOARD_MGMT, forbiddenId, cb);
                }
            },
            function (isAdmin2, cb) {
                if (isAdmin2 == 1) {
                    cb(2);
                } else {
                    RedisUtil.hset(PAIR.UID_TALK_FORBIDDEN, forbiddenId, 1, cb);
                }
            }
        ], function (err, data) {
            if (err == 1) {
                //todo 非管理员调用此接口 直接封号
                console.log(`非管理员${id}调用此接口,直接封号`);
                cb("帐号异常");
                return;
            }
            else if (err == 2) {
                console.log("请不要禁言管理员，请后台操作!");
                cb("请不要禁言管理员，请后台操作!");
                return;
            }
            if (DEBUG) console.log("禁言成功", data);
            cb(err, forbiddenId);
        }
    )
}

function unforbid_player_world(req, dataObj, cb) {
    const FUNC = TAG + "forbid_player_world() --- ";
    console.log(FUNC + "call---");
    var id = dataObj.token.split("_")[0];
    var forbiddenId = dataObj.forbiddenId;
    async.waterfall([
            function (cb) {
                DaoCommon.checkAccount(req.pool, dataObj.token, cb);
            },
            function (res, cb) {
                RedisUtil.hget(PAIR.UID_SWITCH_MSGBOARD_MGMT, id, cb);
            },
            function (isAdmin, cb) {
                if (isAdmin == 0) {
                    cb(1);
                } else {
                    RedisUtil.hset(PAIR.UID_TALK_FORBIDDEN, forbiddenId, 0, cb);
                }
            }
        ], function (err, data) {
            if (err == 1) {
                //todo 非管理员调用此接口 直接封号
                console.log(`非管理员${id}调用此接口,直接封号`);
                cb(`err`);
                return;
            }
            cb(err, data);
        }
    )
}

exports.userInfo = userInfo;
exports.sendChat = sendChat;
exports.forbid_player_world = forbid_player_world;
exports.unforbid_player_world = unforbid_player_world;