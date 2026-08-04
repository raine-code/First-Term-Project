const express = require("express");
const router = express.Router();

// Import the Controller
const AuthController = require("../controllers/authController");

// Map the HTTP method (POST) and the URL endpoint to the Controller's method
router.post("/login", AuthController.login);

// Export the router to be used in server.js
module.exports = router;
