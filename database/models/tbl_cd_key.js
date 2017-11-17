/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_cd_key', {
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
    cd_key: {
      type: DataTypes.STRING(16),
      allowNull: false
    },
    action_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    account_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    use_time: {
      type: DataTypes.STRING(32),
      allowNull: true
    }
  }, {
    tableName: 'tbl_cd_key'
  });
};
