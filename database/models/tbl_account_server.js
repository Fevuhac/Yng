/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_account_server', {
    uid: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    sid: {
      type: DataTypes.INTEGER(6),
      allowNull: false
    },
    login_time: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'tbl_account_server'
  });
};
