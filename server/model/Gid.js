const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Gid extends Model {}

Gid.init(
  {
    gid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "GID",
    },
    accNo: {
      type: DataTypes.STRING(20),
      field: "ACC_NO",
    },
    accName: {
      type: DataTypes.STRING(150),
      field: "ACC_NAME",
    },
  },
  {
    sequelize,
    tableName: "TBL_GID",
    timestamps: false,
  },
);

module.exports = Gid;
