/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_shop_log', {
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
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    item_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    item_type: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    },
    item_amount: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    nickname: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    price: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    order_id: {
      type: DataTypes.STRING(64),
      allowNull: true
    }
  }, {
    tableName: 'tbl_shop_log'
  });
};
