/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_order', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    sn: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    game_order_id: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    channel_order_id: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    game_account_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    channel_account_id: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    created_at: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    goods_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    goods_number: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    money: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '2'
    },
    channel_cb: {
      type: DataTypes.STRING(1024),
      allowNull: true
    },
    channel: {
      type: DataTypes.STRING(4),
      allowNull: true
    }
  }, {
    tableName: 'tbl_order'
  });
};
