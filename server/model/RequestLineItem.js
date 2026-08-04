const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class RequestLineItem extends Model {}

RequestLineItem.init(
  {
    idLineItem: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "ID_LINEITEM",
    },
    fkTrackingNo: {
      type: DataTypes.STRING(20),
      field: "FK_TRACKING_NO",
    },
    fkBarcode: {
      type: DataTypes.STRING(30),
      field: "FK_BARCODE",
    },
    stockOut: {
      type: DataTypes.INTEGER,
      field: "STOCK_OUT",
    },
  },
  {
    sequelize,
    tableName: "TBL_REQUEST_LINEITEM",
    timestamps: false,
  },
);

module.exports = RequestLineItem;
