/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_room', {
    plazaid: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '1'
    },
    roomid: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'tbl_room'
  });
};
