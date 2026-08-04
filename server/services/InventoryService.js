// services/InventoryService.js
const Active = require("../model/Active");

class InventoryService {
  /**
   * Updates the remaining weight of a seed pack by barcode.
   */
  async updateWeight(barcode, newWeight) {
    const activeSeed = await Active.findOne({ where: { barcode } });
    if (!activeSeed) throw new Error("Active seed not found.");

    activeSeed.currentWeight = newWeight;
    await activeSeed.save();

    return activeSeed;
  }

  /**
   * Helper to check if enough weight exists.
   */
  async getSeedByBarcode(barcode) {
    return await Active.findOne({ where: { barcode: barcode } });
  }
}

module.exports = new InventoryService();
