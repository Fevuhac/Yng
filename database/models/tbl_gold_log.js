/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_gold_log', {
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
    gain: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    cost: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    total: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    duration: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    scene: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    nickname: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    level: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '1'
    }
  }, {
    tableName: 'tbl_gold_log'
  });
};
