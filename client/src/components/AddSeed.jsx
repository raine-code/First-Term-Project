import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import {
  FaBoxes,
  FaQrcode,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationCircle,
  FaWeightHanging,
} from "react-icons/fa";

const AddSeed = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    accNo: "",
    name: "",
    currentWeight: "",
    viability: "9.9",
    barcode: "",
    stockOnhand: "",
    location: "",
    availability: "AVAILABLE",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:3000/api/requests/seed/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert("New seed variety successfully registered!");
        navigate("/seeds");
      } else {
        setError(result.error || "Failed to register seed.");
      }
    } catch (err) {
      console.error("Error submitting seed:", err);
      setError("Network error occurred while submitting seed data.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Register New Seed Variety
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Enter accession metadata, barcode identifier, viability scores, and storage rack location
            </p>
          </div>
          <button
            onClick={() => navigate("/seeds")}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 transition-all"
          >
            <FaArrowLeft className="text-xs text-slate-400" />
            <span>Cancel</span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-2">
            <FaExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          {/* Section 1: Identification */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <FaBoxes className="text-sm" />
              </div>
              <h2 className="text-sm font-bold text-slate-800">Seed Identification & Tracking</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Seed / Variety Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. NSIC Rc 222 (Tubigan 18)"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Barcode Identifier <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 2026-01-0012-3"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Accession Number / GID
                </label>
                <input
                  type="text"
                  name="accNo"
                  value={formData.accNo}
                  onChange={handleChange}
                  placeholder="e.g. PRRI000452"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Bin / Rack Storage Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Cold-Vault-R3-B12"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Metrics */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <FaWeightHanging className="text-sm" />
              </div>
              <h2 className="text-sm font-bold text-slate-800">Stock Weight & Viability Index</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Current Weight (g) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="currentWeight"
                  value={formData.currentWeight}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 500"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Packets On-Hand <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="stockOnhand"
                  value={formData.stockOnhand}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 25"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Viability Score <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="viability"
                  value={formData.viability}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 9.8"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Availability Status <span className="text-rose-500">*</span>
                </label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="UNAVAILABLE">UNAVAILABLE</option>
                  <option value="RESERVED">RESERVED</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/seeds")}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
            >
              {submitting ? "Registering..." : "Register Seed"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddSeed;