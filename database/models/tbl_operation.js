/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_operation', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    cfg_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    desc: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    value: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    type: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '1'
    }
  }, {
    tableName: 'tbl_operation'
  });
};
