/**
 * 玩家信息字段及默认值，以下数据从数据库导出所得
 * TODO: 表过于臃肿，待拆分:女神数据，凡是单个字段
 */

/**
 * 获取初始化的女神数据
 */
function _getGoddessInitData() {
    var goddess_goddess_cfg = require('../../../cfgs/goddess_goddess_cfg');// 女神基础数据
    var goddess_goddessup_cfg = require('../../../cfgs/goddess_goddessup_cfg');// 女神升级数据

    function _getHpByIdAndLv(id, lv) {
        for (var idx in goddess_goddessup_cfg) {
            var lvGoddess = goddess_goddessup_cfg[idx];
            if (lvGoddess.id == id && lvGoddess.level == lv) {
                return lvGoddess.hp;
            }
        }
        return 0;
    }
    
    var ret = [];
    for (var i = 0; i < goddess_goddess_cfg.length; i++) {
        var goddess = goddess_goddess_cfg[i];
        var god = {
            id: goddess.id,
            level: 0,
            hp: _getHpByIdAndLv(goddess.id, 0),
            startWaveIdx: 0,
            free: goddess.free,
            ctimes: 0,
            unlock: [0, 0, 0, 0, 0, 0, 0, 0, 0],//女神解锁
            interactReward: [0, 0, 0, 0],//互动奖励时间戳, 4个，身体四个区域
            isPauseAway: false,
        };
        ret.push(god);
    }
    //新版本需求，默认解锁第一个女神
    if (ret.length > 0) {
        ret[0].level = 1;
        ret[0].unlock = [2, 2, 2, 2, 2, 2, 2, 2, 2];
    }
    return ret;
}


//
exports.AccountDef = {
    "id": {
        "def": 0,
        "type": "number",
        "name": "id"
    },
    "jointype": {
        "def": 0,
        "type": "number",
        "name": "jointype"
    },
    "who_invite_me": {
        "def": 0,
        "type": "number",
        "name": "who_invite_me"
    },
    "who_share_me": {
        "def": 0,
        "type": "number",
        "name": "who_share_me"
    },
    "tempname": {
        "def": "fj_",
        "type": "string",
        "name": "tempname"
    },
    "nickname": {
        "def": null,
        "type": "string",
        "name": "nickname"
    },
    "password": {
        "def": null,
        "type": "string",
        "name": "password"
    },
    "pwd_history": {
        "def": null,
        "type": "string",
        "name": "pwd_history"
    },
    "vip": {
        "def": 0,
        "type": "number",
        "name": "vip"
    },
    "login_count": {
        "def": 0,
        "type": "number",
        "name": "login_count"
    },
    "logout_count": {
        "def": 0,
        "type": "number",
        "name": "logout_count"
    },
    "created_at": {
        "def": '0000-00-00 00:00:00',
        "type": "timestamp",
        "name": "created_at"
    },
    "updated_at": {
        "def": '0000-00-00 00:00:00',
        "type": "timestamp",
        "name": "updated_at"
    },
    "last_online_time": {
        "def": '0000-00-00 00:00:00',
        "type": "timestamp",
        "name": "last_online_time"
    },
    "salt": {
        "def": null,
        "type": "string",
        "name": "salt"
    },
    "token": {
        "def": null,
        "type": "string",
        "name": "token"
    },
    "gold": {
        "def": 1000,
        "type": "number",
        "name": "gold",
        "inc":true
    },
    "pearl": {
        "def": 0,
        "type": "number",
        "name": "pearl"
    },
    "weapon": {
        "def": 1,
        "type": "number",
        "name": "weapon"
    },
    "skill": {
        "def": {
            "1": 3,
            "2": 5,
            "3": 3,
            "4": -1,
            "8": 0,
            "9": 0,
            "10": 0
        },
        "type": "object",
        "name": "skill"
    },
    "broke_times": {
        "def": 0,
        "type": "number",
        "name": "broke_times"
    },
    "first_login": {
        "def": 1,
        "type": "number",
        "name": "first_login"
    },
    "day_reward": {
        "def": 1,
        "type": "number",
        "name": "day_reward"
    },
    "day_reward_adv": {
        "def": 0,
        "type": "number",
        "name": "day_reward_adv"
    },
    "new_reward_adv": {
        "def": 0,
        "type": "number",
        "name": "new_reward_adv"
    },
    "day_reward_weekly": {
        "def": 0,
        "type": "number",
        "name": "day_reward_weekly"
    },
    "vip_daily_fill": {
        "def": 1,
        "type": "number",
        "name": "vip_daily_fill"
    },
    "rmb": {
        "def": 0,
        "type": "number",
        "name": "rmb"
    },
    "channel": {
        "def": "fj",
        "type": "string",
        "name": "channel"
    },
    "channel_account_id": {
        "def": null,
        "type": "string",
        "name": "channel_account_id"
    },
    "platform": {
        "def": 1,
        "type": "number",
        "name": "platform"
    },
    "vip_weapon_id": {
        "def": null,
        "type": "string",
        "name": "vip_weapon_id"
    },
    "pfft_at": {
        "def": '0000-00-00 00:00:00',
        "type": "timestamp",
        "name": "pfft_at"
    },
    "channel_account_name": {
        "def": null,
        "type": "string",
        "name": "channel_account_name"
    },
    "channel_account_info": {
        "def": {},
        "type": "object",
        "name": "channel_account_info"
    },
    "exp": {
        "def": 0,
        "type": "number",
        "name": "exp"
    },
    "level": {
        "def": 1,
        "type": "number",
        "name": "level"
    },
    "level_mission": {
        "def": {},
        "type": "object",
        "name": "level_mission"
    },
    "mission_daily_reset": {
        "def": {},
        "type": "object",
        "name": "mission_daily_reset"
    },
    "mission_only_once": {
        "def": {},
        "type": "object",
        "name": "mission_only_once"
    },
    "first_buy": {
        "def": {},
        "type": "object",
        "name": "first_buy"
    },
    "activity_gift": {
        "def": {},
        "type": "object",
        "name": "activity_gift"
    },
    "heartbeat": {
        "def": 1,
        "type": "number",
        "name": "heartbeat"
    },
    "heartbeat_min_cost": {
        "def": 0,
        "type": "number",
        "name": "heartbeat_min_cost"
    },
    "achieve_point": {
        "def": 0,
        "type": "number",
        "name": "achieve_point"
    },
    "gold_shopping": {
        "def": 0,
        "type": "number",
        "name": "gold_shopping"
    },
    "weapon_skin": {
        "def": {
            "own": [1],
            "equip": 1
        },
        "type": "object",
        "name": "weapon_skin"
    },
    "bonus": {
        "def": {},
        "type": "object",
        "name": "bonus"
    },
    "drop_reset": {
        "def": {},
        "type": "object",
        "name": "drop_reset"
    },
    "drop_once": {
        "def": {},
        "type": "object",
        "name": "drop_once"
    },
    "comeback": {
        "def": {},
        "type": "object",
        "name": "comeback"
    },
    "vip_gift": {
        "def": [],
        "type": "object",
        "name": "vip_gift"
    },
    "weapon_energy": {
        "def": {},
        "type": "object",
        "name": "weapon_energy"
    },
    "pirate": {
        "def": {},
        "type": "object",
        "name": "pirate"
    },
    "card": {
        "def": {},
        "type": "object",
        "name": "card"
    },
    "get_card": {
        "def": {
            "normal": false,
            "senior": false
        },
        "type": "object",
        "name": "get_card"
    },
    "first_buy_gift": {
        "def": 0,
        "type": "number",
        "name": "first_buy_gift"
    },
    "package": {
        "def": {},
        "type": "object",
        "name": "package"
    },
    "guide": {
        "def": 0,
        "type": "number",
        "name": "guide"
    },
    "guide_weak": {
        "def": {
            "laser": false,
            "laserTimes": 3,
            "achieve": false,
            "reward": false,
            "petfish": false,
            "goddess": false,
            "specials": {}
        },
        "type": "object",
        "name": "guide_weak"
    },
    "active": {
        "def": {},
        "type": "object",
        "name": "active"
    },
    "active_daily_reset": {
        "def": {},
        "type": "object",
        "name": "active_daily_reset"
    },
    "active_stat_once": {
        "def": {},
        "type": "object",
        "name": "active_stat_once"
    },
    "active_stat_reset": {
        "def": {},
        "type": "object",
        "name": "active_stat_reset"
    },
    "mail_box": {
        "def": [],
        "type": "object",
        "name": "mail_box"
    },
    "free_draw": {
        "def": {
            "gold": 0,
            "diamond": 1
        },
        "type": "object",
        "name": "free_draw"
    },
    "total_draw": {
        "def": {
            "gold": 0,
            "diamond": 0
        },
        "type": "object",
        "name": "total_draw"
    },
    "roipct_time": {
        "def": 0,
        "type": "number",
        "name": "roipct_time"
    },
    "aquarium": {
        "def": {},
        "type": "object",
        "name": "aquarium"
    },
    "goddess": {
        "def": [{
            "id": 1,
            "level": 1,
            "hp": 100,
            "startWaveIdx": 0,
            "free": 1,
            "ctimes": 0,
            "unlock": [2, 2, 2, 2, 2, 2, 2, 2, 2],
            "interactReward": [0, 0, 0, 0],
            "isPauseAway": false
        }, {
            "id": 2,
            "level": 0,
            "hp": 100,
            "startWaveIdx": 0,
            "free": 1,
            "ctimes": 0,
            "unlock": [0, 0, 0, 0, 0, 0, 0, 0, 0],
            "interactReward": [0, 0, 0, 0],
            "isPauseAway": false
        }, {
            "id": 3,
            "level": 0,
            "hp": 100,
            "startWaveIdx": 0,
            "free": 1,
            "ctimes": 0,
            "unlock": [0, 0, 0, 0, 0, 0, 0, 0, 0],
            "interactReward": [0, 0, 0, 0],
            "isPauseAway": false
        }, {
            "id": 4,
            "level": 0,
            "hp": 200,
            "startWaveIdx": 0,
            "free": 1,
            "ctimes": 0,
            "unlock": [0, 0, 0, 0, 0, 0, 0, 0, 0],
            "interactReward": [0, 0, 0, 0],
            "isPauseAway": false
        }, {
            "id": 5,
            "level": 0,
            "hp": 100,
            "startWaveIdx": 0,
            "free": 1,
            "ctimes": 0,
            "unlock": [0, 0, 0, 0, 0, 0, 0, 0, 0],
            "interactReward": [0, 0, 0, 0],
            "isPauseAway": false
        }],
        "type": "object",
        "name": "goddess"
    },
    "free_goddess": {
        "def": [1, 1, 1, 1, 1],
        "type": "object",
        "name": "free_goddess"
    },
    "goddess_free": {
        "def": 1,
        "type": "number",
        "name": "goddess_free"
    },
    "goddess_ctimes": {
        "def": 0,
        "type": "number",
        "name": "goddess_ctimes"
    },
    "goddess_crossover": {
        "def": 0,
        "type": "number",
        "name": "goddess_crossover"
    },
    "goddess_ongoing": {
        "def": 0,
        "type": "number",
        "name": "goddess_ongoing"
    },
    "figure": {
        "def": 1,
        "type": "number",
        "name": "figure"
    },
    "redress_no": {
        "def": 0,
        "type": "number",
        "name": "redress_no"
    },
    "test": {
        "def": 1,
        "type": "number",
        "name": "test"
    },
    "rank_in_friends": {
        "def": 0,
        "type": "number",
        "name": "rank_in_friends"
    },
    "over_me_friends": {
        "def": [],
        "type": "object",
        "name": "over_me_friends"
    },
    "charm_rank": {
        "def": 0,
        "type": "number",
        "name": "charm_rank"
    },
    "charm_point": {
        "def": 100,
        "type": "number",
        "name": "charm_point"
    },
    //10.23 update
    "sex": {
        "def": 0,
        "type": "number",
        "name": "sex"
    },
    "city": {
        "def": "",
        "type": "string",
        "name": "city"
    },
    "game_friend":{
        "def": [],
        "type": "object",
        "name": "game_friend"
    },
    "playerCatchRate":{
        "def": 1,
        "type": "number",
        "name": "playerCatchRate"
    },
    "recharge":{
        "def": 0,
        "type": "number",
        "name": "recharge"
    },
    "cash":{
        "def": 0,
        "type": "number",
        "name": "cash"
    }

};


exports.ChannelDef = {
  
};


//注意，其他字段来自其他表，参考common的_resultList方法实现
exports.OtherDef = {
    "month_sign": {
        "def": [],
        "type": "object",
        "name": "month_sign"
    },
    "sid": {
        "def": 1,
        "type": "number",
        "name": "sid"
    },
    "match_on": {
        "def": 1,
        "type": "number",
        "name": "match_on"
    },
    "cik_on": {
        "def": 1,
        "type": "number",
        "name": "cik_on"
    },
    "cdkey_on": {
        "def": 0,
        "type": "number",
        "name": "cdkey_on"
    },
    "msgboard_mgmt": {
        "def": 0,
        "type": "number",
        "name": "msgboard_mgmt"
    },
    "max_wave": {
        "def": 0,
        "type": "number",
        "name": "max_wave"
    },
    "goddess_balance_time": {
        "def": '0000-00-00 00:00:00',
        "type": "timestamp",
        "name": "goddess_balance_time"
    },
    "week_reward": {
        "def": 0,
        "type": "number",
        "name": "week_reward"
    },
    "week_rank": {
        "def": 0,
        "type": "number",
        "name": "week_rank"
    },
    "petfish_recent_time": {
        "def": '0000-00-00 00:00:00',
        "type": "timestamp",
        "name": "petfish_recent_time"
    },
    "petfish_total_level": {
        "def": 0,
        "type": "number",
        "name": "petfish_total_level"
    },
    "match_recent_time": {
        "def": '0000-00-00 00:00:00',
        "type": "timestamp",
        "name": "match_recent_time"
    },
    "match_win": {
        "def": 0,
        "type": "number",
        "name": "match_win"
    },
    "match_fail": {
        "def": 0,
        "type": "number",
        "name": "match_fail"
    },
    "match_points": {
        "def": 800,
        "type": "number",
        "name": "match_points"
    },
    "match_rank": {
        "def": 5,
        "type": "number",
        "name": "match_rank"
    },
    "match_unfinish": {
        "def": 0,
        "type": "number",
        "name": "match_unfinish"
    },
    "match_box_list": {
        "def": [0, 0, 0],
        "type": "object",
        "name": "match_box_list"
    },
    "match_box_timestamp": {
        "def": [0, 0, 0],
        "type": "object",
        "name": "match_box_timestamp"
    },
    "match_1st_box": {
        "def": {
            "stat": 1,
            "timestamp": 0,
            "id": 0
        },
        "type": "object",
        "name": "match_1st_box"
    },
    "match_season_count": {
        "def": 0,
        "type": "number",
        "name": "match_season_count"
    },
    "match_season_win": {
        "def": 0,
        "type": "number",
        "name": "match_season_win"
    },
    "match_season_box": {
        "def": 0,
        "type": "number",
        "name": "match_season_box"
    },
    "match_season_1st_win": {
        "def": 0,
        "type": "number",
        "name": "match_season_1st_win"
    },
    "match_got_season_reward": {
        "def": 1,
        "type": "number",
        "name": "match_got_season_reward"
    },
    "match_winning_streak": {
        "def": 0,
        "type": "number",
        "name": "match_winning_streak"
    },
    "gold_total_gain": {
        "def": 0,
        "type": "number",
        "name": "gold_total_gain"
    },
    "gold_total_cost": {
        "def": 0,
        "type": "number",
        "name": "gold_total_cost"
    },
    "gold_shop_count": {
        "def": 0,
        "type": "number",
        "name": "gold_shop_count"
    },
    "gold_shop_amount": {
        "def": 0,
        "type": "number",
        "name": "gold_shop_amount"
    },
    "diamond_total_gain": {
        "def": 0,
        "type": "number",
        "name": "diamond_total_gain"
    },
    "diamond_total_cost": {
        "def": 0,
        "type": "number",
        "name": "diamond_total_cost"
    },
    "diamond_shop_count": {
        "def": 0,
        "type": "number",
        "name": "diamond_shop_count"
    },
    "diamond_shop_amount": {
        "def": 0,
        "type": "number",
        "name": "diamond_shop_amount"
    },
    "has_social": {
        "def": 0,
        "type": "number",
        "name": "has_social"
    },
    "social_invite_friends": {
        "def": [],
        "type": "object",
        "name": "social_invite_friends"
    },
    "social_share_friends": {
        "def": [],
        "type": "object",
        "name": "social_share_friends"
    },
    "social_invite_progress": {
        "def": 0,
        "type": "number",
        "name": "social_invite_progress"
    },
    "social_invite_daily_state": {
        "def": 0,
        "type": "number",
        "name": "social_invite_daily_state"
    },
    "social_invite_reward": {
        "def": 0,
        "type": "number",
        "name": "social_invite_reward"
    },
    "social_share_status_0": {
        "def": {},
        "type": "object",
        "name": "social_share_status_0"
    },
    "social_share_status_1": {
        "def": {},
        "type": "object",
        "name": "social_share_status_1"
    },
    "social_share_status_2": {
        "def": {},
        "type": "object",
        "name": "social_share_status_2"
    },
    "social_enshrine_status": {
        "def": 0,
        "type": "number",
        "name": "social_enshrine_status"
    },
    "social_share_top_gold": {
        "def": 0,
        "type": "number",
        "name": "social_share_top_gold"
    },
    "social_share_top_rank": {
        "def": 0,
        "type": "number",
        "name": "social_share_top_rank"
    },
    "figure_url": {
        "def": "http://p3.wmpic.me/article/2015/05/18/1431913649_GWJqwtVU.jpeg",
        "type": "string",
        "name": "figure_url"
    },
    "new_player": {
        "def": 1,
        "type": "number",
        "name": "new_player"
    },
    "need_insert": {
        "def": 1,
        "type": "number",
        "name": "need_insert"
    },
    "need_update": {
        "def": 1,
        "type": "number",
        "name": "need_update"
    },
    "online_time": {
        "def": 0,
        "type": "number",
        "name": "online_time"
    },
    "vip_fill_this_time": {
        "def": 0,
        "type": "number",
        "name": "vip_fill_this_time"
    },
};

/**
 * 返回指定字段类型和默认值[type, def]
 */
exports.getField = function (field) {
    var af = exports.AccountDef[field];
    af = af || exports.OtherDef[field];
    return af;
};