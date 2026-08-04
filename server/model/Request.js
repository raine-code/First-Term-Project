const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Request extends Model {}

Request.init(
  {
    idRequest: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "ID_REQUEST",
    },
    idFkRequester: {
      type: DataTypes.INTEGER,
      field: "ID_FK_REQUESTER",
    },
    trackingNo: {
      type: DataTypes.STRING(20),
      unique: true,
      field: "TRACKING_NO",
    },
    dateReq: {
      type: DataTypes.DATE,
      field: "DATE_REQ",
    },
    deadlineDate: {
      type: DataTypes.DATE,
      field: "DEADLINE_DATE",
    },
    weightReq: {
      type: DataTypes.INTEGER,
      field: "WEIGHT_REQ",
    },
    studyTitle: {
      type: DataTypes.STRING(255),
      field: "STUDY_TITLE",
    },
    status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "DISPATCHED", "REJECTED"),
      defaultValue: "PENDING",
      field: "STATUS",
    },
    dateApproved: {
      type: DataTypes.DATE,
      field: "DATE_APPROVED",
    },
    dateDispatched: {
      type: DataTypes.DATE,
      field: "DATE_DISPATCHED",
    },
  },
  {
    sequelize,
    tableName: "TBL_REQUEST",
    timestamps: false,
  },
);

module.exports = Request;
