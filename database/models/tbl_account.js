/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_account', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    jointype: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    who_invite_me: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: '0'
    },
    who_share_me: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: '0'
    },
    tempname: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    nickname: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    pwd_history: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    vip: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    login_count: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    logout_count: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    created_at: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    last_online_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    salt: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    token: {
      type: DataTypes.STRING(88),
      allowNull: true
    },
    gold: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '1000'
    },
    pearl: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    weapon: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '1'
    },
    skill: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    broke_times: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    first_login: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '1'
    },
    day_reward: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '1'
    },
    day_reward_adv: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    new_reward_adv: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0'
    },
    day_reward_weekly: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    vip_daily_fill: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '1'
    },
    rmb: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    channel: {
      type: DataTypes.STRING(8),
      allowNull: false,
      defaultValue: 'fj'
    },
    channel_account_id: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    platform: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '1'
    },
    vip_weapon_id: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    pfft_at: {
      type: DataTypes.TIME,
      allowNull: true
    },
    channel_account_name: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    channel_account_info: {
      type: DataTypes.STRING(1024),
      allowNull: true
    },
    exp: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    level: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '1'
    },
    level_mission: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      defaultValue: '{}'
    },
    mission_daily_reset: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    mission_only_once: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    first_buy: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    activity_gift: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    heartbeat: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '1'
    },
    heartbeat_min_cost: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    achieve_point: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    gold_shopping: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    weapon_skin: {
      type: DataTypes.STRING(128),
      allowNull: false,
      defaultValue: '{\"own\":[1],\"equip\":1}'
    },
    bonus: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    drop_reset: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    drop_once: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    comeback: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    vip_gift: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    weapon_energy: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pirate: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    card: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    get_card: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '{\"normal\":false,\"senior\":false}'
    },
    first_buy_gift: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    package: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    guide: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    guide_weak: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    active: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    active_daily_reset: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    active_stat_once: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    active_stat_reset: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    mail_box: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    free_draw: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    total_draw: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    roipct_time: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: '0'
    },
    aquarium: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    goddess: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    free_goddess: {
      type: DataTypes.STRING(11),
      allowNull: false,
      defaultValue: '[1,1,1,1,1]'
    },
    goddess_free: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '1'
    },
    goddess_ctimes: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    goddess_crossover: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    goddess_ongoing: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    figure: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: '1'
    },
    redress_no: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    test: {
      type: DataTypes.INTEGER(2),
      allowNull: false,
      defaultValue: '0'
    },
    rank_in_friends: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    over_me_friends: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    charm_rank: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    charm_point: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    sex: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    city: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '四川'
    }
  }, {
    tableName: 'tbl_account'
  });
};
