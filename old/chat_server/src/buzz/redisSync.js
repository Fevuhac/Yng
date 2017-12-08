const RedisUtil = require('../utils/RedisUtil');
const utils = require('../utils/utils');
const account_def = require('../dao/account/account_def');
var allFields = [];

var DEBUG = 0;
var TAG = "【redisSync】";

for (let key in account_def.AccountDef) {
    allFields.push(key)
}

for (let key in account_def.OtherDef) {
    allFields.push(key)
}

class RedisSync {
    constructor(id) {
        this.__update = [];
        this.__id = id;
    }

    /**
     * 解析redis数据
     * @param key
     * @param val
     * @returns {null}
     */
    parseValue(key, value) {
        let serialVal = null;
        let typeInfo = account_def.getField(key);
        if (!typeInfo) {
            console.log('parseValue,非法字段，请检查字段名是否正确', __filename, key)
            return null;
        }

        switch (typeInfo.type) {
            case 'number': {
                if (value == null) {
                    serialVal = typeInfo.def;
                }
                else {
                    serialVal = Number(value);
                }
            }
                break;
            case 'string':
            case 'timestamp': {
                if (value == null) {
                    serialVal = typeInfo.def;
                }
                else {
                    serialVal = value;
                }
            }
                break;
            case 'object': {
                if (value == null) {
                    serialVal = typeInfo.def;
                }
                else {
                    try {
                        serialVal = JSON.parse(value);
                    } catch (error) {
                        console.log("---can not JSON.parse ", key, value);
                    }
                }
            }
                break;
            default:
                break;
        }

        this[`_${key}`] = serialVal;
    }

    toJSON() {
        let jsonData = {};
        for (let key in this) {
            if (typeof this[key] !== 'function' && key.indexOf('__') !== 0) {
                jsonData[key.replace(/_/, '')] = this[key];
            }
        }
        return jsonData;
    }

    /**
     * 构建redis数据
     * @param key
     * @param val
     */
    static buildValue(key, value) {
        let serialVal = null;
        let typeInfo = account_def.getField(key);
        if (!typeInfo) {
            console.log('buildValue,非法字段，请检查字段名是否正确', __filename, key)
            return '';
        }
        switch (typeInfo.type) {
            case 'number': {
                if (value == null) {
                    serialVal = typeInfo.def;
                }
                else {


                    serialVal = value.toString();

                    if (key === "figure" && serialVal.search('http://p3.wmpic.me/article') != -1) {
                        serialVal = "1";
                    }
                }
            }
                break;
            case 'string':
            case 'timestamp': {
                if ('roipct_time' === key) {
                    console.log(key);
                }
                if (value == null) {
                    serialVal = typeInfo.def;
                }
                else {
                    serialVal = value;
                }
            }
                break;
            case 'object': {
                if (value == null) {
                    serialVal = JSON.stringify(typeInfo.def);
                }
                else {
                    serialVal = JSON.stringify(value);
                }
            }
                break;
            default:
                break;
        }

        return serialVal || '';
    }

    static getCmd(key) {
        let typeInfo = account_def.getField(key);
        let cmd = 'HSET';
        if (typeInfo.inc === true) {
            cmd = 'HINCRBY'
        }
        return cmd;
    }

    static bIncr(key) {
        let typeInfo = account_def.getField(key);
        if (typeInfo) {
            return typeInfo.inc;
        }
        return false;
    }

    _modify(key, value) {
        if (RedisSync.bIncr(key)) {
            this[`_${key}`] += value;
        }
        else {
            this[`_${key}`] = value;
        }
        this.__update.push([key, value]);
    }

    _value(key) {
        return this[`_${key}`];
    }

    commit(cb) {
        let fields = this.__update;

        if (fields.length === 0) return;


        var cmds = [];

        fields.forEach(function (key) {
            cmds.push([RedisSync.getCmd(key[0]), `pair:uid:${key[0]}`, this.__id, RedisSync.buildValue(key[0], key[1])]);
            if (key[0] == 'gold') {
                console.log('-----------------金币变化------', cmds);
            }
        }.bind(this));

        this.__update = [];

        RedisUtil.multi(cmds, function (err, result) {
            if (!!err) {
                utils.invokeCallback(cb, err);
                return;
            }
            utils.invokeCallback(cb, null, result);
        });
    }

    get id() {
        return this.__id;
    }

    set who_share_me(value) {
        this._modify(account_def.AccountDef.who_share_me.name, value);
    }

    get who_share_me() {
        return this._value(account_def.AccountDef.who_share_me.name);
    }

    set tempname(value) {
        this._modify(account_def.AccountDef.tempname.name, value);
    }

    get tempname() {
        return this._value(account_def.AccountDef.tempname.name);
    }

    set password(value) {
        this._modify(account_def.AccountDef.password.name, value);
    }

    get password() {
        return this._value(account_def.AccountDef.password.name);
    }

    set pwd_history(value) {
        this._modify(account_def.AccountDef.pwd_history.name, value);
    }

    get pwd_history() {
        return this._value(account_def.AccountDef.pwd_history.name);
    }

    set vip(value) {
        this._modify(account_def.AccountDef.vip.name, value);
    }

    get vip() {
        return this._value(account_def.AccountDef.vip.name);
    }

    set login_count(value) {
        this._modify(account_def.AccountDef.login_count.name, value);
    }

    get login_count() {
        return this._value(account_def.AccountDef.login_count.name);
    }

    set logout_count(value) {
        this._modify(account_def.AccountDef.logout_count.name, value);
    }

    get logout_count() {
        return this._value(account_def.AccountDef.logout_count.name);
    }

    set created_at(value) {
        this._modify(account_def.AccountDef.created_at.name, value);
    }

    get created_at() {
        return this._value(account_def.AccountDef.created_at.name);
    }

    set updated_at(value) {
        this._modify(account_def.AccountDef.updated_at.name, value);
    }

    get updated_at() {
        return this._value(account_def.AccountDef.updated_at.name);
    }

    set last_online_time(value) {
        this._modify(account_def.AccountDef.last_online_time.name, value);
    }

    get last_online_time() {
        return this._value(account_def.AccountDef.last_online_time.name);
    }

    set nickname(value) {
        this._modify(account_def.AccountDef.nickname.name, value);
    }

    get nickname() {
        return this._value(account_def.AccountDef.nickname.name);
    }

    set salt(value) {
        this._modify(account_def.AccountDef.salt.name, value);
    }

    get salt() {
        return this._value(account_def.AccountDef.salt.name);
    }

    set gold(value) {
        let sub = this._gold + value;
        if (sub < 0) {
            this._gold = 0;
            value = value + Math.abs(sub);
        }
        this._modify(account_def.AccountDef.gold.name, value);
    }

    get gold() {
        return this._value(account_def.AccountDef.gold.name);
    }

    set pearl(value) {
        this._modify(account_def.AccountDef.pearl.name, value);
    }

    get pearl() {
        return this._value(account_def.AccountDef.pearl.name);
    }

    set weapon(value) {
        this._modify(account_def.AccountDef.weapon.name, value);
    }

    get weapon() {
        return this._value(account_def.AccountDef.weapon.name);
    }

    set skill(value) {
        this._modify(account_def.AccountDef.skill.name, value);
    }

    get skill() {
        return this._value(account_def.AccountDef.skill.name);
    }

    set broke_times(value) {
        this._modify(account_def.AccountDef.broke_times.name, value);
    }

    get broke_times() {
        return this._value(account_def.AccountDef.broke_times.name);
    }

    set first_login(value) {
        this._modify(account_def.AccountDef.first_login.name, value);
    }

    get first_login() {
        return this._value(account_def.AccountDef.first_login.name);
    }

    set day_reward(value) {
        this._modify(account_def.AccountDef.day_reward.name, value);
    }

    get day_reward() {
        return this._value(account_def.AccountDef.day_reward.name);
    }

    set day_reward_adv(value) {
        this._modify(account_def.AccountDef.day_reward_adv.name, value);
    }

    get day_reward_adv() {
        return this._value(account_def.AccountDef.day_reward_adv.name);
    }

    set new_reward_adv(value) {
        this._modify(account_def.AccountDef.new_reward_adv.name, value);
    }

    get new_reward_adv() {
        return this._value(account_def.AccountDef.new_reward_adv.name);
    }

    set day_reward_weekly(value) {
        this._modify(account_def.AccountDef.day_reward_weekly.name, value);
    }

    get day_reward_weekly() {
        return this._value(account_def.AccountDef.day_reward_weekly.name);
    }

    set vip_daily_fill(value) {
        this._modify(account_def.AccountDef.vip_daily_fill.name, value);
    }

    get vip_daily_fill() {
        return this._value(account_def.AccountDef.vip_daily_fill.name);
    }

    set rmb(value) {
        this._modify(account_def.AccountDef.rmb.name, value);
    }

    get rmb() {
        return this._value(account_def.AccountDef.rmb.name);
    }

    set channel(value) {
        this._modify(account_def.AccountDef.channel.name, value);
    }

    get channel() {
        return this._value(account_def.AccountDef.channel.name);
    }

    set channel_account_id(value) {
        this._modify(account_def.AccountDef.channel_account_id.name, value);
    }

    get channel_account_id() {
        return this._value(account_def.AccountDef.channel_account_id.name);
    }

    set platform(value) {
        this._modify(account_def.AccountDef.platform.name, value);
    }

    get platform() {
        return this._value(account_def.AccountDef.platform.name);
    }

    set vip_weapon_id(value) {
        this._modify(account_def.AccountDef.vip_weapon_id.name, value);
    }

    get vip_weapon_id() {
        return this._value(account_def.AccountDef.vip_weapon_id.name);
    }

    set pfft_at(value) {
        this._modify(account_def.AccountDef.pfft_at.name, value);
    }

    get pfft_at() {
        return this._value(account_def.AccountDef.pfft_at.name);
    }

    set channel_account_name(value) {
        this._modify(account_def.AccountDef.channel_account_name.name, value);
    }

    get channel_account_name() {
        return this._value(account_def.AccountDef.channel_account_name.name);
    }

    set channel_account_info(value) {
        this._modify(account_def.AccountDef.channel_account_info.name, value);
    }

    get channel_account_info() {
        return this._value(account_def.AccountDef.channel_account_info.name);
    }

    set exp(value) {
        this._modify(account_def.AccountDef.exp.name, value);
    }

    get exp() {
        return this._value(account_def.AccountDef.exp.name);
    }

    set level(value) {
        this._modify(account_def.AccountDef.level.name, value);
    }

    get level() {
        return this._value(account_def.AccountDef.level.name);
    }

    set level_mission(value) {
        this._modify(account_def.AccountDef.level_mission.name, value);
    }

    get level_mission() {
        return this._value(account_def.AccountDef.level_mission.name);
    }

    set mission_daily_reset(value) {
        this._modify(account_def.AccountDef.mission_daily_reset.name, value);
    }

    get mission_daily_reset() {
        return this._value(account_def.AccountDef.mission_daily_reset.name);
    }

    set mission_only_once(value) {
        this._modify(account_def.AccountDef.mission_only_once.name, value);
    }

    get mission_only_once() {
        return this._value(account_def.AccountDef.mission_only_once.name);
    }

    set first_buy(value) {
        this._modify(account_def.AccountDef.first_buy.name, value);
    }

    get first_buy() {
        return this._value(account_def.AccountDef.first_buy.name);
    }

    set activity_gift(value) {
        this._modify(account_def.AccountDef.activity_gift.name, value);
    }

    get activity_gift() {
        return this._value(account_def.AccountDef.activity_gift.name);
    }

    set heartbeat(value) {
        this._modify(account_def.AccountDef.heartbeat.name, value);
    }

    get heartbeat() {
        return this._value(account_def.AccountDef.heartbeat.name);
    }

    set heartbeat_min_cost(value) {
        this._modify(account_def.AccountDef.heartbeat_min_cost.name, value);
    }

    get heartbeat_min_cost() {
        return this._value(account_def.AccountDef.heartbeat_min_cost.name);
    }

    set achieve_point(value) {
        this._modify(account_def.AccountDef.achieve_point.name, value);
    }

    get achieve_point() {
        return this._value(account_def.AccountDef.achieve_point.name);
    }

    set gold_shopping(value) {
        this._modify(account_def.AccountDef.gold_shopping.name, value);
    }

    get gold_shopping() {
        return this._value(account_def.AccountDef.gold_shopping.name);
    }

    set weapon_skin(value) {
        this._modify(account_def.AccountDef.weapon_skin.name, value);
    }

    get weapon_skin() {
        return this._value(account_def.AccountDef.weapon_skin.name);
    }

    set bonus(value) {
        this._modify(account_def.AccountDef.bonus.name, value);
    }

    get bonus() {
        return this._value(account_def.AccountDef.bonus.name);
    }

    set drop_reset(value) {
        this._modify(account_def.AccountDef.drop_reset.name, value);
    }

    get drop_reset() {
        return this._value(account_def.AccountDef.drop_reset.name);
    }

    set drop_once(value) {
        this._modify(account_def.AccountDef.drop_once.name, value);
    }

    get drop_once() {
        return this._value(account_def.AccountDef.drop_once.name);
    }

    set comeback(value) {
        this._modify(account_def.AccountDef.comeback.name, value);
    }

    get comeback() {
        return this._value(account_def.AccountDef.comeback.name);
    }

    set vip_gift(value) {
        this._modify(account_def.AccountDef.vip_gift.name, value);
    }

    get vip_gift() {
        return this._value(account_def.AccountDef.vip_gift.name);
    }

    set weapon_energy(value) {
        this._modify(account_def.AccountDef.weapon_energy.name, value);
    }

    get weapon_energy() {
        return this._value(account_def.AccountDef.weapon_energy.name);
    }

    set pirate(value) {
        this._modify(account_def.AccountDef.pirate.name, value);
    }

    get pirate() {
        return this._value(account_def.AccountDef.pirate.name);
    }

    set card(value) {
        this._modify(account_def.AccountDef.card.name, value);
    }

    get card() {
        return this._value(account_def.AccountDef.card.name);
    }

    set get_card(value) {
        this._modify(account_def.AccountDef.get_card.name, value);
    }

    get get_card() {
        return this._value(account_def.AccountDef.get_card.name);
    }

    set first_buy_gift(value) {
        this._modify(account_def.AccountDef.first_buy_gift.name, value);
    }

    get first_buy_gift() {
        return this._value(account_def.AccountDef.first_buy_gift.name);
    }

    set package(value) {
        this._modify(account_def.AccountDef.package.name, value);
    }

    get package() {
        return this._value(account_def.AccountDef.package.name);
    }

    set guide(value) {
        this._modify(account_def.AccountDef.guide.name, value);
    }

    get guide() {
        return this._value(account_def.AccountDef.guide.name);
    }

    set guide_weak(value) {
        this._modify(account_def.AccountDef.guide_weak.name, value);
    }

    get guide_weak() {
        return this._value(account_def.AccountDef.guide_weak.name);
    }

    set active(value) {
        this._modify(account_def.AccountDef.active.name, value);
    }

    get active() {
        return this._value(account_def.AccountDef.active.name);
    }

    set active_daily_reset(value) {
        this._modify(account_def.AccountDef.active_daily_reset.name, value);
    }

    get active_daily_reset() {
        return this._value(account_def.AccountDef.active_daily_reset.name);
    }

    set active_stat_once(value) {
        this._modify(account_def.AccountDef.active_stat_once.name, value);
    }

    get active_stat_once() {
        return this._value(account_def.AccountDef.active_stat_once.name);
    }

    set active_stat_reset(value) {
        this._modify(account_def.AccountDef.active_stat_reset.name, value);
    }

    get active_stat_reset() {
        return this._value(account_def.AccountDef.active_stat_reset.name);
    }

    set mail_box(value) {
        this._modify(account_def.AccountDef.mail_box.name, value);
    }

    get mail_box() {
        return this._value(account_def.AccountDef.mail_box.name);
    }

    set free_draw(value) {
        this._modify(account_def.AccountDef.free_draw.name, value);
    }

    get free_draw() {
        return this._value(account_def.AccountDef.free_draw.name);
    }

    set total_draw(value) {
        this._modify(account_def.AccountDef.total_draw.name, value);
    }

    get total_draw() {
        return this._value(account_def.AccountDef.total_draw.name);
    }

    set roipct_time(value) {
        this._modify(account_def.AccountDef.roipct_time.name, value);
    }

    get roipct_time() {
        return this._value(account_def.AccountDef.roipct_time.name);
    }

    set aquarium(value) {
        this._modify(account_def.AccountDef.aquarium.name, value);
    }

    get aquarium() {
        return this._value(account_def.AccountDef.aquarium.name);
    }

    set goddess(value) {
        this._modify(account_def.AccountDef.goddess.name, value);
    }

    get goddess() {
        return this._value(account_def.AccountDef.goddess.name);
    }

    set free_goddess(value) {
        this._modify(account_def.AccountDef.free_goddess.name, value);
    }

    get free_goddess() {
        return this._value(account_def.AccountDef.free_goddess.name);
    }

    set goddess_free(value) {
        this._modify(account_def.AccountDef.goddess_free.name, value);
    }

    get goddess_free() {
        return this._value(account_def.AccountDef.goddess_free.name);
    }

    set goddess_ctimes(value) {
        this._modify(account_def.AccountDef.goddess_ctimes.name, value);
    }

    get goddess_ctimes() {
        return this._value(account_def.AccountDef.goddess_ctimes.name);
    }

    set goddess_crossover(value) {
        this._modify(account_def.AccountDef.goddess_crossover.name, value);
    }

    get goddess_crossover() {
        return this._value(account_def.AccountDef.goddess_crossover.name);
    }

    set goddess_ongoing(value) {
        this._modify(account_def.AccountDef.goddess_ongoing.name, value);
    }

    get goddess_ongoing() {
        return this._value(account_def.AccountDef.goddess_ongoing.name);
    }

    set figure(value) {
        this._modify(account_def.AccountDef.figure.name, value);
    }

    get figure() {
        return this._value(account_def.AccountDef.figure.name);
    }

    set redress_no(value) {
        this._modify(account_def.AccountDef.redress_no.name, value);
    }

    get redress_no() {
        return this._value(account_def.AccountDef.redress_no.name);
    }

    set test(value) {
        this._modify(account_def.AccountDef.test.name, value);
    }

    get test() {
        return this._value(account_def.AccountDef.test.name);
    }

    set rank_in_friends(value) {
        this._modify(account_def.AccountDef.rank_in_friends.name, value);
    }

    get rank_in_friends() {
        return this._value(account_def.AccountDef.rank_in_friends.name);
    }

    set over_me_friends(value) {
        this._modify(account_def.AccountDef.over_me_friends.name, value);
    }

    get over_me_friends() {
        return this._value(account_def.AccountDef.over_me_friends.name);
    }

    set charm_rank(value) {
        this._modify(account_def.AccountDef.charm_rank.name, value);
    }

    get charm_rank() {
        return this._value(account_def.AccountDef.charm_rank.name);
    }

    set charm_point(value) {
        this._modify(account_def.AccountDef.charm_point.name, value);
    }

    get charm_point() {
        return this._value(account_def.AccountDef.charm_point.name);
    }

    set month_sign(value) {
        this._modify(account_def.OtherDef.month_sign.name, value);
    }

    get month_sign() {
        return this._value(account_def.OtherDef.month_sign.name);
    }

    set sid(value) {
        this._modify(account_def.OtherDef.sid.name, value);
    }

    get sid() {
        return this._value(account_def.OtherDef.sid.name);
    }

    set match_on(value) {
        this._modify(account_def.OtherDef.match_on.name, value);
    }

    get match_on() {
        return this._value(account_def.OtherDef.match_on.name);
    }

    set cik_on(value) {
        this._modify(account_def.OtherDef.cik_on.name, value);
    }

    get cik_on() {
        return this._value(account_def.OtherDef.cik_on.name);
    }

    set cdkey_on(value) {
        this._modify(account_def.OtherDef.cdkey_on.name, value);
    }

    get cdkey_on() {
        return this._value(account_def.OtherDef.cdkey_on.name);
    }

    set msgboard_mgmt(value) {
        this._modify(account_def.OtherDef.msgboard_mgmt.name, value);
    }

    get msgboard_mgmt() {
        return this._value(account_def.OtherDef.msgboard_mgmt.name);
    }

    set max_wave(value) {
        this._modify(account_def.OtherDef.max_wave.name, value);
    }

    get max_wave() {
        return this._value(account_def.OtherDef.max_wave.name);
    }

    set jointype(value) {
        this._modify(account_def.AccountDef.jointype.name, value);
    }

    get jointype() {
        return this._value(account_def.AccountDef.jointype.name);
    }

    set goddess_balance_time(value) {
        this._modify(account_def.OtherDef.goddess_balance_time.name, value);
    }

    get goddess_balance_time() {
        return this._value(account_def.OtherDef.goddess_balance_time.name);
    }

    set week_reward(value) {
        this._modify(account_def.OtherDef.week_reward.name, value);
    }

    get week_reward() {
        return this._value(account_def.OtherDef.week_reward.name);
    }

    set week_rank(value) {
        this._modify(account_def.OtherDef.week_rank.name, value);
    }

    get week_rank() {
        return this._value(account_def.OtherDef.week_rank.name);
    }

    set petfish_recent_time(value) {
        this._modify(account_def.OtherDef.petfish_recent_time.name, value);
    }

    get petfish_recent_time() {
        return this._value(account_def.OtherDef.petfish_recent_time.name);
    }

    set match_recent_time(value) {
        this._modify(account_def.OtherDef.match_recent_time.name, value);
    }

    get match_recent_time() {
        return this._value(account_def.OtherDef.match_recent_time.name);
    }

    set petfish_total_level(value) {
        this._modify(account_def.OtherDef.petfish_total_level.name, value);
    }

    get petfish_total_level() {
        return this._value(account_def.OtherDef.petfish_total_level.name);
    }

    set match_win(value) {
        this._modify(account_def.OtherDef.match_win.name, value);
    }

    get match_win() {
        return this._value(account_def.OtherDef.match_win.name);
    }

    set match_fail(value) {
        this._modify(account_def.OtherDef.match_fail.name, value);
    }

    get match_fail() {
        return this._value(account_def.OtherDef.match_fail.name);
    }

    set match_points(value) {
        this._modify(account_def.OtherDef.match_points.name, value);
    }

    get match_points() {
        return this._value(account_def.OtherDef.match_points.name);
    }

    set match_rank(value) {
        this._modify(account_def.OtherDef.match_rank.name, value);
    }

    get match_rank() {
        return this._value(account_def.OtherDef.match_rank.name);
    }

    set match_unfinish(value) {
        this._modify(account_def.OtherDef.match_unfinish.name, value);
    }

    get match_unfinish() {
        return this._value(account_def.OtherDef.match_unfinish.name);
    }

    set match_box_list(value) {
        this._modify(account_def.OtherDef.match_box_list.name, value);
    }

    get match_box_list() {
        return this._value(account_def.OtherDef.match_box_list.name);
    }

    set match_box_timestamp(value) {
        this._modify(account_def.OtherDef.match_box_timestamp.name, value);
    }

    get match_box_timestamp() {
        return this._value(account_def.OtherDef.match_box_timestamp.name);
    }

    set match_1st_box(value) {
        this._modify(account_def.OtherDef.match_1st_box.name, value);
    }

    get match_1st_box() {
        return this._value(account_def.OtherDef.match_1st_box.name);
    }

    set match_season_count(value) {
        this._modify(account_def.OtherDef.match_season_count.name, value);
    }

    get match_season_count() {
        return this._value(account_def.OtherDef.match_season_count.name);
    }

    set match_season_win(value) {
        this._modify(account_def.OtherDef.match_season_win.name, value);
    }

    get match_season_win() {
        return this._value(account_def.OtherDef.match_season_win.name);
    }

    set match_season_box(value) {
        this._modify(account_def.OtherDef.match_season_box.name, value);
    }

    get match_season_box() {
        return this._value(account_def.OtherDef.match_season_box.name);
    }

    set match_season_1st_win(value) {
        this._modify(account_def.OtherDef.match_season_1st_win.name, value);
    }

    get match_season_1st_win() {
        return this._value(account_def.OtherDef.match_season_1st_win.name);
    }

    set match_got_season_reward(value) {
        this._modify(account_def.OtherDef.match_got_season_reward.name, value);
    }

    get match_got_season_reward() {
        return this._value(account_def.OtherDef.match_got_season_reward.name);
    }

    set gold_total_gain(value) {
        this._modify(account_def.OtherDef.gold_total_gain.name, value);
    }

    get gold_total_gain() {
        return this._value(account_def.OtherDef.gold_total_gain.name);
    }

    set match_winning_streak(value) {
        this._modify(account_def.OtherDef.match_winning_streak.name, value);
    }

    get match_winning_streak() {
        return this._value(account_def.OtherDef.match_winning_streak.name);
    }

    set gold_shop_count(value) {
        this._modify(account_def.OtherDef.gold_shop_count.name, value);
    }

    get gold_shop_count() {
        return this._value(account_def.OtherDef.gold_shop_count.name);
    }

    set gold_shop_amount(value) {
        this._modify(account_def.OtherDef.gold_shop_amount.name, value);
    }

    get gold_shop_amount() {
        return this._value(account_def.OtherDef.gold_shop_amount.name);
    }

    set diamond_total_gain(value) {
        this._modify(account_def.OtherDef.diamond_total_gain.name, value);
    }

    get diamond_total_gain() {
        return this._value(account_def.OtherDef.diamond_total_gain.name);
    }

    set gold_total_cost(value) {
        this._modify(account_def.OtherDef.gold_total_cost.name, value);
    }

    get gold_total_cost() {
        return this._value(account_def.OtherDef.gold_total_cost.name);
    }

    set diamond_total_cost(value) {
        this._modify(account_def.OtherDef.diamond_total_cost.name, value);
    }

    get diamond_total_cost() {
        return this._value(account_def.OtherDef.diamond_total_cost.name);
    }

    set diamond_shop_amount(value) {
        this._modify(account_def.OtherDef.diamond_shop_amount.name, value);
    }

    get diamond_shop_amount() {
        return this._value(account_def.OtherDef.diamond_shop_amount.name);
    }

    set diamond_shop_count(value) {
        this._modify(account_def.OtherDef.diamond_shop_count.name, value);
    }

    get diamond_shop_count() {
        return this._value(account_def.OtherDef.diamond_shop_count.name);
    }

    set has_social(value) {
        this._modify(account_def.OtherDef.has_social.name, value);
    }

    get has_social() {
        return this._value(account_def.OtherDef.has_social.name);
    }

    set social_invite_friends(value) {
        this._modify(account_def.OtherDef.social_invite_friends.name, value);
    }

    get social_invite_friends() {
        return this._value(account_def.OtherDef.social_invite_friends.name);
    }

    set social_share_friends(value) {
        this._modify(account_def.OtherDef.social_share_friends.name, value);
    }

    get social_share_friends() {
        return this._value(account_def.OtherDef.social_share_friends.name);
    }

    set social_invite_progress(value) {
        this._modify(account_def.OtherDef.social_invite_progress.name, value);
    }

    get social_invite_progress() {
        return this._value(account_def.OtherDef.social_invite_progress.name);
    }

    set social_invite_reward(value) {
        this._modify(account_def.OtherDef.social_invite_reward.name, value);
    }

    get social_invite_reward() {
        return this._value(account_def.OtherDef.social_invite_reward.name);
    }

    set social_share_status_0(value) {
        this._modify(account_def.OtherDef.social_share_status_0.name, value);
    }

    get social_share_status_0() {
        return this._value(account_def.OtherDef.social_share_status_0.name);
    }

    set social_share_status_1(value) {
        this._modify(account_def.OtherDef.social_share_status_1.name, value);
    }

    get social_share_status_1() {
        return this._value(account_def.OtherDef.social_share_status_1.name);
    }

    set social_share_status_2(value) {
        this._modify(account_def.OtherDef.social_share_status_2.name, value);
    }

    get social_share_status_2() {
        return this._value(account_def.OtherDef.social_share_status_2.name);
    }

    set social_enshrine_status(value) {
        this._modify(account_def.OtherDef.social_enshrine_status.name, value);
    }

    get social_enshrine_status() {
        return this._value(account_def.OtherDef.social_enshrine_status.name);
    }

    set social_share_top_gold(value) {
        this._modify(account_def.OtherDef.social_share_top_gold.name, value);
    }

    get social_share_top_gold() {
        return this._value(account_def.OtherDef.social_share_top_gold.name);
    }

    set social_share_top_rank(value) {
        this._modify(account_def.OtherDef.social_share_top_rank.name, value);
    }

    get social_share_top_rank() {
        return this._value(account_def.OtherDef.social_share_top_rank.name);
    }

    set figure_url(value) {
        this._modify(account_def.OtherDef.figure_url.name, value);
    }

    get figure_url() {
        return this._value(account_def.OtherDef.figure_url.name);
    }

    set new_player(value) {
        this._modify(account_def.OtherDef.new_player.name, value);
    }

    get new_player() {
        return this._value(account_def.OtherDef.new_player.name);
    }

    set need_insert(value) {
        this._modify(account_def.OtherDef.need_insert.name, value);
    }

    get need_insert() {
        return this._value(account_def.OtherDef.need_insert.name);
    }

    set need_update(value) {
        this._modify(account_def.OtherDef.need_update.name, value);
    }

    get need_update() {
        return this._value(account_def.OtherDef.need_update.name);
    }

    set online_time(value) {
        this._modify(account_def.OtherDef.online_time.name, value);
    }

    get online_time() {
        return this._value(account_def.OtherDef.online_time.name);
    }

    set vip_fill_this_time(value) {
        this._modify(account_def.OtherDef.vip_fill_this_time.name, value);
    }

    get vip_fill_this_time() {
        return this._value(account_def.OtherDef.vip_fill_this_time.name);
    }

    set token(value) {
        this._modify(account_def.AccountDef.token.name, value);
    }

    get token() {
        return this._value(account_def.AccountDef.token.name);
    }

    set who_invite_me(value) {
        this._modify(account_def.AccountDef.who_invite_me.name, value);
    }

    get who_invite_me() {
        return this._value(account_def.AccountDef.who_invite_me.name);
    }

    set social_invite_daily_state(value) {
        this._modify(account_def.OtherDef.social_invite_daily_state.name, value);
    }

    get social_invite_daily_state() {
        return this._value(account_def.OtherDef.social_invite_daily_state.name);
    }

    get city() {
        return this._value(account_def.AccountDef.city.name);
    }

    set city(value) {
        this._modify(account_def.AccountDef.city.name, value);
    }

}

/**
 * 设置用户信息到redis
 * @param id
 * @param data 支持[{key:value},{key:value}]和{key1:value1,key2:value2}两种数据格式
 * @param cb
 */
function setAccountById(id, data, cb) {

    if (!id || !data) {
        utils.invokeCallback(cb, '参数错误');
        return;
    }

    let fields = [];
    if (data instanceof Array) {
        fields = data;
    }
    else {
        for (let key in data) {
            let item = {};
            item[key] = data[key];
            fields.push(item);
        }
    }
    if (fields.length > 1) {
        var cmds = [];

        fields.forEach(function (item) {
            for (let key in item) {
                cmds.push(['hset', `pair:uid:${key}`, id, RedisSync.buildValue(key, item[key])])
            }
        });

        //console.log(cmds)

        RedisUtil.multi(cmds, function (err, result) {
            if (!!err) {
                utils.invokeCallback(cb, err);
                return;
            }
            // console.log('setAccountById multi docs result:', result);
            utils.invokeCallback(cb, null, result);
        });
    }
    else {
        for (let key in fields[0]) {

            RedisUtil.hset(`pair:uid:${key}`, id, RedisSync.buildValue(key, fields[0][key]), function (err, result) {
                if (!!err) {
                    utils.invokeCallback(cb, err);
                    return;
                }
                utils.invokeCallback(cb, null, result);
            });
        }
    }
}

/**
 * 从redis缓存中获取用户数据
 * @param id
 * @param fields
 * @param cb
 */
function getAccountById(id, fields, cb) {
    const FUNC = TAG + "getAccountById() --- ";
    if (!id) {
        utils.invokeCallback(cb, '参数错误');
        return;
    }

    var allField = false;
    if (typeof(fields) === 'function') {
        cb = fields;
        allField = true;
    }

    _exist(id, function (err) {
        if (err) {
            console.error(FUNC + "_exist----err:", err);
            utils.invokeCallback(cb, null, null);
            return;
        }

        if (allField || !!fields && fields.length > 1) {
            var cmds = [];
            var _fileds = null;
            if (allField) {
                _fileds = allFields;
            }
            else {
                _fileds = fields;
            }
            _fileds.forEach(function (item) {
                cmds.push(['hget', `pair:uid:${item}`, id])
            });

            //console.log(cmds)

            RedisUtil.multi(cmds, function (err, docs) {
                if (!!err) {
                    utils.invokeCallback(cb, err);
                    return;
                }
                //docs 数据格式: [null,null,null]
                // console.log('getAccountById multi docs:', docs);
                var account = new RedisSync(id);
                for (var i = 0; i < _fileds.length; ++i) {
                    if (_fileds[i] == account_def.AccountDef.platform.name) {
                        if (!docs[i]) {
                            console.log("redis中没有用户信息");
                            utils.invokeCallback(cb, null, null);
                            return;
                        }
                    }
                    account.parseValue(_fileds[i], docs[i]);
                }

                utils.invokeCallback(cb, null, account);
            });
        }
        else {
            RedisUtil.hget(`pair:uid:${fields[0]}`, id, function (err, doc) {
                if (!!err) {
                    utils.invokeCallback(cb, err);
                    return;
                }

                if (DEBUG) console.log('single:', fields[0], '=', doc);

                var account = new RedisSync(id);
                account.parseValue(fields[0], doc);
                utils.invokeCallback(cb, null, account);
            });
        }
    });
}

function getUIDs(cb) {

    //todo 不用hkeys这个方法
    RedisUtil.hkeys(`pair:uid:${account_def.AccountDef.platform.name}`, function (err, docs) {
        utils.invokeCallback(cb, err, docs);
    })
}

function delAccount(uid, cb) {
    let cmds = [];
    allFields.forEach(function (item) {
        cmds.push(['hdel', `pair:uid:${item}`, uid])
    });

    RedisUtil.multi(cmds, function (err, docs) {
        if (!!err) {
            utils.invokeCallback(cb, err);
            return;
        }

        utils.invokeCallback(cb, null);
    });
}

/**
 * 判断用户是否存在于redis中
 * @param uid
 * @param cb
 * @private
 */
function _exist(uid, cb) {
    RedisUtil.hget(`pair:uid:platform`, uid, function (err, result) {
        if (!!err) {
            utils.invokeCallback(cb, err);
            return;
        }

        if (!result) {
            utils.invokeCallback(cb, '用户不存在');
            return;
        }

        utils.invokeCallback(cb, null);
    });
}


module.exports.getAccountById = getAccountById;
module.exports.setAccountById = setAccountById;
module.exports.getUIDs = getUIDs;
module.exports.delAccount = delAccount;
module.exports.RedisSync = RedisSync;