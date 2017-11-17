/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_img', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    web_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    local_url: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'tbl_img'
  });
};
