/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_activity', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    created_at: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    gift_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    icon: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    price: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    item: {
      type: DataTypes.STRING(128),
      allowNull: false,
      defaultValue: '{}'
    },
    condition: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    value: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    starttime: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    endtime: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    buycount: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '1'
    },
    version: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    revoke: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    discount: {
      type: DataTypes.FLOAT,
      allowNull: true
    }
  }, {
    tableName: 'tbl_activity'
  });
};
