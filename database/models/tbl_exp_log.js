/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_exp_log', {
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
    added_exp: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    total_exp: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    duration: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'tbl_exp_log'
  });
};
