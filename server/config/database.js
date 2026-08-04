const { Sequelize } = require("sequelize");

// Assume the database already exists
const sequelize = new Sequelize("seed_track_db", "root", "root", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = sequelize;
