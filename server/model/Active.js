const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Active extends Model {}

Active.init(
  {
    idActive: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "ID_ACTIVE",
    },
    idFkGid: {
      type: DataTypes.INTEGER,
      field: "ID_FK_GID",
    },
    name: {
      type: DataTypes.STRING,
      field: "SEED_NAME",
    },
    currentWeight: {
      type: DataTypes.INTEGER,
      field: "CURRENT_WEIGHT",
    },
    viability: {
      type: DataTypes.DECIMAL,
      field: "VIABILITY",
    },
    barcode: {
      type: DataTypes.STRING(30),
      unique: true,
      field: "BARCODE",
    },
    stockOnhand: {
      type: DataTypes.INTEGER,
      field: "STOCK_ONHAND",
    },
    location: {
      type: DataTypes.STRING(20),
      field: "LOCATION",
    },
    availability: {
      type: DataTypes.ENUM("AVAILABLE", "UNAVAILABLE", "RESERVED"),
      field: "AVAILABILITY",
    },
  },
  {
    sequelize,
    tableName: "TBL_ACTIVE",
    timestamps: false,
  },
);

module.exports = Active;
