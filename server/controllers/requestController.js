const RequestProcessor = require("../services/RequestService");
const { Request, Active } = require("../model");
const RequestService = require("../services/RequestService");

class requestController {
  static async handleRequest(req, res) {
    try {
      const requestData = req.body;

      const result = await RequestProcessor.processSeedPack(
        requestData.trackingNo, // Make sure your frontend sends this!
        requestData.barcode,
        requestData.quantityGrams,
      );

      res.status(200).json({
        success: true,
        message: "Request processed successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Method to handle fetching existing requests
  static async getRequests(req, res) {
    try {
      const result = await RequestProcessor.fetchAll();

      res.status(200).json({
        success: true,
        message: "Requests retrieved successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
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

      const result = await RequestProcessor.setDeadline(
        idRequest,
        deadlineDate,
      );
      res.status(200).json({
        success: true,
        message: "Deadline set successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // NEW: Get aggregate metrics for daily stats
  static async getDailyStats(req, res) {
    try {
      // 1. Count approved requests
      const approvedSeeds = await Request.count({
        where: { status: "APPROVED" },
      });

      // 2. Count distributed/dispatched requests
      const distributedSeeds = await Request.count({
        where: { status: "DISPATCHED" },
      });

      // 3. Count current pending requests
      const currentRequests = await Request.count({
        where: { status: "PENDING" },
      });

      // 4. Count total active seed inventory items/packets registered
      const totalSeedPackets = await Active.count();

      res.status(200).json({
        success: true,
        data: {
          approvedSeeds,
          distributedSeeds,
          totalSeedPackets,
          currentRequests,
        },
      });
    } catch (error) {
      console.error("Error fetching daily stats:", error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve daily statistics",
      });
    }
  }

  static async getAnalytics(req, res) {
    try {
      const {
        sequelize,
        Request,
        Requester,
        RequestLineItem,
        Active,
      } = require("../model");

      // 1. Fetch Raw Seeds
      const rawSeeds = await RequestLineItem.findAll({
        attributes: ["FK_BARCODE", "ID_LINEITEM"],
        include: [
          {
            model: Active,
            attributes: ["name"],
            required: false,
          },
        ],
        raw: true,
      });

      // 2. Fetch Raw Requesters
      const rawRequests = await Request.findAll({
        attributes: ["ID_FK_REQUESTER", "STATUS"],
        include: [
          {
            model: Requester,
            attributes: ["F_NAME", "L_NAME"],
            required: false,
          },
        ],
        where: { status: "DISPATCHED" },
        raw: true,
      });

      // --- DEBUG: Log the EXACT keys of the first item ---
      if (rawSeeds.length > 0) {
        console.log("🔍 SEEDS KEYS:", Object.keys(rawSeeds[0]));
      }
      if (rawRequests.length > 0) {
        console.log("🔍 REQUESTERS KEYS:", Object.keys(rawRequests[0]));
      }

      // --- GROUPING IN JAVASCRIPT (Dynamic Key Detection) ---

      // Group Seeds
      const seedMap = {};
      rawSeeds.forEach((item) => {
        // Find the barcode key (it might be "FK_BARCODE" or "RequestLineItem.FK_BARCODE")
        const barcodeKey = Object.keys(item).find(
          (k) => k.includes("FK_BARCODE") || k === "fkBarcode",
        );
        const barcode = item[barcodeKey];

        // Find the name key (it might be "Active.name", "name", etc.)
        const nameKey = Object.keys(item).find(
          (k) => k.includes("name") || k.includes("Name"),
        );
        const seedName = item[nameKey] ? item[nameKey].trim() : "Unknown Seed";

        if (barcode && !seedMap[barcode]) {
          seedMap[barcode] = {
            fkBarcode: barcode,
            seedName: seedName,
            requestCount: 0,
          };
        }
        if (barcode && seedMap[barcode]) {
          seedMap[barcode].requestCount += 1;
        }
      });

      const topSeeds = Object.values(seedMap)
        .sort((a, b) => b.requestCount - a.requestCount)
        .slice(0, 10);

      // Group Requesters
      const requesterMap = {};
      rawRequests.forEach((item) => {
        // Find the ID key
        const idKey = Object.keys(item).find(
          (k) => k.includes("ID_FK_REQUESTER") || k === "idFkRequester",
        );
        const requesterId = item[idKey];

        // Find the First Name key
        const fNameKey = Object.keys(item).find(
          (k) =>
            k.includes("F_NAME") || k.includes("fName") || k.includes("First"),
        );
        const fName = item[fNameKey] ? item[fNameKey].trim() : "Unknown";

        // Find the Last Name key
        const lNameKey = Object.keys(item).find(
          (k) =>
            k.includes("L_NAME") || k.includes("lName") || k.includes("Last"),
        );
        const lName = item[lNameKey] ? item[lNameKey].trim() : "Unknown";

        if (requesterId && !requesterMap[requesterId]) {
          requesterMap[requesterId] = {
            idFkRequester: requesterId,
            fName: fName,
            lName: lName,
            distributedCount: 0,
          };
        }
        if (requesterId && requesterMap[requesterId]) {
          requesterMap[requesterId].distributedCount += 1;
        }
      });

      const topRequesters = Object.values(requesterMap)
        .sort((a, b) => b.distributedCount - a.distributedCount)
        .slice(0, 10);

      // --- RESPONSE ---
      res.status(200).json({
        success: true,
        data: {
          topSeeds,
          topRequesters,
        },
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res
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

      // Calls your RequestService method
      const result = await RequestService.updateStatus(idRequest, status);

      res.status(200).json({
        success: true,
        message: `Status updated to ${status}`,
        data: result,
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = requestController;