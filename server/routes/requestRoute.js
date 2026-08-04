const express = require("express");
const router = express.Router();

const RequestController = require("../controllers/requestController");

// Map endpoints for requests
router.post("/process", RequestController.handleRequest);
router.get("/list", RequestController.getRequests);

// NEW ENDPOINT: Admin sets request deadline
router.put("/set-deadline", RequestController.updateDeadline);

// Fetch stats for dashboard cards
router.get("/stats", RequestController.getDailyStats);

// Add this line with your other routes
router.get("/analytics", RequestController.getAnalytics);

// NEW ENDPOINT: Admin updates request status (Approve/Reject)
router.put("/update-status", RequestController.updateRequestStatus);

module.exports = router;
