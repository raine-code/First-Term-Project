import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import {
  FaQrcode,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaRedo,
  FaTruck,
  FaInfoCircle,
} from "react-icons/fa";

const BarcodeScanner = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const requestData = location.state?.requestData;

  const [scanResult, setScanResult] = useState(null);
  const [seedData, setSeedData] = useState(null);
  const [grams, setGrams] = useState(requestData?.weightReq || "");
  const [errorMessage, setErrorMessage] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (seedData) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 240, height: 240 } },
      false
    );

    const onScanSuccess = async (decodedText) => {
      setErrorMessage("");

      try {
        const response = await fetch("http://localhost:3000/api/scan/incoming", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: decodedText }),
        });

        const result = await response.json();

        if (result.success) {
          const scannedSeed = result.data;

          if (requestData) {
            const requestedSeedName = requestData.RequestLineItems?.[0]?.Active?.name;
            const scannedSeedName = scannedSeed.packetDetails?.seedName || scannedSeed.name;

            if (requestedSeedName && scannedSeedName && requestedSeedName !== scannedSeedName) {
              setErrorMessage(
                `Mismatch! You scanned '${scannedSeedName}', but this order requires '${requestedSeedName}'.`
              );
              scanner.pause(true);
              setTimeout(() => scanner.resume(), 3000);
              return;
            }
          }

          setScanResult(decodedText);
          setSeedData(scannedSeed);
          scanner.clear().catch((err) => console.error(err));
        } else {
          setErrorMessage(result.error || "Seed barcode not found in active inventory.");
        }
      } catch (error) {
        setErrorMessage("Could not reach backend verification server.");
      }
    };

    scanner.render(onScanSuccess, () => {});

    return () => {
      scanner.clear().catch((error) => console.error(error));
    };
  }, [seedData, requestData]);

  const handleProcessSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const payload = {
        trackingNo: requestData?.trackingNo || requestData?.idRequest,
        idRequest: requestData?.idRequest,
        barcode: scanResult,
        quantityGrams: grams,
      };

      const response = await fetch("http://localhost:3000/api/requests/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        alert("Seed packet verified, deducted from stock, and marked as Dispatched!");
        navigate("/staff-dashboard");
      } else {
        alert("Error: " + (result.error || result.message));
      }
    } catch (err) {
      console.error("Submit Error:", err);
      alert("Failed to submit verification dispatch.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col justify-center">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <FaQrcode className="text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {seedData ? "Confirm Seed Packet Dispatch" : "Scan Seed Barcode"}
                </h1>
                <p className="text-xs text-slate-500">
                  {seedData
                    ? "Verify weight details and complete order dispatch"
                    : "Position barcode within camera scanner frame"}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-lg"
              title="Go back"
            >
              <FaArrowLeft />
            </button>
          </div>

          {/* If Request Data was passed */}
          {requestData && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
              <FaInfoCircle className="text-blue-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">Fulfilling Request #{requestData.idRequest}:</span>{" "}
                {requestData.Requester ? `${requestData.Requester.fName} ${requestData.Requester.lName}` : "Requester"}{" "}
                — Requested{" "}
                <span className="font-semibold underline">
                  {requestData.RequestLineItems?.[0]?.Active?.name || "Seed"}
                </span>{" "}
                ({requestData.weightReq}g)
              </div>
            </div>
          )}

          {!seedData ? (
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden border border-slate-200 p-2 bg-slate-50">
                <div id="reader" className="w-full rounded-lg overflow-hidden"></div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <FaExclamationTriangle className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                onClick={() => navigate(-1)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleProcessSubmit} className="space-y-5">
              {/* Scanned Seed Details */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <FaCheckCircle />
                  <span>Barcode Verified: {scanResult}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Variety Name</span>
                    <span className="font-semibold">{seedData.name || seedData.packetDetails?.seedName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Available Stock</span>
                    <span className="font-semibold">
                      {seedData.currentWeight ?? seedData.packetDetails?.currentWeight ?? "0"} g
                    </span>
                  </div>
                </div>
              </div>

              {/* Weight Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Quantity to Deduct & Dispatch (Grams) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={grams}
                  onChange={(e) => setGrams(e.target.value)}
                  required
                  min="1"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSeedData(null);
                    setScanResult(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
                >
                  <FaRedo />
                  <span>Rescan</span>
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  <FaTruck />
                  <span>{processing ? "Dispatching..." : "Confirm & Dispatch"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default BarcodeScanner;