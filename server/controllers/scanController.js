// server/controllers/ScanController.js
const ScanProcessor = require("../services/ScanProcessor");

class ScanController {
  static async incomingScan(req, res) {
    try {
      const { code } = req.body;
      const processor = new ScanProcessor(code);

      // 1. ADD 'await' because processor.process() is an async function
      const seedData = await processor.process();

      // 2. Return the clean seedData directly as 'data'
      res.status(200).json({
        success: true,
        message: "Scan successful",
        data: seedData,
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = ScanController;
