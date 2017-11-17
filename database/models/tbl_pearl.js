/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_pearl', {
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
    current_total: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '10'
    },
    total_gain: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    total_cost: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    shop_count: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    shop_amount: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'tbl_pearl'
  });
};
