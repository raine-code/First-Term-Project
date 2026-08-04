const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class User extends Model {}

User.init(
  {
    idUser: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "ID_USER",
    },
    username: {
      type: DataTypes.STRING(4),
      allowNull: false,
      field: "USERNAME",
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "FIRST_NAME",
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "LAST_NAME",
    },
    role: {
      type: DataTypes.ENUM("ADMIN", "STAFF"),
      allowNull: false,
      field: "ROLE",
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "PASSWORD",
    }
  },
  {
    sequelize,
    tableName: "TBL_USER",
    timestamps: false,
  },
);

module.exports = User;
