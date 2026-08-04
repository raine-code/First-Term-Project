const express = require("express");
const router = express.Router();

const ScanController = require("../controllers/ScanController");

// Map the incoming scan endpoint
router.post("/incoming", ScanController.incomingScan);

module.exports = router;
