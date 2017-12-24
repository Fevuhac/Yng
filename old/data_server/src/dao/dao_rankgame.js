////////////////////////////////////////////////////////////////////////////////
// 排位赛数据的相关读取和存储
//------------------------------------------------------------------------------
// 封装方法如下
//------------------------------------------------------------------------------
// getRankgame
// rankgameInfo
// rankgameBox
////////////////////////////////////////////////////////////////////////////////

//==============================================================================
// import
//==============================================================================
var CommonUtil = require('../buzz/CommonUtil');
var ObjUtil = require('../buzz/ObjUtil');
var BuzzUtil = require('../utils/BuzzUtil');
var DateUtil = require('../utils/DateUtil');
var StringUtil = require('../utils/StringUtil');
var RedisUtil = require('../utils/RedisUtil');
var REDIS_KEYS = require('../buzz/cst/buzz_cst_redis_keys').REDIS_KEYS,
    CHART = REDIS_KEYS.CHART;

var ERROR_OBJ = require('../buzz/cst/buzz_cst_error').ERROR_OBJ;

var CacheAccount = require('../buzz/cache/CacheAccount');

var AccountCommon = require('./account/common');

var account_ranking = require('./account/ranking');

//------------------------------------------------------------------------------
// 配置表
//------------------------------------------------------------------------------
var rank_rankgame_cfg = require('../../cfgs/rank_rankgame_cfg');
var treasure_treasure_cfg = require('../../cfgs/treasure_treasure_cfg');
var common_const_cfg = require('../../cfgs/common_const_cfg');

//------------------------------------------------------------------------------
// buzz
//------------------------------------------------------------------------------
var buzz_account = require('../buzz/buzz_account');
var buzz_charts = require('../buzz/buzz_charts');

//------------------------------------------------------------------------------
// DAO
//------------------------------------------------------------------------------
var dao_reward = require('./dao_reward');

//==============================================================================
// const
//==============================================================================
var ERROR = 1;
var DEBUG = 0;

var TAG = "【dao_rankgame】";

const OP_TYPE = {
    UNLOCK: 0,
    SPEED: 1,
    REWARD: 2,
};
exports.OP_TYPE = OP_TYPE;

const SEASON_TARGET = {
    WIN: 10,
    BOX: 10,
    FIRST_WIN: 5,
};

//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.getRankgame = getRankgame;
exports.rankgameInfo = rankgameInfo;
exports.rankgameBox = rankgameBox;
exports.seasonEnd = seasonEnd;
exports.handleSeasonEnd = handleSeasonEnd;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
/**
 * 获取排位赛数据(比赛结束后立即获取).
 */

function getRankgame(pool, data, cb) {
    const FUNC = TAG + "getRankgame() --- ";

    var uid = data.token.split("_")[0];
    CacheAccount.getAccountById(uid, function (err, account) {

        console.log(FUNC + "account.match_unfinish:", account.match_unfinish);

        if (account.match_unfinish > 0) {
            // 查询tbl_rankgame_log并返回比赛结果.
            getRankgameLog(pool, uid, account, cb);

            // 查询后立即重置unfinish字段
            account.match_unfinish = 0;
            account.commit();
        }
        else {
            cb(null, {finish: false});
        }
    });

}

/**
 * 获取排位赛信息(客户端打开排位赛UI时调用).
 */
function rankgameInfo(pool, data, account, cb) {
    const FUNC = TAG + "rankgameInfo() --- ";
    var token = data.token;
    var uid = account.id;

    var season_win = account.match_season_win;
    var season_box = account.match_season_box;
    var season_first_win = account.match_season_1st_win;
    var is_season_reward = account.match_got_season_reward;
    var first_box = account.match_1st_box;
    if (DEBUG) console.log(FUNC + uid + "-first_box:\n", first_box);
    var first_box_lefttime = getFirstBoxLefttime(first_box.timestamp);
    var old_stat = first_box.stat;
    if (old_stat == 0 && first_box_lefttime == 0) {
        first_box.stat = 1;
        if (DEBUG) console.log(FUNC + "如果是从0变化到1, 则更新数据库");
        account.match_1st_box = first_box;
    }
    first_box = {
        id: first_box.id,
        stat: first_box.stat,
        lefttime: first_box_lefttime,
    };
    if (DEBUG) console.log(FUNC + "========first_box:\n", first_box);

    // 计算排位赛的排名.
    account.account_id = account.id;

    // PAIR.RANK.MATCH
    console.log(FUNC + 'match_box_list:', account.match_box_list);
    console.log(FUNC + 'match_box_timestamp:', account.match_box_timestamp);

    var ret = {
        points: account.match_points,
        my_rank: 0, //todo:linyng
        rank: account.match_rank,
        box: account.match_box_list,
        // -1表示未解锁, >0表示解锁中, 0表示解锁完毕, 可以领取
        lefttime: _getBoxLefttime(account.match_box_list, account.match_box_timestamp, false),
        first_box: first_box,
        season: {
            win: {count: season_win, total: SEASON_TARGET.WIN},
            box: {count: season_box, total: SEASON_TARGET.BOX},
            first_win: {count: season_first_win, total: SEASON_TARGET.FIRST_WIN},
            lefttime: DateUtil.getLeftTimeToTheEndOfThisMonth(),
            is_season_reward: is_season_reward,
        }
    };
    // TODO: chart_lm
    RedisUtil.hget(CHART.MATCH_LM + ":" + account.platform, uid, function(err, res) {
        var res = JSON.parse(res);
        if (res) {
            if (res.reward == 1) {
                let rank_lm = BuzzUtil.getRankIdFromPointsAndRank(res.score, res.my_rank - 1);
                if (0 == rank_lm) {
                    rank_lm = BuzzUtil.getRankIdFromPoints(res.score);
                }
                ret.chart_lm = {
                    rank: rank_lm,
                };
            }
            ret.season.is_season_reward = res.reward == 1 ? 0 : 1;
        }
        account.commit();
        cb(null, ret);
    });
}

/**
 * 排位赛中的宝箱操作相关.
 */
function rankgameBox(pool, data, account, cb) {
    const FUNC = TAG + "rankgameBox() --- ";

    var uid = data.token.split("_")[0];
    var type = data.type;// 操作类型


    CacheAccount.getAccountById(uid, function (err, account) {
        if (err) {
            cb(err);
            return;
        }

        switch(type) {
            case OP_TYPE.UNLOCK:
                opUnlock(pool, data, account, cb);
                break;

            case OP_TYPE.SPEED:
                opSpeed(pool, data, account, cb);
                break;

            case OP_TYPE.REWARD:
                opReward(pool, data, account, cb);
                break;
        }
    });
}

/**
 * 从配置表获取赛季奖励信息.
 */
function getSeasonRewardFromRankgameCfg(rank_id) {
    for (var idx in rank_rankgame_cfg) {
        var rankgame_info = rank_rankgame_cfg[idx];
        if (rankgame_info.id == rank_id) {
            return rankgame_info.seasonreward;
        }
    }
}

function seasonEnd(pool, cb) {
    const FUNC = TAG + "seasonEnd() --- ";

    // 判断当前是否最后一天
    if (DateUtil.isLastDayOfThisMonth()) {
        if (DEBUG)console.log(FUNC + "今天是本月最后一天, 赛季结束");
        handleSeasonEnd(pool, cb);
        buzz_charts.generateMonthlyReward();
    }
    else {
        cb(new Error("今天不是本月最后一天"));
    }
}

function handleSeasonEnd(pool, cb) {
    const FUNC = TAG + "handleSeasonEnd() --- ";

    if (DEBUG)console.log(FUNC + "处理完成赛季任务的人");
    _seasonWin(pool, function(err, result) {
        if (DEBUG)console.log(FUNC + "处理没有完成赛季任务的人");
        _seasonFail(pool, function(err, result) {
            if (DEBUG)console.log(FUNC + "清理上个赛季的数据");
            _resetSeasonData(pool, function(err, result) {
                cb(null, "赛季结算结束");
            });
        });
    });
}

/**
 * 处理获得了赛季奖励的玩家数据.
UPDATE tbl_rankgame 
SET is_season_reward=0 
WHERE season_win>=10 
AND season_box>=8 
AND season_first_win>=5 
 */
function _seasonWin(pool, cb) {
    var sql = "";
    sql += "UPDATE tbl_rankgame ";
    sql += "SET is_season_reward=0 ";
    sql += "WHERE season_win>=? ";
    sql += "AND season_box>=? ";
    sql += "AND season_first_win>=? ";

    var sql_data = [
        SEASON_TARGET.WIN,
        SEASON_TARGET.BOX,
        SEASON_TARGET.FIRST_WIN
    ];

    pool.query(sql, sql_data, function(err, result) {
        cb(err, result);
    });
}

/**
 * 处理没有获得赛季奖励的玩家数据.
UPDATE tbl_rankgame 
SET is_season_reward=1 
WHERE season_win<10 
OR season_box<8 
OR season_first_win<5 
 */
function _seasonFail(pool, cb) {
    var sql = "";
    sql += "UPDATE tbl_rankgame ";
    sql += "SET is_season_reward=1 ";
    sql += "WHERE season_win<? ";
    sql += "AND season_box<? ";
    sql += "AND season_first_win<? ";

    var sql_data = [
        SEASON_TARGET.WIN,
        SEASON_TARGET.BOX,
        SEASON_TARGET.FIRST_WIN
    ];

    pool.query(sql, sql_data, function(err, result) {
        cb(err, result);
    });
}

/**
 * 重置赛季相关数据.
 */
function _resetSeasonData(pool, cb) {
    var sql = "";
    sql += "UPDATE tbl_rankgame ";
    sql += "SET season_win=0 ";
    sql += ", season_box=0 ";
    sql += ", season_first_win=0 ";
    sql += ", season_count=0 ";

    var sql_data = [];

    pool.query(sql, sql_data, function(err, result) {
        cb(err, result);
    });
}



//==============================================================================
// private
//==============================================================================

/**
 * 宝箱操作: 解锁宝箱.
 */
function opUnlock(pool, data, account, cb) {
    const FUNC = TAG + "opUnlock() --- ";

    var uid = data.token.split("_")[0];
    var idx = data.idx;// 操作的宝箱索引(0,1,2)
    var box = account.match_box_list;
    var box_timestamp = account.match_box_timestamp;

    if (idx < 0 && idx > 2) {
        cb(new Error("宝箱编号超出索引范围idx:", idx));
        return;
    }

    // 检查是否有正在解锁中的宝箱
    for (var i = 0; i < box_timestamp.length; i++) {
        var start_time = parseInt(box_timestamp[i]);
        if (start_time > 0) {
            var box_id = box[i];
            var lefttime = _getLeftTime(start_time, box_id);
            if (lefttime > 0) {
                cb(ERROR_OBJ.RANKGAME_UNLOCKING);
                return;
            }
        }
    }

    var box_id = box[idx];

    // 判断条件: 对应索引的宝箱ID不为0
    if (box_id == 0) {
        cb(new Error("当前位置的宝箱是空的"));
        return;
    }
    // 设置: 宝箱解锁时间
    box_timestamp[idx] = new Date().getTime();
    account.match_box_timestamp = box_timestamp;
    account.commit();

    // TODO: 返回当前操作宝箱的数据
    var lefttime = _getLeftTime(box_timestamp[idx], box_id);
    var ret = {
        id: box_id,
        lefttime: lefttime,
    };
    cb(null, ret);
}

function _getLeftTime(timestamp, id, isSpeed) {
    const FUNC = TAG + "_getLeftTime() --- ";

    var needtime = _getTreasureTimeById(id);

    if (timestamp == -1 && isSpeed) {
        console.log(FUNC + "加速宝箱没有解锁, 剩余时间查配置表");
        return needtime;
    }

    if (timestamp == -1) {
        return timestamp;
    }
    var pasttime = (new Date().getTime() - timestamp) / 1000;
    // var needtime = _getTreasureTimeById(id);
    var lefttime = needtime - pasttime;
    if (lefttime < 0) {
        lefttime = 0;
    }
    return Math.round(lefttime);
}

var pearlNeed = 50;

/**
 * 宝箱操作: 加速解锁.
 */
function opSpeed(pool, data, account, cb) {
    const FUNC = TAG + "opSpeed() --- ";

    var uid = data.token.split("_")[0];
    var idx = data.idx;// 操作的宝箱索引(0,1,2)
    var box = account.match_box_list;
    var box_timestamp = account.match_box_timestamp;
    var season_box = account.match_season_box;

    var box_id = box[idx];

    // 判断条件: 对应索引的宝箱ID不为0
    if (box_id == 0) {
        cb(new Error("当前位置的宝箱是空的"));
        return;
    }

    var lefttime = _getLeftTime(box_timestamp[idx], box[idx], true);
    console.log(FUNC + "lefttime:", lefttime);
    pearlNeed = getPearlNeed(lefttime);
    console.log(FUNC + "pearlNeed:", pearlNeed);

    var pearl = account.pearl;
    if (pearl < pearlNeed) {
        // cb(new Error("玩家没有足够的钻石"));
        cb(ERROR_OBJ.DIAMOND_NOT_ENOUGH);
        return;
    }

    // 设置: 宝箱设置为0表示当前位置没有宝箱
    box[idx] = 0;
    var new_box = box;
    // 设置: 宝箱解锁时间为0则宝箱处于可以领取的状态
    box_timestamp[idx] = 0;

    account.match_box_list = new_box;
    account.match_box_timestamp = box_timestamp;
    account.match_season_box = season_box + 1;
    account.pearl = pearl - pearlNeed >=0 ? pearl - pearlNeed:0;
    account.commit();
    var ret = {
        id: box_id,
        lefttime: 0,
        pearl: pearl - pearlNeed,
    };

    cb(null, ret);
}

/**
 * 查表计算加速需要的钻石数量.
 * @param lefttime 单位: 秒
 */
function getPearlNeed(lefttime) {
    var pearlNeed = Math.ceil(lefttime / common_const_cfg.RMATCH_COST);
    return pearlNeed;
}




/**
 * 宝箱操作: 领取奖励.
 */
function opReward(pool, data, account, cb) {
    const FUNC = TAG + "opReward() --- ";

    var uid = data.token.split("_")[0];
    var idx = data.idx;// 操作的宝箱索引(0,1,2)
    var box = account.match_box_list;
    var box_timestamp = account.match_box_timestamp;
    var season_box = account.match_season_box;

    if (idx == 3) {

        function rewardFirstBox() {
            var first_box = account.match_1st_box;
            var box_id = first_box.id;
            if (box_id == 0) {
                if (ERROR) console.error(FUNC + "玩家没有首胜宝箱");
                cb(ERROR_OBJ.RANKGAME_NO_1ST_WIN_BOX);
                return;
            }
            var timestamp = new Date().getTime();
            var first_box_value = '{"stat":0,"timestamp":' + timestamp + ',"id":0}';
            var lefttime = getFirstBoxLefttime(timestamp);


            account.match_1st_box = JSON.parse(first_box_value);
            account.match_season_box = season_box + 1;
            account.commit();

            var ret = {
                id: box_id,
                lefttime: lefttime,
            };
            cb(null, ret);
        }

        rewardFirstBox();
        return;
    }

    var box_id = box[idx];

    // 判断条件: 对应索引的宝箱ID不为0
    if (box_id == 0) {
        if (ERROR) console.error(FUNC + "当前位置的宝箱是空的");
        cb(ERROR_OBJ.RANKGAME_EMPTY_BOX);
        return;
    }
    // 设置: 宝箱设置为0表示当前位置没有宝箱
    box[idx] = 0;
    var new_box = box;
    
    var lefttime = _getLeftTime(box_timestamp[idx], box_id);
    if (DEBUG)console.log(FUNC + "lefttime:", lefttime);
    if (lefttime > 0) {
        if (ERROR) console.error(FUNC + "当前位置的宝箱还在解锁中");
        cb(ERROR_OBJ.RANKGAME_UNLOCKING);
        return;
    }
    if (lefttime == -1) {
        if (ERROR) console.error(FUNC + "当前位置的宝箱还没有解锁"); 
        cb(ERROR_OBJ.RANKGAME_LOCKED);
        return;
    }
    // 设置: 宝箱解锁时间为0则宝箱处于可以领取的状态
    box_timestamp[idx] = 0;

    account.match_box_list = new_box;
    account.match_box_timestamp = box_timestamp;
    account.match_season_box = season_box + 1;
    account.commit();

    var ret = {
        id: box_id,
        lefttime: 0,
    };
    cb(null, ret);
}

/**
 * 获取首胜宝箱的剩余开启时间.
 */
function getFirstBoxLefttime(timestamp) {
    const FUNC = TAG + "getFirstBoxLefttime() --- ";

    var pasttime = (new Date().getTime() - timestamp) / 1000;
    var needtime = DateUtil.SECONDS_IN_ONE_DAY;
    var lefttime = needtime - pasttime;
    console.log(FUNC + "pasttime:", pasttime);
    console.log(FUNC + "needtime:", needtime);
    console.log(FUNC + "lefttime:", lefttime);
    if (lefttime < 0) {
        lefttime = 0;
    }
    return Math.round(lefttime);
}



/**
 * 更新tbl_rankgame表.
 * @param uid 用户ID.
 * @param field 需要更新的字段数组(字段名).
 * @param value 需要更新的字段值(存放在数组中).
 */
function _updateTableRankgame(pool, uid, field, value, cb) {
    const FUNC = TAG + "_updateTableRankgame() --- ";

    // 检测一下字段名数组和字段值数组长度是否匹配
    if (field.length != value.length) {
        var err_info = "field与value长度不符, field:" + field.length + ", value:" + value.length;
        if (ERROR) console.error(FUNC + err_info);
        cb(new Error(err_info));
        return;
    }

    var sql = "";
    sql += "UPDATE `tbl_rankgame` ";
    sql += "SET ";
    for (var i = 0; i < field.length; i++) {
        if (i > 0) sql += ", ";
        sql += "`" + field[i] + "`=? ";
    }
    sql += "WHERE `id`=? ";
    var sql_data = [];
    for (var i = 0; i < value.length; i++) {
        sql_data.push(value[i]);
    }
    sql_data.push(uid);

    if (DEBUG) console.log(FUNC + "sql:\n", sql);
    if (DEBUG) console.log(FUNC + "sql_data:\n", sql_data);
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            cb(err);
            return;
        }
        cb(null, result);
    });
}

const BOX_LOCKED = -1;

/**
 * 获取宝箱获取后过去的时间.
 */
function _getBoxPasttime(box_timestamp) {
    const FUNC = TAG + "_getBoxPasttime() --- ";

    if (DEBUG) console.log(FUNC + "box_timestamp:", box_timestamp);
    console.log(FUNC + "box_timestamp:", box_timestamp);

    var ret = [];
    var list = box_timestamp;
    console.log(FUNC + "list:", list);
    if (list) {
        for (var i = 0; i < list.length; i++) {
            var timestamp = list[i];
            if (DEBUG) console.log(FUNC + "timestamp:", timestamp);
            if (timestamp == BOX_LOCKED) {
                if (DEBUG) console.log(FUNC + "timestamp == BOX_LOCKED");
                ret.push(BOX_LOCKED);
            }
            else {
                ret.push(Math.round(new Date().getTime() - timestamp));
            }
        }
    }
    else {
        console.error(FUNC + 'box_timestamp为空');
    }
    return ret;
}

/**
 * 获取宝箱开启还剩余的时间.
 */
function _getBoxLefttime(box, box_timestamp, is_first) {
    const FUNC = TAG + "_getBoxLefttime() --- ";

    var ret = [];
    var box_list = box;
    var list = _getBoxPasttime(box_timestamp);
    if (box_list.length != list.length) {
        if (ERROR) console.error(FUNC + "宝箱数组与剩余时间数组长度不符");
        return ret;
    }
    for (var i = 0; i < list.length; i++) {
        var pasttime = list[i];
        var needtime = _getTreasureTimeById(box_list[i]);//单位秒, 需要读取数据库
        needtime = needtime * 1000;
        if (DEBUG) console.log(FUNC + "---needtime:", needtime);
        if (is_first) {
            needtime = DateUtil.MINISECONDS_IN_ONE_DAY;// 固定为1天(毫秒)
        }
        var lefttime = needtime - pasttime;
        lefttime = Math.round(lefttime / 1000);
        if (lefttime < 0) lefttime = 0;
        if (pasttime == BOX_LOCKED) {
            lefttime = BOX_LOCKED;
        }

        if (DEBUG) console.log(FUNC + "pasttime:", pasttime);
        if (DEBUG) console.log(FUNC + "lefttime:", lefttime);

        ret.push(lefttime);
    }
    return ret;
}

function _getTreasureTimeById(id) {
    var treasure = _getTreasureById(id);
    if (treasure) {
        return treasure.time;
    }
    return 0;
}

function _getTreasureById(id) {
    for (var idx in treasure_treasure_cfg) {
        var treasure = treasure_treasure_cfg[idx];
        if (treasure.id == id) {
            return treasure;
        }
    }
    return null;
}

const DEFAULT_VALUE = {
    /** 初始玩家积分. */
    POINTS: 800,
    /** 初始玩家段位. */
    RANK: getRankIdFromPoints(800),
};

function getRankIdFromPoints(points) {
    for (var i = rank_rankgame_cfg.length - 1; i > 0; i--) {
        var rank_info = rank_rankgame_cfg[i];
        if (points >= rank_info.integral) {
            return rank_info.id;
        }
    }
}

/**
 * 插入一条排位赛信息
 */
function _insertRankgameInfo(pool, uid, cb) {
    const FUNC = TAG + "_insertRankgameInfo() --- ";

    var sql = "";
    sql += "INSERT INTO `tbl_rankgame` ";
    sql += "(id, points, rank) ";
    sql += "VALUES (?,?,?)";
    var sql_data = [uid, DEFAULT_VALUE.POINTS, DEFAULT_VALUE.RANK];
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            console.error(FUNC + 'err:\n', err);
            if (cb) cb(err);
            return;
        }
        if (cb) cb(null, result);
    });
}

function getRankgameLog(pool, uid, account, cb) {
    const FUNC = TAG + "getRankgameLog() --- ";

    let id = account.match_unfinish;

    var sql = "";
    sql += "SELECT * ";
    sql += "FROM `tbl_rankgame_log` ";
    sql += "WHERE `id`=? ";
    var sql_data = [id];

    if (DEBUG) console.log(FUNC + "sql:\n", sql);
    if (DEBUG) console.log(FUNC + "sql_data:\n", sql_data);
    
    pool.query(sql, sql_data, function (err, results) {
        if (err) {
            console.error(FUNC + "err:", err);
            cb(err);
            return;
        }
        if (results.length == 0) {
            console.error(FUNC + "err:results.length == 0");
            cb(ERROR_OBJ.RANKGAME_WRONG_LOG_ID);// TODO: 返回比赛记录不存在的错误
            return;
        }
        console.log(FUNC + "results:", results);
        var result = ObjUtil.str2Data(results[0].result);
        var p1 = result.player1;
        var p2 = result.player2;

        var match_info = [
            {
                uid: p1.uid,
                nickname: p1.nickname,
                fish_account: p1.fish_account,
                rank: p1.rank,
                nuclear_fish_count: p1.nuclear_fish_count,
                nuclear_score: p1.nuclear_score,
                winning_rate: p1.winning_rate,
                figureurl: p1.figureurl,
            },
            {
                uid: p2.uid,
                nickname: p2.nickname,
                fish_account: p2.fish_account,
                rank: p2.rank,
                nuclear_fish_count: p2.nuclear_fish_count,
                nuclear_score: p2.nuclear_score,
                winning_rate: p2.winning_rate,
                figureurl: p2.figureurl,
            }
        ];
        for (var key in result) {
            // {"player1":{}, "player2":{}, "winner":num}
            if (key != "winner") {
                var player = result[key];
                if (player.uid == uid) {
                    var ret = {
                        finish: true,// 固定为true.
                        point_change: player.point_change,
                        box: player.box,// 败者宝箱为null
                        rank: player.rank,
                        rank_change: player.rank_change,
                        winning_streak: player.winning_streak,
                        match_info: match_info,
                    };
                    if (account) {
                        ret.charm_point = account.charm_point;
                        ret.charm_rank = account.charm_rank;
                    }
                    console.log(FUNC + "rank_change:", ret.rank_change);
                    cb(null, ret);
                    break;
                }
            }
        }
    });

}
