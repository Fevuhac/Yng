/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_propose', {
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
    text: {
      type: DataTypes.STRING(512),
      allowNull: true
    },
    time: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    like_uids: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    like_count: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    }
  }, {
    tableName: 'tbl_propose'
  });
};
