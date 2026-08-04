const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Requester extends Model {}

Requester.init(
  {
    idRequester: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "ID_REQUESTER",
    },
    idFkMunicipality: {
      type: DataTypes.INTEGER,
      field: "ID_FK_MUNICIPALITY",
    },
    fName: {
      type: DataTypes.STRING(100),
      field: "F_NAME",
    },
    lName: {
      type: DataTypes.STRING(100),
      field: "L_NAME",
    },
    agency: {
      type: DataTypes.STRING(150),
      field: "AGENCY",
    },
    emailAdd: {
      type: DataTypes.STRING(150),
      field: "EMAIL_ADD",
    },
  },
  {
    sequelize,
    tableName: "TBL_REQUESTER",
    timestamps: false,
  },
);

module.exports = Requester;
