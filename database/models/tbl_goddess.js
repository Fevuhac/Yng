/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_goddess', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    max_wave: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    updated_at: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    week_reward: {
      type: DataTypes.INTEGER(2),
      allowNull: false,
      defaultValue: '0'
    },
    week_rank: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'tbl_goddess'
  });
};
