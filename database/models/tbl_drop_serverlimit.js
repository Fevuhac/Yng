/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_drop_serverlimit', {
    key: {
      type: DataTypes.STRING(16),
      allowNull: false,
      primaryKey: true
    },
    limit_type: {
      type: DataTypes.INTEGER(6),
      allowNull: false
    },
    limit_count: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    current_value: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    platform: {
      type: DataTypes.INTEGER(6),
      allowNull: false,
      defaultValue: '1'
    }
  }, {
    tableName: 'tbl_drop_serverlimit'
  });
};
