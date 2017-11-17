/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_daily_statistics', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    account_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    created_at: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    login_count: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    logout_count: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    gold_gain: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    gold_cost: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    gold_shop_count: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    gold_shop_amount: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    pearl_gain: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    pearl_cost: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    pearl_shop_count: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    pearl_shop_amount: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    skill_gain: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    skill_cost: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    account_levelup: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    weapon_levelup_exp: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    weapon_levelup_pearl: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    game_time: {
      type: DataTypes.STRING(256),
      allowNull: true
    }
  }, {
    tableName: 'tbl_daily_statistics'
  });
};
