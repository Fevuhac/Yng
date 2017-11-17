/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_switch', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: '0',
      primaryKey: true
    },
    match_on: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1'
    },
    msgboard_mgmt: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    cik_on: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0'
    },
    cdkey_on: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'tbl_switch'
  });
};
