// server/services/RequestService.js
const { Op } = require("sequelize");
const { Request, Requester, Municipality, Active, RequestLineItem } = require("../model");
const inventoryService = require("./InventoryService");

class RequestService {
  // Fetch all requests with associated Requester and Line Items
  async fetchAll() {
    return await Request.findAll({
      include: [
        { model: Requester },
        {
          model: RequestLineItem,
          include: [{ model: Active }],
        },
      ],
    });
  }

  // Fetch all active seed packets for dropdown selection
  async getSeedsList() {
    return await Active.findAll({
      attributes: ["idActive", "name", "barcode", "currentWeight"],
    });
  }

  async createRequest(payload) {
    const {
      fName,
      lName,
      agency,
      emailAdd,
      municipalityId, // <-- 1. Extract the ID directly sent by your React dropdown
      seedBarcode,
      weightReq,
      studyTitle,
    } = payload;

    // (We removed the Municipality findOrCreate block because the dropdown
    // already guarantees we have a valid, existing municipalityId!)

    // 2. Find or create Requester by email
    const [requester] = await Requester.findOrCreate({
      where: { emailAdd },
      defaults: {
        fName,
        lName,
        agency,
        emailAdd,
        idFkMunicipality: municipalityId, // <-- 2. Passes the valid ID, no more nulls!
        // Note: If Sequelize still complains about the column name, change the key
        // above to exactly match your DB: ID_FK_MUNICIPALITY: municipalityId
      },
    });

    // 3. Find selected seed in TBL_ACTIVE
    const activeSeed = await Active.findOne({
      where: { barcode: seedBarcode },
    });
    if (!activeSeed) {
      throw new Error("Selected seed packet not found.");
    }

    // 4. Generate incremental tracking number (e.g., 2026-GBSR-0001)
    const currentYear = new Date().getFullYear();
    const prefix = `${currentYear}-GBSR-`;

    const lastRequest = await Request.findOne({
      where: {
        trackingNo: {
          [Op.like]: `${prefix}%`,
        },
      },
      order: [["idRequest", "DESC"]],
    });

    let nextNumber = 1;
    if (lastRequest && lastRequest.trackingNo) {
      const parts = lastRequest.trackingNo.split("-");
      const lastSequenceStr = parts[parts.length - 1];
      const parsedNum = parseInt(lastSequenceStr, 10);
      if (!isNaN(parsedNum)) {
        nextNumber = parsedNum + 1;
      }
    }

    const formattedSequence = String(nextNumber).padStart(4, "0");
    const trackingNo = `${prefix}${formattedSequence}`;

    // 5. Create Request record
    const newRequest = await Request.create({
      idFkRequester: requester.idRequester,
      trackingNo,
      dateReq: new Date(),
      weightReq: parseInt(weightReq, 10),
      status: "PENDING",
      studyTitle: studyTitle,
    });

    // 6. Create associated RequestLineItem record
    await RequestLineItem.create({
      fkTrackingNo: trackingNo,
      fkBarcode: activeSeed.barcode,
      stockOut: 0,
    });

    return newRequest;
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
    const normalizedStatus = status.toUpperCase();
    const updateData = { status: normalizedStatus };

    if (normalizedStatus === "APPROVED") {
      updateData.dateApproved = new Date();
    }

    const [updatedCount] = await Request.update(updateData, {
      where: { idRequest },
    });

    if (updatedCount === 0) {
      throw new Error(`Request #${idRequest} not found or status unchanged.`);
    }

    return { idRequest, status: normalizedStatus };
  }

  // Process and fulfill an approved request
  async processSeedPack(trackingNo, barcode, stockOut) {
    const request = await Request.findOne({ where: { trackingNo } });
    if (!request || request.status !== "APPROVED") {
      throw new Error("Invalid tracking number or request is not approved.");
    }

    const seed = await inventoryService.getSeedByBarcode(barcode);
    if (!seed) throw new Error("Seed barcode not found.");
    if (seed.currentWeight < stockOut) {
      throw new Error("Insufficient seed weight.");
    }

    const updatedWeight = seed.currentWeight - stockOut;
    await inventoryService.updateWeight(barcode, updatedWeight);

    await RequestLineItem.create({
      fkTrackingNo: trackingNo,
      fkBarcode: barcode,
      stockOut,
    });

    request.status = "DISPATCHED";
    request.dateDispatched = new Date();
    await request.save();

    return {
      success: true,
      message: "Seed pack processed and request dispatched!",
    };
  }

  // Aggregate metrics for daily stats dashboard
  async getDailyStats() {
    const approvedSeeds = await Request.count({
      where: { status: "APPROVED" },
    });
    const distributedSeeds = await Request.count({
      where: { status: "DISPATCHED" },
    });
    const currentRequests = await Request.count({
      where: { status: "PENDING" },
    });
    const totalSeedPackets = await Active.count();

    return {
      approvedSeeds,
      distributedSeeds,
      totalSeedPackets,
      currentRequests,
    };
  }

  // Operational analytics calculation for top seeds and requesters
  async getAnalytics() {
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

    // Group Seeds
    const seedMap = {};
    rawSeeds.forEach((item) => {
      const barcodeKey = Object.keys(item).find(
        (k) => k.includes("FK_BARCODE") || k === "fkBarcode",
      );
      const barcode = item[barcodeKey];

      const nameKey = Object.keys(item).find(
        (k) => k.includes("name") || k.includes("Name"),
      );
      const seedName = item[nameKey] ? item[nameKey].trim() : "Unknown Seed";

      if (barcode && !seedMap[barcode]) {
        seedMap[barcode] = {
          fkBarcode: barcode,
          seedName,
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
      const idKey = Object.keys(item).find(
        (k) => k.includes("ID_FK_REQUESTER") || k === "idFkRequester",
      );
      const requesterId = item[idKey];

      const fNameKey = Object.keys(item).find(
        (k) =>
          k.includes("F_NAME") || k.includes("fName") || k.includes("First"),
      );
      const fName = item[fNameKey] ? item[fNameKey].trim() : "Unknown";

      const lNameKey = Object.keys(item).find(
        (k) =>
          k.includes("L_NAME") || k.includes("lName") || k.includes("Last"),
      );
      const lName = item[lNameKey] ? item[lNameKey].trim() : "Unknown";

      if (requesterId && !requesterMap[requesterId]) {
        requesterMap[requesterId] = {
          idFkRequester: requesterId,
          fName,
          lName,
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

    return { topSeeds, topRequesters };
  }

  // Fetch all registered municipalities for dropdown selection
  async getMunicipalities() {
    return await Municipality.findAll({
      attributes: ["idMunicipality", "town", "province"],
      order: [["town", "ASC"]], // Orders the dropdown alphabetically by town
    });
  }
}

module.exports = new RequestService();