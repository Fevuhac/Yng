/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_mail', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    type: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    reward: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sendtime: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'tbl_mail'
  });
};
