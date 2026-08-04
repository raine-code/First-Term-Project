import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useLocation, useNavigate } from 'react-router-dom';

const BarcodeScanner = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve the request data passed from RequestList.jsx
  const requestData = location.state?.requestData;

  const [scanResult, setScanResult] = useState(null);
  const [seedData, setSeedData] = useState(null);

  // Pre-fill the requested grams from the request data if it exists
  const [grams, setGrams] = useState(requestData?.weightReq || '');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (seedData) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    const onScanSuccess = async (decodedText) => {
      setErrorMessage('');

      try {
        const response = await fetch('http://localhost:3000/api/scan/incoming', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: decodedText })
        });

        const result = await response.json();
       
        console.log("RAW BACKEND RESPONSE:", result);

        if (result.success) {
          const scannedSeed = result.data;

          // ==========================================
          // MATCHING LOGIC IMPLEMENTED HERE
          // ==========================================
          if (requestData) {
            // Adjust this path based on your actual nested JSON structure for the seed name
            const requestedSeedName = requestData.RequestLineItems?.[0]?.Active?.name;
            const scannedSeedName = scannedSeed.packetDetails?.seedName || scannedSeed.name;

            if (requestedSeedName && requestedSeedName !== scannedSeedName) {
              setErrorMessage(`Mismatch! You scanned ${scannedSeedName}, but this request requires ${requestedSeedName}.`);
              // Clear scanner temporarily so they can read the error before trying again
              scanner.pause(true);
              setTimeout(() => scanner.resume(), 3000);
              return;
            }
          }

          // If it matches (or if there's no request data tied to it), proceed
          setScanResult(decodedText);
          setSeedData(scannedSeed);
          scanner.clear().catch((err) => console.error(err));

        } else {
          setErrorMessage(result.error || 'Seed packet not found in database.');
        }
      } catch (error) {
        setErrorMessage('Could not connect to server.');
      }
    };

    scanner.render(onScanSuccess, () => { });

    return () => {
      scanner.clear().catch((error) => console.error(error));
    };
  }, [seedData, requestData]);

  const handleProcessSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        // 1. Request Identifier (passed from RequestList)
        trackingNo: requestData?.trackingNo || requestData?.idRequest,
        idRequest: requestData?.idRequest,

        // 2. Scanned Seed Packet Barcode
        barcode: scanResult,
        // TRACKING_NO: scanResult,

        // 3. Quantity in grams
        quantityGrams: grams
      };

      console.log("Sending payload to backend:", payload);

      const response = await fetch('http://localhost:3000/api/requests/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        alert('Request processed and dispatched successfully!');
        navigate('/requests'); // Redirect back to request list
      } else {
        alert('Error: ' + (result.error || result.message));
      }
    } catch (err) {
      console.error("Submit Error:", err);
      alert('Failed to submit weight process.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">

        {!seedData ? (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
              Scan Seed Barcode
            </h2>
            {requestData && (
              <p className="text-center text-sm text-blue-600 mb-4 font-semibold">
                Scanning for Request #{requestData.idRequest}
              </p>
            )}

            <div id="reader" className="w-full overflow-hidden rounded-lg border-2 border-dashed border-blue-400"></div>

            {errorMessage && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center font-medium">
                {errorMessage}
              </div>
            )}

            <button
              onClick={() => navigate(-1)}
              className="mt-4 w-full py-2 bg-gray-200 text-gray-700 rounded-lg"
            >
              Back to Requests
            </button>
          </>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
              Requested Seed Process
            </h2>

            <form onSubmit={handleProcessSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seed Quantity (grams)
                </label>
                <input
                  type="number"
                  value={grams}
                  onChange={(e) => setGrams(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              {/* SEPARATED BOX 1: REQUEST INFORMATION */}
              {requestData && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                  <h3 className="font-semibold text-blue-800 text-sm border-b border-blue-200 pb-1">
                    Request Information
                  </h3>
                  <p className="text-sm text-blue-900">
                    <strong>Requester:</strong> {requestData.Requester?.fName} {requestData.Requester?.lName}
                  </p>
                  <p className="text-sm text-blue-900">
                    <strong>Requested Seed:</strong> {requestData.RequestLineItems?.[0]?.Active?.name}
                  </p>
                  <p className="text-sm text-blue-900">
                    <strong>Requested Grams:</strong> {requestData.weightReq}g
                  </p>
                </div>
              )}

                {/* SEPARATED BOX 2: SEED PACK INFORMATION (Scanned Data) */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                  <h3 className="font-semibold text-gray-700 text-sm border-b border-gray-200 pb-1">
                    Seed Pack Information (Scanned)
                  </h3>
                  <p className="text-sm text-gray-600">
                    <strong>Barcode:</strong> {scanResult}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Name:</strong> {seedData?.name || seedData?.packetDetails?.seedName || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {/* UPDATED LINE BELOW */}
                    <strong>Current Stock Weight:</strong> {seedData?.currentWeight ?? seedData?.packetDetails?.currentWeight ?? "0"} g
                  </p>
                </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setSeedData(null); setScanResult(null); }}
                  className="w-1/2 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Rescan
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Confirm Process
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;