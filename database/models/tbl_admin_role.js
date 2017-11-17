/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_admin_role', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    rname: {
      type: DataTypes.STRING(16),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    auth_ids: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    valid: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1'
    }
  }, {
    tableName: 'tbl_admin_role'
  });
};
