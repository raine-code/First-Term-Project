import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import {
  FaUser,
  FaSeedling,
  FaMapMarkerAlt,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationCircle,
  FaBookOpen,
} from "react-icons/fa";

const AddRequest = () => {
  const navigate = useNavigate();
  const [seeds, setSeeds] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [loadingSelects, setLoadingSelects] = useState(true);

  const [formData, setFormData] = useState({
    fName: "",
    lName: "",
    agency: "",
    emailAdd: "",
    municipalityId: "",
    seedBarcode: "",
    weightReq: "",
    studyTitle: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchDropdownData = async () => {
      try {
        const [seedsResponse, muniResponse] = await Promise.all([
          fetch("http://localhost:3000/api/requests/seeds-list"),
          fetch("http://localhost:3000/api/requests/municipalities"),
        ]);

        const seedsResult = await seedsResponse.json();
        const muniResult = await muniResponse.json();

        if (isMounted) {
          if (seedsResponse.ok && seedsResult.success) {
            setSeeds(seedsResult.data || []);
          } else {
            setError("Failed to load available seeds list.");
          }

          if (muniResponse.ok && muniResult.success) {
            setMunicipalities(muniResult.data || []);
          } else {
            setError("Failed to load registered municipalities.");
          }
        }
      } catch (err) {
        console.error("Error loading dropdown data:", err);
        if (isMounted) setError("Network error while loading form choices.");
      } finally {
        if (isMounted) setLoadingSelects(false);
      }
    };
    fetchDropdownData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:3000/api/requests/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert("New requisition order created successfully!");
        navigate("/admin-dashboard");
      } else {
        setError(result.error || "Failed to create request.");
      }
    } catch (err) {
      console.error("Error submitting request:", err);
      setError("Network error occurred while submitting request.");
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
              Create Seed Requisition Order
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Submit a formal request for research, breeding, or farming propagation
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
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
          {/* STEP 1: Requester Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <FaUser className="text-sm" />
              </div>
              <h2 className="text-sm font-bold text-slate-800">Requester Profile & Institution</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="fName"
                  value={formData.fName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Maria"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="lName"
                  value={formData.lName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Santos"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Agency / Organization
                </label>
                <input
                  type="text"
                  name="agency"
                  value={formData.agency}
                  onChange={handleChange}
                  placeholder="e.g. Dept. of Agriculture / State University"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="emailAdd"
                  value={formData.emailAdd}
                  onChange={handleChange}
                  required
                  placeholder="e.g. maria.santos@agency.gov.ph"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Municipality / Location <span className="text-rose-500">*</span>
                </label>
                <select
                  name="municipalityId"
                  value={formData.municipalityId}
                  onChange={handleChange}
                  required
                  disabled={loadingSelects}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                >
                  <option value="">-- Select Municipality / Province --</option>
                  {municipalities.map((m) => (
                    <option key={m.idMunicipality} value={m.idMunicipality}>
                      {m.town} {m.province && m.province !== "N/A" ? `(${m.province})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* STEP 2: Requisition Details */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <FaSeedling className="text-sm" />
              </div>
              <h2 className="text-sm font-bold text-slate-800">Seed Requirement & Research Info</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Study / Project Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="studyTitle"
                  value={formData.studyTitle}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Drought Resilience and Grain Quality Assessment 2026"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Requested Variety / Seed <span className="text-rose-500">*</span>
                </label>
                <select
                  name="seedBarcode"
                  value={formData.seedBarcode}
                  onChange={handleChange}
                  required
                  disabled={loadingSelects}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                >
                  <option value="">-- Select Active Seed Variety --</option>
                  {seeds.map((s) => (
                    <option key={s.idActive || s.barcode} value={s.barcode}>
                      {s.name} (Barcode: {s.barcode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Weight Required (Grams) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="weightReq"
                  value={formData.weightReq}
                  onChange={handleChange}
                  min="1"
                  required
                  placeholder="e.g. 250"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
            >
              {submitting ? "Submitting Request..." : "Submit Requisition"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddRequest;