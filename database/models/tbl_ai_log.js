/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_ai_log', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    account_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    log_at: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    wpTimes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    firstFireSeconds: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '0'
    },
    noFireQuitChance: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    fishTimes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sameFishAverageDt: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '0'
    },
    targetShiftTimes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    normalStaySeconds: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '0'
    },
    brokenStaySeconds: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '0'
    },
    iceSkillTimes: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    lockSkillChance: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    callSkillTimes: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    holdChance: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    holdAverageSeconds: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '0'
    },
    waitAverageSeconds: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '0'
    },
    holdingQuitChance: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'tbl_ai_log'
  });
};
