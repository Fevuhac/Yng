/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_rankgame', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    updated_at: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    win: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    fail: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    points: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '800'
    },
    rank: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '5'
    },
    unfinish: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: '0'
    },
    box: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '0,0,0'
    },
    box_timestamp: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '0,0,0'
    },
    first_box: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '{\"stat\":1,\"timestamp\":0,\"id\":0}'
    },
    season_count: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    season_win: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    season_box: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    season_first_win: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    is_season_reward: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1'
    },
    winning_streak: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'tbl_rankgame'
  });
};
