// server/controllers/requestController.js
const RequestService = require("../services/RequestService");

class requestController {
  static async handleRequest(req, res) {
    try {
      const { trackingNo, barcode, quantityGrams } = req.body;
      const result = await RequestService.processSeedPack(
        trackingNo,
        barcode,
        quantityGrams,
      );

      return res.status(200).json({
        success: true,
        message: "Request processed successfully",
        data: result,
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getRequests(req, res) {
    try {
      const result = await RequestService.fetchAll();
      return res.status(200).json({
        success: true,
        message: "Requests retrieved successfully",
        data: result,
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async updateDeadline(req, res) {
    try {
      const { idRequest, deadlineDate } = req.body;
      if (!idRequest || !deadlineDate) {
        return res
          .status(400)
          .json({ success: false, error: "Missing idRequest or deadlineDate" });
      }

      const result = await RequestService.setDeadline(idRequest, deadlineDate);
      return res.status(200).json({
        success: true,
        message: "Deadline set successfully",
        data: result,
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getDailyStats(req, res) {
    try {
      const stats = await RequestService.getDailyStats();
      return res.status(200).json({ success: true, data: stats });
    } catch (error) {
      console.error("Error fetching daily stats:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to retrieve daily statistics",
      });
    }
  }

  static async getAnalytics(req, res) {
    try {
      const analyticsData = await RequestService.getAnalytics();
      return res.status(200).json({ success: true, data: analyticsData });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      return res
        .status(500)
        .json({ success: false, error: "Failed to retrieve analytics" });
    }
  }

  static async updateRequestStatus(req, res) {
    try {
      const { idRequest, status } = req.body;
      if (!idRequest || !status) {
        return res
          .status(400)
          .json({ success: false, error: "Missing idRequest or status" });
      }

      const result = await RequestService.updateStatus(idRequest, status);
      return res.status(200).json({
        success: true,
        message: `Status updated to ${status}`,
        data: result,
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getSeedsList(req, res) {
    try {
      const seeds = await RequestService.getSeedsList();
      return res.status(200).json({ success: true, data: seeds });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async createRequest(req, res) {
    try {
      const { fName, lName, emailAdd, seedBarcode, weightReq } = req.body;

      if (!fName || !lName || !emailAdd || !seedBarcode || !weightReq) {
        return res.status(400).json({
          success: false,
          error: "Please fill in all required fields.",
        });
      }

      const newRequest = await RequestService.createRequest(req.body);

      return res.status(201).json({
        success: true,
        message: "Request created successfully!",
        data: newRequest,
      });
    } catch (error) {
      console.error("Error creating request:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // NEW: Get municipalities for the dropdown
  static async getMunicipalities(req, res) {
    try {
      const municipalities = await RequestService.getMunicipalities();
      return res.status(200).json({ success: true, data: municipalities });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

}

module.exports = requestController;
