/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_skill_log', {
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
    skill_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    gain: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    cost: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    total: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    log_at: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    nickname: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'tbl_skill_log'
  });
};
