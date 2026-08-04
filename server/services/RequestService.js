// services/RequestService.js
//will do the write/update

const { Request, Requester, Active, RequestLineItem } = require("../model");
// const RequestLineItem = require("../model/RequestLineItem");
const inventoryService = require("./InventoryService");

class RequestService {
  // Approve a request
  async approveRequest(idRequest) {
    const request = await Request.findByPk(idRequest);
    if (!request) throw new Error("Request not found");

    await request.update({
      status: "APPROVED", // Matches DB ALL-CAPS convention
      dateApproved: new Date(), // Updates timestamp
    });

    return { success: true, message: "Request approved successfully." };
  }

  // Reject a request
  async rejectRequest(idRequest) {
    const request = await Request.findByPk(idRequest);
    if (!request) throw new Error("Request not found");

    await request.update({
      status: "REJECTED", // Changed "Declined" to "REJECTED" to match DB
    });

    return { success: true, message: "Request rejected successfully." };
  }

  // Process and fulfill an approved request
  async processSeedPack(trackingNo, barcode, stockOut) {
    // 1. Verify Request
    const request = await Request.findOne({ where: { trackingNo: trackingNo } });
    if (!request || request.status !== "APPROVED") {
      throw new Error("Invalid tracking number or request is not approved.");
    }

    // 2. Check Inventory via InventoryService
    const seed = await inventoryService.getSeedByBarcode(barcode);
    if (!seed) throw new Error("Seed barcode not found.");
    if (seed.currentWeight < stockOut)
      throw new Error("Insufficient seed weight.");

    // 3. Update Weight via InventoryService
    const updatedWeight = seed.currentWeight - stockOut;
    await inventoryService.updateWeight(barcode, updatedWeight);

    // 4. Create Line Item record
    await RequestLineItem.create({
      fkTrackingNo: trackingNo,
      fkBarcode: barcode,
      stockOut: stockOut,
    });

    // 5. Dispatch Request
    request.status = "Dispatched";
    request.dateDispatched = new Date();
    await request.save();

    return {
      success: true,
      message: "Seed pack processed and request dispatched!",
    };
  }

  // Fetch all requests
  async fetchAll() {
    // This fetches every row in the Request table
    // Inside your backend where you fetch requests:
    const requests = await Request.findAll({
      include: [
        { model: Requester }, // Gets the fName and lName
        {
          model: RequestLineItem,
          include: [{ model: Active }], // Gets the Seed name
        },
      ],
    });
    return requests;
  }

  // Set or update deadline date for a request
  async setDeadline(idRequest, deadlineDate) {
    const request = await Request.findByPk(idRequest);
    if (!request) throw new Error("Request not found");

    request.deadlineDate = deadlineDate;
    await request.save();

    return {
      success: true,
      message: "Deadline updated successfully.",
      request,
    };
  }

  // Universal status updater (Handles dateApproved automatically)
  async updateStatus(idRequest, status) {
    const updateData = { status: status.toUpperCase() };

    // Automatically set dateApproved if approving
    if (status.toUpperCase() === "APPROVED") {
      updateData.dateApproved = new Date();
    }

    const [updatedCount] = await Request.update(updateData, {
      where: { idRequest: idRequest },
    });

    if (updatedCount === 0) {
      throw new Error(`Request #${idRequest} not found or status unchanged.`);
    }

    return { idRequest, status: status.toUpperCase() };
  }
}

module.exports = new RequestService();
