/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_admin_user', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    uname: {
      type: DataTypes.STRING(16),
      allowNull: false
    },
    salt: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    created_at: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: '0000-00-00 00:00:00'
    },
    role: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    valid: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    }
  }, {
    tableName: 'tbl_admin_user'
  });
};
