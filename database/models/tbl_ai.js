/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_ai', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    created_at: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    last_log_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: '0'
    },
    wpTimesP: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    firstFireSecondsP: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '0'
    },
    noFireQuitChanceP: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '0'
    },
    fishTimesP: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sameFishAverageDtP: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '0'
    },
    targetShiftTimesP: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    normalStaySecondsP: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '0'
    },
    brokenStaySecondsP: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '0'
    },
    iceSkillTimesP: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '0'
    },
    lockSkillChanceP: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    callSkillTimesP: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '0'
    },
    holdChanceP: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '0'
    },
    holdAverageSecondsP: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '0'
    },
    waitAverageSecondsP: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '0'
    },
    holdingQuitChanceP: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'tbl_ai'
  });
};
