/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_account_sign', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    month_sign: {
      type: DataTypes.STRING(64),
      allowNull: true
    }
  }, {
    tableName: 'tbl_account_sign'
  });
};
