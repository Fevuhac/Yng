/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_link_log', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    uid: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    linked_at: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    api: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    }
  }, {
    tableName: 'tbl_link_log'
  });
};
