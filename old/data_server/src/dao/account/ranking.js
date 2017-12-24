////////////////////////////////////////////////////////////////////////////////
// Account Common Function
// 账户数据库读取通用函数
// addAuth
// deleteAuth
//------------------------------------------------------------------------------
// 名词解释
// Charts: 排行榜
// Rankgame: 排位赛
// Ranking: 排名
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var _ = require('underscore');
var CommonUtil = require('../../buzz/CommonUtil');
var StringUtil = require('../../utils/StringUtil');
var ObjUtil = require('../../buzz/ObjUtil');
var rank_ranklist_cfg = require('../../../cfgs/rank_ranklist_cfg');
var CstError = require('../../buzz/cst/buzz_cst_error');
var dao_mail = require('../dao_mail');
var dao_social = require('../dao_social');
var AccountCommon = require('./common');
var CacheAccount = require('../../buzz/cache/CacheAccount');

var PLATFORM = require('../../buzz/cst/buzz_cst_game').PLATFORM;

var RedisUtil = require('../../utils/RedisUtil');
var REDIS_KEYS = require('../../buzz/cst/buzz_cst_redis_keys').REDIS_KEYS,
    CHANNEL = REDIS_KEYS.CHANNEL;


//==============================================================================
// constant
//==============================================================================
var ERROR_CODE = CstError.ERROR_CODE;
var ERROR_OBJ = CstError.ERROR_OBJ;

var DEBUG = 0;
var ERROR = 1;

var RANK_DEBUG = {
    GOLD: { id: 1, name: "十大富豪" },
    ACHIEVE: { id: 2, name: "十大牛人" },
    MATCH: { id: 3, name: "十大高手" },
    GODDESS: { id: 4, name: "保卫女神" },
    AQUARIUM: { id: 5, name: "水族馆" },
};

/**
 * 排行榜类型.
 */
const CHARTS_TYPE = {
    /** 所有排行 */
    ALL : -1,
    /** 十大富豪 */
    GOLD : 0,
    /** 十大牛人 */
    ACHIEVE : 1,
    /** 十大高手 */
    RANKING : 2,
    /** 保卫女神 */
    GODDESS : 3,
    /** 宠物鱼 */
    PETFISH : 4,
};
exports.CHARTS_TYPE = CHARTS_TYPE;

var TAG = "【src/dao/account/ranking】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.genCharts = genCharts;
exports.getCharts = getCharts;
exports.getAllMyRanking = getAllMyRanking;
exports.makeChartsMail = makeChartsMail;
exports.getMyRankgameRanking = getMyRankgameRanking;
exports.getGoddessTop1 = getGoddessTop1;
exports.getFriendsCharts = getFriendsCharts;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
/**
 * 获取好友排行榜.
 * @param data 所有游戏好友的openid数组
 */
function getFriendsCharts(pool, data, cb) {
    const FUNC = TAG + "getFriendsCharts() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");

    if (!_prepare(data, cb)) return;

    // 返回排行榜并设置常用信息
    var token = data['token'];
    var fopenids = data['fopenids'];
    var offset = data['offset'] || 0;
    var ranking_count = data['ranking_count'];

    fopenids = ObjUtil.str2Data(fopenids);// 转换为数组.

    AccountCommon.getAccountByToken(pool, token, function (err_account, results_account) {
        
        // console.log(FUNC + "err_account:", err_account);
        // console.log(FUNC + "results_account:", results_account);
        // 查询数据库中是否存在此账户
        if (err_account) {
            cb(err_account);
            return;
        }
        if (results_account.length == 0) {
            if (ERROR) console.error('-----------------------------------------------------');
            if (ERROR) console.error(FUNC + 'TOKEN_INVALID');
            if (ERROR) console.error('-----------------------------------------------------');
            cb(ERROR_OBJ.TOKEN_INVALID);
            return;
        }
        
        // 获取玩家的排行字段
        var record = results_account[0];
        var platform = parseInt(record['platform']);

        var openid = record.channel_account_id;
        // 本地测试时是没有channel_account_id的
        if (openid) {
            fopenids.push(StringUtil.subString(openid, 0, openid.length - 2));
        }
        if (DEBUG) console.log(FUNC + "fopenids:", fopenids);

        var uid = record.id;
        var rank_in_friends = record.rank_in_friends;
        // yTODO: 需要进一步确认: 这里的over_me_friends是如何改变的
        var over_me_friends = record.over_me_friends;
        if (over_me_friends) {
            over_me_friends = over_me_friends.split(",");
        }
        else {
            over_me_friends = [];
        }

        _didGetFriendsCharts(pool, fopenids, offset, ranking_count, platform, function(err, results) {

            // console.log(FUNC + "results:\n", results);

            var current_rank = _getCurrentRank(results, uid);
            var under_me_friends = _getUnderMeFriends(results, current_rank);
            var new_over_me_friends = _getOverMeFriends(results, current_rank);
            // 检测over_me_friends中每一个玩家, under_me_friends中存在就插入notify_friends
            if (DEBUG) console.log(FUNC + "over_me_friends:", over_me_friends);
            if (DEBUG) console.log(FUNC + "under_me_friends:", under_me_friends);
            var notify_friends = _.intersection(over_me_friends, under_me_friends);
            if (DEBUG) console.log(FUNC + "notify_friends:", notify_friends);

            // 更新rank_in_friends字段.
            _updateRankInFriends(pool, current_rank, new_over_me_friends, uid, function(err, result) {
                /**
                 * 返回值.
                {
                    rank_list: [],// 好友排名数组(id, gold, pearl, vip, channel_account_name, openid, figure_url)
                    rank_change: >0(排名上升) | <0(排名下降) | ==0(排名不变),
                    notify_friends: [],// 需要通知的好友数组
                }
                 */
                var ret = {
                    rank_list: results,
                    rank_change: rank_in_friends - current_rank,
                    notify_friends: notify_friends,//注意返回openid
                };
                cb(err, ret);
            });
        });
    });

}

/**
 * 更新玩家表中的好友排名.
 */
function _updateRankInFriends(pool, rank_in_friends, new_over_me_friends, uid, cb) {
    const FUNC = TAG + "_updateRankInFriends() --- ";
    var over_me_friends = new_over_me_friends.join(",");

    var sql = "";
    sql += "UPDATE tbl_account ";
    sql += "SET rank_in_friends=?, over_me_friends=? ";
    sql += "WHERE id=? ";
    var sql_data = [rank_in_friends, over_me_friends, uid];

    pool.query(sql, sql_data, function(err, result) {
        cb(err, result);
    });
}

/**
 * 获取玩家在好友中的当前排名.
 */
function _getCurrentRank(results, uid) {
    if (results) {
        for (var i = 0; i < results.length; i++) {
            var one_row = results[i];
            if (one_row.id == uid) {
                return i;
            }
        }
    }
    return 0;
}

/**
 * 获取我超过了的好友数组.
 */
function _getUnderMeFriends(results, my_rank) {
    const FUNC = TAG + "_getUnderMeFriends() --- ";
    if (DEBUG) console.log(FUNC + "CALL...");
    if (DEBUG) console.log(FUNC + "my_rank:", my_rank);

    if (results == null || results.length == 0) {
        return [];
    }

    return _getFriendsPart(results, my_rank + 1, results.length);
}

/**
 * 获取超过了我的好友数组.
 */
function _getOverMeFriends(results, my_rank) {
    const FUNC = TAG + "_getOverMeFriends() --- ";
    if (DEBUG) console.log(FUNC + "CALL...");
    
    return _getFriendsPart(results, 0, my_rank);
}

function _getFriendsPart(results, start, end) {
    const FUNC = TAG + "_getFriendsPart() --- ";
    if (DEBUG) console.log(FUNC + "CALL...");
    if (DEBUG) console.log(FUNC + "start:", start);
    if (DEBUG) console.log(FUNC + "end:", end);
    
    var ret = [];
    for (var i = start; i < end; i++) {
        if (DEBUG) console.log(i + ")openid", results[i].openid);
        ret.push(results[i].openid);
    }
    return ret;
}

function _didGetFriendsCharts(pool, fopenids, offset, ranking_count, platform, cb) {
    const FUNC = TAG + "_didGetFriendsCharts() --- ";

    if (fopenids.length == 0) {
        cb(null, []);
        return;
    }

    // 为每一个openid加上平台后缀
    for (var i = 0; i < fopenids.length; i++) {
        fopenids[i] += "_" + platform;
    }
    console.log(FUNC + "fopenids:", fopenids);

/**
 * 按金币排行
SELECT a.`id`, a.`gold`, a.`pearl`, a.`vip`, a.`channel_account_name`, LEFT(a.`channel_account_id`, 32) AS openid, i.web_url AS figure_url
FROM `tbl_account` AS a, `tbl_img` AS i 
WHERE a.`channel_account_id` IN ('511F28AB4B5D075EC2C37A895911FEB5_1','ED99718EF653B75E272E65AC8296518A_1','AE576BCBCC88268799CEB8C7FAC4CDC7_1') 
AND a.figure = i.id 
ORDER BY a.`gold` DESC 
LIMIT 0,3
 *
 * 按段位赛排行
SELECT a.`id`, r.`points`, r.`rank`, a.`gold`, a.`pearl`, a.`vip`, a.`channel_account_name`, LEFT(a.`channel_account_id`, 32) AS openid, i.web_url AS figure_url
FROM `tbl_account` AS a, `tbl_img` AS i, `tbl_rankgame` AS r 
WHERE a.`channel_account_id` IN ('511F28AB4B5D075EC2C37A895911FEB5_1','ED99718EF653B75E272E65AC8296518A_1','AE576BCBCC88268799CEB8C7FAC4CDC7_1') 
AND a.figure = i.id 
AND r.id = a.id 
ORDER BY r.`points` DESC 
LIMIT 0,3
 */
    function getOpenIdList(input) {
        var ret = "";
        if (DEBUG) console.log(FUNC + "input.length:", input.length);
        for (var i = 0; i < input.length; i++) {
            if (DEBUG) console.log(FUNC + "i:", i);
            if (i > 0) ret += "," ;
            ret += "'" + input[i] + "'";
        }
        if (DEBUG) console.log(FUNC + "ret:", ret);
        return ret;
    }
    var openIdList = getOpenIdList(fopenids);
    offset = parseInt(offset);
    ranking_count = parseInt(ranking_count);

    var sql = "";
    sql += "SELECT a.`id`, r.`points`, r.`rank`, a.`gold`, a.`pearl`, a.`vip`, a.`channel_account_name`, LEFT(a.`channel_account_id`, 32) AS openid, i.web_url AS figure_url ";
    sql += "FROM `tbl_account` AS a, `tbl_img` AS i, `tbl_rankgame` AS r ";
    sql += "WHERE a.`channel_account_id` IN (" + openIdList + ") ";
    sql += "AND a.figure = i.id ";
    sql += "AND r.id = a.id ";
    sql += "ORDER BY r.`points` DESC ";
    sql += "LIMIT ?, ?";

    var sql_data = [offset, ranking_count];

    if (DEBUG) console.log(FUNC + "sql:\n", sql);
    if (DEBUG) console.log(FUNC + "sql_data:\n", sql_data);

    pool.query(sql, sql_data, function (err, results) {
        if (err) {
            if (ERROR) console.log(FUNC + "err:\n", err);
            cb(ERROR_OBJ.DATA_NULL_ERROR);
            return;
        }
        if (!results) {
            if (ERROR) console.log(FUNC + "results为空");
            cb(ERROR_OBJ.DATA_NULL_ERROR);
            return;
        }
        if (DEBUG) console.log(FUNC + "results:\n", results);

        _getFriendsList(pool, openIdList, function (friends_info_list) {
            // 为玩家好友段位列表添加无段位好友
            if (friends_info_list) {
                for (var i = 0; i < friends_info_list.length; i++) {
                    if (results.length >= ranking_count) {
                        break;
                    }
                    var friends_info = friends_info_list[i];
                    var is_this_friend_in_charts = false;
                    for (var j = 0; j < results.length; j++) {
                        if (friends_info.id == results[j].id) {
                            is_this_friend_in_charts = true;
                            break;
                        }
                    }
                    if (!is_this_friend_in_charts) {
                        friends_info.rank = 0;
                        results.push(friends_info);
                    }
                }
            }
            cb(err, results);
        });
    });
}

function _getFriendsList(pool, openIdList, cb) {
    const FUNC = TAG + "_getFriendsList() --- ";
    
    var sql = "";
    sql += "SELECT a.`id`, a.`gold`, a.`pearl`, a.`vip`, a.`channel_account_name`, LEFT(a.`channel_account_id`, 32) AS openid, i.web_url AS figure_url ";
    sql += "FROM `tbl_account` AS a, `tbl_img` AS i ";
    sql += "WHERE a.`channel_account_id` IN (" + openIdList + ") ";
    sql += "AND a.figure = i.id ";

    var sql_data = [];

    if (DEBUG) console.log(FUNC + "sql:\n", sql);
    if (DEBUG) console.log(FUNC + "sql_data:\n", sql_data);

    pool.query(sql, sql_data, function (err, results) {
        if (err) {
            if (ERROR) console.error(FUNC + "err:\n", err);
        }
        else {
            if (DEBUG) console.log(FUNC + "results:\n", results);
        }
        
        cb(results);
    });
}

function _prepare(data, cb) {

    var token = data['token'];
    var fopenids = data['fopenids'];
    var ranking_count = data['ranking_count'];
    
    if (!CommonUtil.isParamExist("dao_ranking", token, "接口调用请传参数token", cb)) return false;
    if (!CommonUtil.isParamExist("dao_ranking", fopenids, "接口调用请传参数fopenids(玩家好友的openid列表)", cb)) return false;
    if (!CommonUtil.isParamExist("dao_ranking", ranking_count, "接口调用请传参数ranking_count(客户端需要拉取的排行榜显示数量)", cb)) return false;
    
    return true;
}

/**
 * 每小时生成一次排行榜数据.
 */
function genCharts(pool, cb) {
    const FUNC = TAG + "getCharts() --- ";
    var data = {
        offset:0,
        ranking_count:1000,
        type: CHARTS_TYPE.ALL,
    };
    let test = 0;

    _getGoldCharts(pool, data, test, function (err_gold, result_gold) {
        _getAchieveCharts(pool, data, test, function (err_achieve, result_achieve) {
            _getGoddessCharts(pool, data, test, function (err_goddess, goddess) {
                _getAquariumCahrts(pool, data, test, function (err_aquarium, aquarium) {
                    _getRankgameCharts(pool, data, test, function (err_rankgame, rankgame) {

                        cb(null, {
                            "gold" : result_gold,
                            "achieve_point" : result_achieve,
                            "rankgame" : rankgame,
                            "goddess" : goddess,
                            "aquarium" : aquarium,
                        });

                        // _setShareTopGold(pool, result_gold);

                    });
                });
            });
        });
    });
}

/**
 * 获取排行榜(根据用户的某些数据段进行排位返回)
 */
function getCharts(pool, data, cb) {
    const FUNC = TAG + "getCharts() --- ";

    if (DEBUG) console.log(FUNC + "data:", data);

    var account_id = data['account_id'];
    var token = data['token'];
    var offset = data['offset'] || 0;
    var ranking_count = data['ranking_count'];
    var type = data['type'];
    
    if (account_id == undefined) {
        cb(new Error("account_id字段不能为空!"));
        return;
    }
    if (token == undefined) {
        cb(new Error("token字段不能为空!"));
        return;
    }
    // if (offset == undefined) {
    //     cb(new Error("offset字段不能为空!"));
    //     return;
    // }
    if (ranking_count == undefined) {
        cb(new Error("ranking_count字段不能为空!"));
        return;
    }

    // 只能请求到前100个玩家的排行
    if (ranking_count > 100) {
        console.error(FUNC + "[ERROR] 请求的排名数超过了限制: 最大排名:100, 请求参数:" + ranking_count);
        cb(ERROR_OBJ.RANK_COUNT_TOO_LARGE);
        return;
    }
    
    AccountCommon.getAccountByToken(pool, token, function (err_account, results_account) {
        // 查询数据库中是否存在此账户
        if (err_account) {
            cb(err_account);
            return;
        }
        if (results_account.length == 0) {
            if (ERROR) console.error('-----------------------------------------------------');
            if (ERROR) console.error(FUNC + 'TOKEN_INVALID');
            if (ERROR) console.error('-----------------------------------------------------');
            cb(ERROR_OBJ.TOKEN_INVALID);
            return;
        }
        
        // 获取玩家的排行字段
        var record = results_account[0];
        var platform = parseInt(record['platform']);
        var gold = parseInt(record['gold']);
        var pearl = parseInt(record['pearl']);
        var test = parseInt(record['test']);

        data['platform'] = platform;

        if (DEBUG) console.log(FUNC + "platform:", platform);
        
        _getGoldCharts(pool, data, test, function (err_gold, result_gold) {
            
            _getAchieveCharts(pool, data, test, function (err_achieve, result_achieve) {
                
                _getGoddessCharts(pool, data, test, function (err_goddess, goddess) {
                    
                    _getAquariumCahrts(pool, data, test, function (err_aquarium, aquarium) {

                        _getRankgameCharts(pool, data, test, function (err_rankgame, rankgame) {

                            cb(null, {
                                "gold" : result_gold,
                                "achieve_point" : result_achieve,
                                "rankgame" : rankgame,
                                "goddess" : goddess,
                                "aquarium" : aquarium,
                            });

                            _setShareTopGold(pool, result_gold);

                        });
                    });
                });
            });
        });
    });
}

/**
 * 设置世界首富且金币超过500万玩家的分享状态.
 * @param result_gold 金币排行榜数据
 */
function _setShareTopGold(pool, result_gold) {
    const FUNC = TAG + "_setShareTopGold() --- ";

    if (result_gold != null) {
        var top_gold = result_gold.rank[0];
        if (DEBUG) console.log(FUNC + "top_gold:", top_gold);

        if (top_gold.gold >= 5000000) {
            if (DEBUG) console.log(FUNC + "设置social表中的share_top_gold");
            if (DEBUG) console.log(FUNC + "uid:", top_gold.id);
            dao_social.setShareTopGold(pool, top_gold.id);
        }
    }
}

/**
 * 获取指定ID玩家的排名(仅GOLD: 1,ACHIEVE: 2,COMPAIN: 3这三种类型增加, 用于名人上线公告).
 */
function getAllMyRanking(pool, data, test, cb) {
    const FUNC = TAG + "getAllMyRanking() --- ";

    _getMyGoldRanking(pool, data, test, function (err_gold, result_gold) {

        _getMyAchieveRanking(pool, data, test, function (err_achieve, result_achieve) {

            _getMyMatchRanking(pool, data, test, function (err_match, result_match) {
                
                if (DEBUG) console.log(FUNC + 'result_match:', result_match);
                if (!result_gold) {
                    var ret = {
                        code: ERROR_OBJ.DATA_NULL_ERROR.code,
                        msg: ERROR_OBJ.DATA_NULL_ERROR.msg + "result_gold",
                    };
                    cb(ret);
                    return;
                }
                if (!result_achieve) {
                    var ret = {
                        code: ERROR_OBJ.DATA_NULL_ERROR.code,
                        msg: ERROR_OBJ.DATA_NULL_ERROR.msg + "result_achieve",
                    };
                    cb(ret);
                    return;
                }
                if (!result_match) {
                    var ret = {
                        code: ERROR_OBJ.DATA_NULL_ERROR.code,
                        msg: ERROR_OBJ.DATA_NULL_ERROR.msg + "result_match",
                    };
                    cb(ret);
                    return;
                }
                cb(null, { 
                    "gold" : result_gold[0],
                    "achieve_point" : result_achieve[0],
                    "match" : result_match,
                });
            });
            
            // cb(null, { "gold" : result_gold[0], "achieve_point" : result_achieve[0] });
        });
    });
}



/**
 * 排行榜邮件发放(根据当前排行榜进行发放).
 */
function makeChartsMail(pool, next) {
    const FUNC = TAG + "makeChartsMail() --- ";
    
    // DONE: 同步CacheAccount.mail_box到数据库
    // 写在dao_mail中
    dao_mail.updateMailBox(pool, function () {
        // 存储不同类型的排名
        var rank_type = {};
        // 读取配置表rank_ranklist_cfg
        for (var idx in rank_ranklist_cfg) {
            var rankInfo = rank_ranklist_cfg[idx];
            // 某类型的排行信息为空, 就初始化
            rank_type['' + rankInfo.type] = rank_type['' + rankInfo.type] || [];
            rank_type['' + rankInfo.type].push(rankInfo);
        }
        
        //if (DEBUG) console.info("rank_type:", rank_type);
        _makeMailList(pool, RANK_DEBUG.GOLD, rank_type, function (mail_list1) {
            _makeMailList(pool, RANK_DEBUG.ACHIEVE, rank_type, function (mail_list2) {
                _makeMailList(pool, RANK_DEBUG.MATCH, rank_type, function (mail_list3) {
                    _makeMailList(pool, RANK_DEBUG.GODDESS, rank_type, function (mail_list4) {
                        _makeMailList(pool, RANK_DEBUG.AQUARIUM, rank_type, function (mail_list5) {
                            
                            // var mail_list = _.union(mail_list1, mail_list2, mail_list3, mail_list4, mail_list5);
                            var mail_list = _.union(mail_list2, mail_list3, mail_list4, mail_list5);
                            insertMail(pool, mail_list, function (err, result) {
                                // var affectedRows = result.affectedRows;
                                var insertId = result.insertId;

                                next && next(mail_list, insertId);
                            });

                        });
                    });
                });
            });
        });
    });
}

function _sendMail(pool, mail_list, insertId, cb) {
    const FUNC = TAG + "_sendMail() --- ";

    if (DEBUG) console.log(FUNC + "CALL...");
    console.log(FUNC + "mail_list:", mail_list);

    // 计算每种排名有几个等级的奖励
    var level = rank_ranklist_cfg.length / _.keys(RANK_DEBUG).length;

    // 将更有用的数据插入到mail_list中
    for (var i = 0; i < mail_list.length; i++) {
        mail_list[i].id = insertId + i;// 设置邮件id
    }
    //console.log("mail_list:", mail_list);

    var idx_count = 0;

    // _sendMailGold(pool, mail_list, level * idx_count, level * (idx_count + 1), function () {
    //     if (DEBUG) console.log(FUNC + "金币奖励邮件添加完毕");
    //     idx_count += 1;

        _sendMailAchieve(pool, mail_list, level * idx_count, level * (idx_count + 1), function () {
            if (DEBUG) console.log(FUNC + "成就点奖励邮件添加完毕");
            idx_count += 1;

            _sendMailRankgame(pool, mail_list, level * idx_count, level * (idx_count + 1), function () {
                if (DEBUG) console.log(FUNC + "排位赛奖励邮件添加完毕");
                idx_count += 1;
            
                // _sendMailGoddess(pool, mail_list, level * 3, level * 4, function () {
                _sendMailGoddess(pool, mail_list, level * idx_count, level * (idx_count + 1), function () {
                    if (DEBUG) console.log(FUNC + "保卫女神奖励邮件添加完毕");
                    idx_count += 1;
                    
                    _sendMailAquarium(pool, mail_list, level * idx_count, level * (idx_count + 1), function () {
                        if (DEBUG) console.log(FUNC + "水族馆奖励邮件添加完毕");
                        idx_count += 1;

                        console.log(FUNC + "所有奖励邮件添加完毕");

                        // TODO: 加载数据库数据到缓存中
                        var cache_ids = CacheAccount.getAllIds();
                        if (DEBUG) console.log(FUNC + "cache_ids:\n", cache_ids);
                        if (DEBUG) console.log(FUNC + "cache_ids:\n", cache_ids.toString());
                        // _updateCache(pool, cache_ids.toString(), cb);

                        // 告诉其他服务器重新加载数据库中的邮件
                        RedisUtil.publish(CHANNEL.MAIL_RELOAD, "hello");
                    });
                });
            });
        });
    // });
}

//------------------------------------------------------------------------------

// function _updateCache(pool, ids, cb) {
//     // _updateCacheAccount(pool, ids, function () {
//     //     _updateCacheMail(pool, function () {
//     //         cb();
//     //     });
//     // });

//     _updateCacheMail(pool, function () {
//         cb();
//     });
// }

// function _updateCacheAccount(pool, ids, next) {
//     const FUNC = TAG + "_updateCacheAccount() --- ";

//     var sql = "";
//     sql += "SELECT id, mail_box ";
//     sql += "FROM tbl_account ";
//     sql += "WHERE id IN ( " + ids + " ) ";
    
//     var sql_data = [];
    
//     if (DEBUG) console.log(FUNC + "sql:\n", sql);
//     if (DEBUG) console.log(FUNC + "sql_data:\n", sql_data);
    
//     pool.query(sql, sql_data, function (err, results) {
//         if (DEBUG) console.log(FUNC + "err:\n", err);
//         if (DEBUG) console.log(FUNC + "results:\n", results);
        
//         for (var i = 0; i < results.length; i++) {
//             var id = results[i].id;
//             var mail_box = results[i].mail_box;
//             mail_box = StringUtil.trim(mail_box, ',');
//             mail_box = "[" + mail_box + "]";
//             CacheAccount.setMailBox(id, ObjUtil.str2Data(mail_box));
//         }
//         next();
//     });
// }

// function _updateCacheMail(pool, next) {
//     dao_mail.loadMail(pool, function () {
//         next();
//     });
// }


//------------------------------------------------------------------------------

function _sendMailGold(pool, mail_list, start, end, next) {
    _sendMailInAccount(pool, 'gold', mail_list, start, end, next);
}
function _sendMailAchieve(pool, mail_list, start, end, next) {
    _sendMailInAccount(pool, 'achieve_point', mail_list, start, end, next);
}
function _sendMailGoddess(pool, mail_list, start, end, next) {
    _sendMailSingle(pool, 'tbl_goddess', 'max_wave', mail_list, start, end, next);
}
function _sendMailAquarium(pool, mail_list, start, end, next) {
    _sendMailSingle(pool, 'tbl_aquarium', 'total_level', mail_list, start, end, next);
}
function _sendMailRankgame(pool, mail_list, start, end, next) {
    _sendMailSingle(pool, 'tbl_rankgame', 'points', mail_list, start, end, next);
}

//------------------------------------------------------------------------------
// 复用代码
//------------------------------------------------------------------------------

function _sendMailInAccount(pool, type, mail_list, start, end, next) {
    const FUNC = TAG + "_sendMailInAccount() --- ";
    if (DEBUG) console.log(FUNC + "type:", type);
    var level_info = [];
    var data = {
        offset: 0,
        ranking_count: _getLevelInfo(level_info, mail_list, start, end)
    };// 倒数第二区间的max_interval

    var test = 0;// 只给正常玩家发排行奖励
    // 1. Android发奖励
    data.platform = PLATFORM.ANDROID;
    _getRank(pool, data, type, false, test, function (err, results) {
        let rank = _.pluck(results.rank, 'id');
        // console.log(FUNC + "rank:", rank);
        _executeSql(pool, rank, level_info, type, data.platform, function () {

            // 2. iOS发奖励
            data.platform = PLATFORM.IOS;
            _getRank(pool, data, type, false, test, function (err, results) {
                rank = _.pluck(results.rank, 'id');
                _executeSql(pool, rank, level_info, type, data.platform, function () {
                    next();
                });
            });
        });
    });
}

function _sendMailSingle(pool, table, field, mail_list, start, end, next) {
    const FUNC = TAG + "_sendMailInAccount() --- ";
    if (DEBUG) console.log(FUNC + "table:", table);
    // if (DEBUG) console.log("【CALL】 ranking._sendMailSingle:", table);
    var level_info = [];
    var data = { 
        offset: 0,
        ranking_count: _getLevelInfo(level_info, mail_list, start, end)
    };// 倒数第二区间的max_interval
    
    var test = 0;// 只给正常玩家发排行奖励
    // 1. Android发奖励
    data.platform = PLATFORM.ANDROID;
    _getNewRank(pool, data, table, field, false, test, function (err, results) {
        let rank = _.pluck(results.rank, 'id');
        // console.log(FUNC + "rank:", rank);
        _executeSql(pool, rank, level_info, table, data.platform, function () {
            
            // 2. iOS发奖励
            data.platform = PLATFORM.IOS;
            _getNewRank(pool, data, table, field, false, test, function (err, results) {
                rank = _.pluck(results.rank, 'id');
                _executeSql(pool, rank, level_info, table, data.platform, function () {
                    next();
                });
            });
        });
    });
}

function _getLevelInfo(level_info, mail_list, start, end) {
    const FUNC = TAG + "_getLevelInfo() --- ";

    var ranking_count = 0;
    for (var i = start; i < end; i++) {
        var mail_info = mail_list[i];
        if (mail_info != null) {
            // console.log(FUNC + "interval: min-" + mail_info.min_interval + ", max-" + mail_info.max_interval);
            if (i == end - 2) {
                ranking_count = mail_info.max_interval;
            }
            if (LIMIT_1000) {
                if (i == end - 1) {
                    ranking_count = mail_info.max_interval;
                }
            }
            // console.log(FUNC + "ranking_count:" + ranking_count);
            level_info.push(
                {
                    id: mail_info.id,
                    min: mail_info.min_interval,
                    max: mail_info.max_interval,
                }
            );
        }
    }
    return ranking_count;
}

// 限制邮件为前1000名领取(可以在配置表中配)
var LIMIT_1000 = 1;

function _executeSql(pool, rank, level_info, type, platform, next) {
    const FUNC = TAG + "_executeSql() --- ";

    var op_set = [];
    for (var i = 0; i < level_info.length; i++) {
        var mail_interval = level_info[i];
        var min = mail_interval.min;
        var max = mail_interval.max;

        // console.log(FUNC + "min:", min);
        // console.log(FUNC + "max:", max);
        
        var isLastLevel = i == level_info.length - 1;
        var func = isLastLevel ? dao_mail.addMailsNotIn : dao_mail.addMailsIn;
        var mail_id = mail_interval.id;
        var account_list = rank.slice(isLastLevel ? 0 : min - 1, isLastLevel ? min - 1 : max);

        if (LIMIT_1000) {
            func = dao_mail.addMailsIn;
            account_list = rank.slice(min - 1, max);
        }

        op_set.push({
            func: func,
            mail_id: mail_id,
            account_list: account_list,
            type: type,
            platform: platform,
        });
    }
    if (op_set.length == 0) {
        next();
    }
    else {
        dao_mail.addMails(pool, op_set, function () {
            next();
        });
    }
}
//------------------------------------------------------------------------------

// 排行奖励邮件(邮件内容设定)
function _makeMailList(pool, rank_info, rank_type, next) {
    var mail_list = [];
    var cfgs = rank_type["" + rank_info.id];
    var title = rank_info.name + "排行榜奖励";
    for (var idx in cfgs) {
        var rankInfo = cfgs[idx];
        var min_interval = rankInfo.interval[0];
        var max_interval = rankInfo.interval[1];
        var reward = rankInfo.reward;
        //if (DEBUG) console.info("min_id:", min_id);
        //if (DEBUG) console.info("max_id:", max_id);
        //if (DEBUG) console.info("reward:", reward);
        var content = "昨日你取得" + min_interval + "名到" + max_interval + "名的好成绩，《捕捞季》为你准备一份礼物，以资鼓励！";
        if (min_interval == max_interval) {
            content = "昨日你取得第" + min_interval + "名的好成绩，《捕捞季》为你准备一份礼物，以资鼓励！";
        }
        mail_list.push({
            min_interval: min_interval,
            max_interval: max_interval,
            title: title,
            content: content,
            reward: JSON.stringify(reward),
        });
    }
    next(mail_list);
}

function insertMail(pool, mail_list, cb) {
    const FUNC = TAG + "insertMail() --- ";
    var data = {
        type: 2,
        mail_list: mail_list,
    };
    dao_mail.sendMails(pool, data, function (err, result) {
        //if (DEBUG) console.info("err:", err);
        if (DEBUG) console.info(FUNC + "result:", result);
        cb(err, result);
    });
}

function getMyRankgameRanking(pool, data, cb) {
    _getNewMyRank(pool, data, "tbl_rankgame", "points", data.test, function(err, result_rankgame) {
        if (result_rankgame == null) {
            cb(10);
        }
        else {
            // console.log("result_rankgame:\n", result_rankgame);
            if (DEBUG) console.log("my_rank:\n", result_rankgame.my_rank);
            cb(null, result_rankgame.my_rank);
        }
    });
}

function getGoddessTop1(pool, platform, cb) {
    var data = {
        offset: 0,
        ranking_count: 1,
        platform: platform,
    };
    _getGoddessCharts(pool, data, 0, function (err, results) {
        if (err) {
            cb(err);
        }
        if (results == null || results.length == 0) {
            return;
        }
        var res = results.rank[0];
        cb(err, res);
    });
}

//==============================================================================
// reference code
//==============================================================================

// 获取金币排行榜
function _getGoldCharts(pool, data, test, cb) {
    const FUNC = TAG + "_getGoldCharts() --- ";
    DEBUG = 0;
    //------------------------------------------------------

    if (data.type == undefined || data.type == -1 || data.type == CHARTS_TYPE.GOLD) {
        if (DEBUG) console.log(FUNC + "客户端没有type字段, 或type类型为CHARTS_TYPE.GOLD");
        _getRank(pool, data, "gold", true, test, cb);
    }
    else {
        if (DEBUG) console.log(FUNC + "客户端有type字段, 且type类型不为CHARTS_TYPE.GOLD");
        cb(null, null);
    }
    
    //------------------------------------------------------
    DEBUG = 0;
}

// 获取成就排行榜
function _getAchieveCharts(pool, data, test, cb) {
    if (data.type == undefined || data.type == -1 || data.type == CHARTS_TYPE.ACHIEVE) {
        _getRank(pool, data, "achieve_point", true, test, cb);
    }
    else {
        cb(null, null);
    }
}

function _getMyGoldRanking(pool, data, test, cb) {
    _getMyRank(pool, data, "gold", test, cb);
}

function _getMyAchieveRanking(pool, data, test, cb) {
    _getMyRank(pool, data, "achieve_point", test, cb);
}

function _getMyMatchRanking(pool, data, test, cb) {
    _getNewMyRank(pool, data, "tbl_rankgame", "points", test, cb);
}


// 用于获取水族馆和女神排行榜
// 新的排行数据
function _getGoddessCharts(pool, data, test, cb) {
    var FUNC  = TAG + "_getGoddessCharts() --- ";
    if (data.type == undefined || data.type == CHARTS_TYPE.ALL || data.type == CHARTS_TYPE.GODDESS) {
        _getNewRank(pool, data, 'tbl_goddess', 'max_wave', true, test, cb);
    }
    else {
        console.error(FUNC + "获取女神排行榜类型错误——type:", data.type);
        console.error(FUNC + "CHARTS_TYPE.GODDESS:", CHARTS_TYPE.GODDESS);
        cb({code: 10000, msg: "获取女神排行榜类型错误——type:" + data.type}, null);
    }
}

function _getAquariumCahrts(pool, data, test, cb) {
    var FUNC  = TAG + "_getAquariumCahrts() --- ";
    if (data.type == undefined || data.type == CHARTS_TYPE.ALL || data.type == CHARTS_TYPE.PETFISH) {
        _getNewRank(pool, data, 'tbl_aquarium', 'total_level', true, test, cb);
    }
    else {
        console.error(FUNC + "获取水族馆排行榜类型错误——type:", data.type);
        console.error(FUNC + "CHARTS_TYPE.PETFISH:", CHARTS_TYPE.PETFISH);
        cb({code: 10000, msg: "获取水族馆排行榜类型错误——type:" + data.type}, null);
    }
}

function _getRankgameCharts(pool, data, test, cb) {
    var FUNC  = TAG + "_getRankgameCharts() --- ";

    if (data.type == undefined || data.type == CHARTS_TYPE.ALL || data.type == CHARTS_TYPE.RANKING) {
        _getNewRank(pool, data, 'tbl_rankgame', 'points', true, test, cb);
    }
    else {
        console.error(FUNC + "获取排位赛排行榜类型错误——type:", data.type);
        console.error(FUNC + "CHARTS_TYPE.RANKING:", CHARTS_TYPE.RANKING);
        cb({code: 10000, msg: "获取排位赛排行榜类型错误——type:" + data.type}, null);
    }
}

/**
 * 单独表中获取排行.
// 保卫女神
SELECT a.id, a.vip, a.channel_account_name, a.tempname, a.nickname, a.redress_no, a.id, r.max_wave, r.updated_at, i.web_url AS figure_url 
FROM tbl_goddess AS r, tbl_account AS a, tbl_img AS i 
WHERE a.platform = 1 AND a.id = r.id AND a.figure = i.id 
ORDER BY r.max_wave DESC, r.`updated_at` ASC 
LIMIT 0, 30
// 水族馆
SELECT a.channel_account_name, a.tempname, a.nickname, a.redress_no, a.id, r.total_level, r.updated_at, i.web_url AS figure_url 
FROM tbl_aquarium AS r, tbl_account AS a, tbl_img AS i 
WHERE a.platform = 1 AND a.id = r.id AND a.figure = i.id 
ORDER BY r.total_level DESC, r.`updated_at` ASC 
LIMIT 0, 30
 */
function _getNewRank(pool, data, table, field, getNewMyRank, test, cb) {
    const FUNC = TAG + "_getNewRank() --- ";
    
    var offset = data['offset'] || 0;
    var ranking_count = data['ranking_count'];
    var platform = data['platform'];

    // 更新数据库中此账户的exp字段
    var sql = "";
    sql += "SELECT a.id, a.vip, a.channel_account_name, a.tempname, a.nickname, a.redress_no, r." + field + ", r.updated_at, i.web_url AS figure_url ";
    sql += "FROM " + table + " AS r, tbl_account AS a, tbl_img AS i ";
    sql += "WHERE a.platform = ? AND a.id = r.id AND a.figure = i.id ";
    if (test != 2) {
        sql += "AND a.test <> 2 ";// 测试人员不进入排行榜
    }
    sql += "ORDER BY r." + field + " DESC, r.`updated_at` ASC ";
    sql += "LIMIT ?, ?";
    
    var sql_data = [platform, parseInt(offset), parseInt(ranking_count)];
    
    if (DEBUG) console.log(FUNC + "sql:", sql);
    if (DEBUG) console.log(FUNC + "sql_data:", sql_data);
    
    pool.query(sql, sql_data, function (err, results) {
        if (err) {
            if (ERROR) console.error(FUNC + table + " - err:", err);
            cb(err);
        } else {
            if (getNewMyRank) {
                _getNewMyRank(pool, data, table, field, test, function (err_my_rank, result_my_rank) {
                    if (err_my_rank) {
                        if (ERROR) console.error(FUNC + table + " - err_my_rank:", err_my_rank);
                        cb(err_my_rank);
                    }
                    else {
                        cb(null, { "rank": results, "my_rank": result_my_rank });
                    }
                });
            }
            else {
                cb(null, { "rank": results});
            }
        }
    });
}

/*
SELECT a.id, a.vip, a.channel_account_name, a.tempname, a.nickname, a.redress_no, r.max_wave, r.updated_at 
, (
SELECT COUNT(*) 
FROM tbl_goddess AS r1, tbl_account AS a1 
WHERE a1.platform = 1 
AND a1.id = r1.id 
AND (r.max_wave < r1.max_wave OR (r.max_wave = r1.max_wave AND r.updated_at >= r1.updated_at))
) AS my_rank 
FROM tbl_goddess AS r, tbl_account AS a 
WHERE a.platform = 1 AND a.id=21 AND r.id=21
*/
function _getNewMyRank(pool, data, table, field, test, cb) {
    const FUNC = TAG + "_getNewMyRank() --- ";
    //------------------------------------------------------

    var uid = data['account_id'];
    var platform = data['platform'];

    const QUERY_ONCE = true;

    if (DEBUG) console.log(FUNC + "test: ", test);

    // 特别注意: 时间比较的条件编程.
    // (r.max_wave < r1.max_wave OR (r.max_wave = r1.max_wave AND r.updated_at >= r1.updated_at))
    if (QUERY_ONCE) {
        var sql = "";
        sql += "SELECT a.id, a.vip, a.channel_account_name, a.tempname, a.nickname, a.redress_no, r." + field + ", r.updated_at ";
        sql += ", (";
        sql += "SELECT COUNT(*) ";
        sql += "FROM " + table + " AS r1, tbl_account AS a1 ";
        sql += "WHERE a1.platform = ? ";
        if (test != 2) {
            sql += "AND a1.test <> 2 ";// 测试人员不进入个人名次计算
        }
        sql += "AND a1.id = r1.id ";
        sql += "AND (r." + field + " < r1." + field + " ";
        sql += "OR (r." + field + " = r1." + field + " AND r.updated_at >= r1.updated_at))";
        sql += ") AS my_rank ";
        sql += "FROM " + table + " AS r, tbl_account AS a ";
        sql += "WHERE a.platform = ? AND a.id=? AND r.id=? ";
        if (test != 2) {
            sql += "AND a.test <> 2 ";// 测试人员不进入个人名次计算
        }
        
        var sql_data = [platform, platform, uid, uid];

        // if (DEBUG) console.log(FUNC + "sql:", sql);
        // if (DEBUG) console.log(FUNC + "sql_data:", sql_data);
        
        pool.query(sql, sql_data, function (err, results) {
            if (err) {
                if (ERROR) console.error(FUNC + "err:\n", err);
                if (ERROR) console.error(FUNC + "sql:\n", sql);
                if (ERROR) console.error(FUNC + "sql_data:\n", sql_data);
                cb(err);
            } else {
                cb(null, results[0]);
            }
            DEBUG = 0;
        });
    }
    else {
        // DONE: 子查询有BUG, 暂时改为两个查询获得结果
        // 此做法已经可以了
        _queryRankData(pool, table, field, uid, platform, function(err, rank_data) {
            // 玩家还没有女神排名的情况
            if (rank_data == null) {
                cb(null, []);
            }
            else {
                _getRankData(pool, rank_data, table, field, uid, platform, function(err, my_rank) {
                    rank_data.my_rank = my_rank;
                    cb(null, rank_data);
                });
            }
        });
    }

}

/**
 * 查询排行数据(tbl_goddess | tbl_aquarium)
SELECT a.id, a.vip, a.channel_account_name, a.tempname, a.nickname, a.redress_no, r.max_wave, r.updated_at 
FROM tbl_goddess AS r, tbl_account AS a 
WHERE a.platform = 1 AND a.id=21 AND r.id=21
 */
function _queryRankData(pool, table, field, uid, platform, cb) {
    const FUNC = TAG + "_queryRankData() --- ";

    var sql = "";
    sql += "SELECT a.id, a.vip, a.channel_account_name, a.tempname, a.nickname, a.redress_no, r." + field + ", r.updated_at ";
    sql += "FROM " + table + " AS r, tbl_account AS a ";
    sql += "WHERE a.platform=? AND a.id=? AND r.id=?";
    
    var sql_data = [platform, uid, uid];

    if (DEBUG) console.log(FUNC + "sql:\n", sql);
    if (DEBUG) console.log(FUNC + "sql_data:\n", sql_data);

    pool.query(sql, sql_data, function (err, results) {
        if (err) {
            if (ERROR) console.error(FUNC + "[ERROR] err:", err);
            cb(err);
            return;
        }
        var rank_data = results[0];
        cb(null, rank_data);
    });
}

/**
 * 查询玩家在排行榜中的名次.
SELECT COUNT(*) 
FROM tbl_goddess AS r1, tbl_account AS a1 
WHERE a1.platform = 1 
AND a1.id = r1.id 
AND (22 < r1.max_wave OR (22 = r1.max_wave AND '2017-05-16 10:50:20' >= r1.updated_at))
 */
function _getRankData(pool, rank_data, table, field, uid, platform, cb) {
    const FUNC = TAG + "_getRankData() --- ";

    var sql = "";
    sql += "SELECT COUNT(*) AS my_rank ";
    sql += "FROM " + table + " AS r1, tbl_account AS a1 ";
    sql += "WHERE a1.platform = ? ";
    sql += "AND a1.id = r1.id ";
    sql += "AND (? < r1." + field + " OR (? = r1." + field + " AND ? >= r1.updated_at))";

    var sql_data = [platform, rank_data.max_wave, rank_data.max_wave, rank_data.updated_at];

    if (DEBUG) console.log(FUNC + "sql:\n", sql);
    if (DEBUG) console.log(FUNC + "sql_data:\n", sql_data);

    pool.query(sql, sql_data, function (err, results) {
        if (err) {
            if (ERROR) console.error(FUNC + "[ERROR] err:", err);
            cb(err);
            return;
        }
        if (DEBUG) console.log(FUNC + "results:", results);
        cb(null, results[0].my_rank);
    });
}

////////////////////////////////////////////////////////////////////////////////
// 复用方法
////////////////////////////////////////////////////////////////////////////////

/**
 * 获取金币，成就点排行榜.
 * @param data 客户端上传参数.
 * @param type 排名字段(gold, achieve_point).
 * @param getMyRank 是否获取我的排名.
 * @param test 是否为测试(数据有问题的账号), 不是则排除在排行榜之外.
// 金币
SELECT a.id, a.channel_account_name, a.tempname, a.nickname, a.redress_no, a.gold, i.web_url AS figure_url 
FROM tbl_account AS a, tbl_img AS i 
WHERE a.platform = 1 AND a.figure = i.id 
ORDER BY a.gold DESC, a.id ASC 
LIMIT 0, 30
// 成就点
SELECT a.id, a.channel_account_name, a.tempname, a.nickname, a.redress_no, a.achieve_point, i.web_url AS figure_url 
FROM tbl_account AS a, tbl_img AS i 
WHERE a.platform = 1 AND a.figure = i.id 
ORDER BY a.achieve_point DESC, a.id ASC 
LIMIT 0, 30
 */
function _getRank(pool, data, type, getMyRank, test, cb) {
    const FUNC = TAG + "_getRank() --- ";
    
    var offset = data['offset'] || 0;
    var ranking_count = data['ranking_count'];
    var platform = data['platform'];
    // 更新数据库中此账户的exp字段
    var sql = "";
    sql += "SELECT a.id, a.vip, a.channel_account_name, a.tempname, a.nickname, a.redress_no, a." + type + ", i.web_url AS figure_url ";
    sql += "FROM tbl_account AS a, tbl_img AS i ";
    sql += "WHERE a.platform = ? AND a.figure = i.id ";
    // TODO: 获取请求者的ID, 如果请求者test=2则需要返回包括测试者的排行
    if (test != 2) {
        sql += "AND a.test <> 2 ";// 测试人员不进入排行榜
    }
    sql += "ORDER BY a." + type + " DESC, a.id ASC ";
    sql += "LIMIT ?, ?";
    
    var sql_data = [platform, parseInt(offset), parseInt(ranking_count)];
    
    DEBUG = 0;
    if (DEBUG) console.log(FUNC + 'sql: ', sql);
    if (DEBUG) console.log(FUNC + 'sql_data: ', sql_data);
    DEBUG = 0;
    
    pool.query(sql, sql_data, function (err, results) {
        if (err) {
            if (ERROR) console.error(FUNC + 'type: ' + type + ',err:\n', err);
            if (ERROR) console.error(FUNC + 'sql: ', sql);
            if (ERROR) console.error(FUNC + 'sql_data: ', sql_data);
            cb(err);
        } else {
            if (DEBUG) console.log("金币|成就排行榜:\n", results);
            if (getMyRank) {
                _getMyRank(pool, data, type, test, function (err_my_rank, results_my_rank) {
                    if (err_my_rank) {
                        if (ERROR) console.error(FUNC + 'type: ' + type + ',err:\n', err_my_rank);
                        cb(err_my_rank);
                    }
                    else {
                        cb(null, {"rank": results, "my_rank": results_my_rank[0]});
                    }
                });
            }
            else {
                cb(null, {"rank": results});
            }
        }
    });
}

/**
 * 获取玩家的金币，成就点排名.
// 金币
SELECT a.id, a.channel_account_name, a.tempname, a.nickname, a.redress_no, a.gold  
, (SELECT COUNT(*) 
FROM tbl_account 
WHERE platform =2 
AND test <> 2
AND (a.gold<gold OR (a.gold=gold AND a.id>id))
) + 1 AS my_rank 
FROM tbl_account AS a 
WHERE a.platform=2 AND id=14 
AND a.test <> 2
// 成就点
SELECT a.id, a.channel_account_name, a.tempname, a.nickname, a.redress_no, a.achieve_point  
, (SELECT COUNT(*) 
FROM tbl_account 
WHERE platform =1 AND 
(a.achieve_point<achieve_point OR (a.achieve_point=achieve_point AND a.id>id))
) + 1 AS my_rank 
FROM tbl_account AS a 
WHERE a.platform=1 AND id=21
 */
function _getMyRank(pool, data, type, test, cb) {
    const FUNC = TAG + "_getMyRank() --- ";

    var account_id = data['account_id'];
    var platform = data['platform'];
    
    var sql = "";
    sql += "SELECT id, vip, channel_account_name, tempname, nickname, a.redress_no, " + type + " ";
    sql += ", (SELECT COUNT(*) ";
    sql += "FROM tbl_account ";
    sql += "WHERE platform = ? ";
    if (test != 2) {
        sql += "AND test <> 2 ";// 测试人员不进入个人名次计算
    }
    sql += "AND (a." + type + "<" + type + " OR (a." + type + "=" + type + " AND a.id>id))";// 增加id作为同分排名依据
    sql += ") + 1 AS my_rank ";
    sql += "FROM tbl_account AS a ";
    sql += "WHERE a.platform = ? AND id=? ";
    if (test != 2) {
        sql += "AND a.test <> 2 ";// 测试人员不进入个人名次计算
    }
    
    var sql_data = [platform, platform, account_id];
    
    // if (DEBUG) console.log(FUNC + 'sql: ', sql);
    // if (DEBUG) console.log(FUNC + 'sql_data: ', sql_data);
    
    pool.query(sql, sql_data, function (err, results) {
        if (err) {
            if (ERROR) console.error(FUNC + "err:\n", err);
            if (ERROR) console.error(FUNC + "sql:\n", sql);
            if (ERROR) console.error(FUNC + "sql_data:\n", sql_data);
            cb(err);
        } else {
            cb(null, results);
        }
    });
}