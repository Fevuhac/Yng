/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_social', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    invite_friends: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    share_friends: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    invite_progress: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    invite_reward: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    share_status_0: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    share_status_1: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    share_status_2: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    enshrine_status: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    share_top_gold: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    share_top_rank: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    invite_daily: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'tbl_social'
  });
};
