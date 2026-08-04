//Reader of qr code
// server/services/ScanProcessor.js

const Active = require('../model/Active');

class ScanProcessor {

  constructor(scannedCode) {
    this.scannedCode = scannedCode;
  }

  validateCode() {
    if (!this.scannedCode || this.scannedCode.trim() === "") {
      throw new Error("Invalid scan: Code cannot be empty.");
    }
    return true;
  }

  async process() {
    this.validateCode();

    // ORM Query using Sequelize
    const seedData = await ScanProcessor.findSeedPacket(this.scannedCode);

    if (!seedData) {
      throw new Error("Seed packet barcode not found in active inventory.");
    }

    // Return the ORM model instance directly
    return seedData;
  }

  static async findSeedPacket(barcode) {
    return await Active.findOne({
      where: { barcode: barcode },
    });
  }
}

module.exports = ScanProcessor;