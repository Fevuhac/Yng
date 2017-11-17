/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_admin_auth', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    page: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    parent: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    level: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    valid: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1'
    }
  }, {
    tableName: 'tbl_admin_auth'
  });
};
