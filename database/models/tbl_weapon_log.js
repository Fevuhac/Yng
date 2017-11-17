/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_weapon_log', {
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
    log_at: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    level: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    type: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    level_up: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    nickname: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    vip_weapon_id: {
      type: DataTypes.STRING(64),
      allowNull: true
    }
  }, {
    tableName: 'tbl_weapon_log'
  });
};
