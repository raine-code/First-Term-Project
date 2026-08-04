const sequelize = require("../config/database"); // Import sequelize instance
const Municipality = require("./Municipality");
const Requester = require("./Requester");
const Request = require("./Request");
const Active = require("./Active");
const Gid = require("./Gid");
const RequestLineItem = require("./RequestLineItem");

// 1. Municipality -> Requester
Municipality.hasMany(Requester, {
  foreignKey: "idFkMunicipality",
});
Requester.belongsTo(Municipality, {
  foreignKey: "idFkMunicipality",
});

// 2. Requester -> Request
Requester.hasMany(Request, {
  foreignKey: "idFkRequester",
});
Request.belongsTo(Requester, {
  foreignKey: "idFkRequester",
});

// 3. Gid -> Active
Gid.hasMany(Active, {
  foreignKey: "idFkGid",
});
Active.belongsTo(Gid, {
  foreignKey: "idFkGid",
});

// 4. Request -> RequestLineItem
Request.hasMany(RequestLineItem, {
  foreignKey: "fkTrackingNo",
  sourceKey: "trackingNo",
});
RequestLineItem.belongsTo(Request, {
  foreignKey: "fkTrackingNo",
  targetKey: "trackingNo",
});

// 5. Active -> RequestLineItem
Active.hasMany(RequestLineItem, {
  foreignKey: "fkBarcode",
  sourceKey: "barcode",
});
RequestLineItem.belongsTo(Active, {
  foreignKey: "fkBarcode",
  targetKey: "barcode",
});

module.exports = {
  sequelize, // Exported so controllers can access Sequelize utility methods (.fn, .col, .literal)
  Municipality,
  Requester,
  Request,
  Active,
  Gid,
  RequestLineItem,
};
