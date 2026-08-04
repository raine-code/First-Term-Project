const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Municipality extends Model {}

Municipality.init(
  {
    idMunicipality: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "ID_MUNICIPALITY",
    },
    town: {
      type: DataTypes.STRING(100),
      field: "TOWN",
    },
    province: {
      type: DataTypes.STRING(100),
      field: "PROVINCE",
    },
  },
  {
    sequelize,
    tableName: "TBL_MUNICIPALITY",
    timestamps: false,
  },
);

module.exports = Municipality;
