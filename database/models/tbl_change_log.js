/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_change_log', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    orderid: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    sn: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '1'
    },
    uid: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    created_at: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    ship_at: {
      type: DataTypes.TIME,
      allowNull: true
    },
    cid: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    catalog: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '1'
    },
    count: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    cost: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    itemname: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    thingnum: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    way: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    card_num: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    card_pwd: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    icon: {
      type: DataTypes.STRING(32),
      allowNull: true
    }
  }, {
    tableName: 'tbl_change_log'
  });
};
