// src/components/AddRequest.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
        municipalityId: "", // Changed from 'municipality' text
        seedBarcode: "",
        weightReq: "",
        studyTitle: "", // New state field
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Fetch available seed packets and registered municipalities for selection
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [seedsResponse, muniResponse] = await Promise.all([
                    fetch("http://localhost:3000/api/requests/seeds-list"),
                    fetch("http://localhost:3000/api/requests/municipalities")
                ]);

                const seedsResult = await seedsResponse.json();
                const muniResult = await muniResponse.json();

                if (seedsResponse.ok && seedsResult.success) {
                    setSeeds(seedsResult.data || []);
                } else {
                    setError("Failed to load available seeds.");
                }

                if (muniResponse.ok && muniResult.success) {
                    setMunicipalities(muniResult.data || []);
                } else {
                    setError("Failed to load registered municipalities.");
                }
            } catch (err) {
                console.error("Error loading dropdown data:", err);
                setError("Network error while loading form data.");
            } finally {
                setLoadingSelects(false);
            }
        };
        fetchDropdownData();
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
                alert("New request created successfully!");
                navigate("/admin-dashboard");
            } else {
                setError(result.error || "Failed to create request.");
            }
        } catch (err) {
            console.error("Error submitting request:", err);
            setError("Network error occurred while submitting.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Create New Request</h1>
                    <button
                        onClick={() => navigate("/admin-dashboard")}
                        className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded transition-colors"
                    >
                        Cancel
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* REQUESTER INFORMATION */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                        <h2 className="text-md font-semibold text-gray-700 border-b pb-2">
                            Requester Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                <input
                                    type="text"
                                    name="fName"
                                    value={formData.fName}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                                <input
                                    type="text"
                                    name="lName"
                                    value={formData.lName}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Agency</label>
                                <input
                                    type="text"
                                    name="agency"
                                    value={formData.agency}
                                    onChange={handleChange}
                                    placeholder="e.g. Bureau of Agriculture"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    name="emailAdd"
                                    value={formData.emailAdd}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Municipality / Town *</label>
                                <select
                                    name="municipalityId"
                                    value={formData.municipalityId}
                                    onChange={handleChange}
                                    required
                                    disabled={loadingSelects}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
                                >
                                    <option value="">-- Select Municipality --</option>
                                    {municipalities.map((m) => (
                                        <option key={m.idMunicipality} value={m.idMunicipality}>
                                            {m.town} {m.province && m.province !== 'N/A' ? `(${m.province})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* REQUEST DETAILS */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                        <h2 className="text-md font-semibold text-gray-700 border-b pb-2">Seed Request Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Study Title *</label>
                                <input
                                    type="text"
                                    name="studyTitle"
                                    value={formData.studyTitle}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. The Ripple of Conflict"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Requested Seed *</label>
                                <select
                                    name="seedBarcode"
                                    value={formData.seedBarcode}
                                    onChange={handleChange}
                                    required
                                    disabled={loadingSelects}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
                                >
                                    <option value="">-- Select Seed --</option>
                                    {seeds.map((s) => (
                                        <option key={s.idActive || s.barcode} value={s.barcode}>
                                            {s.name} (Barcode: {s.barcode})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Weight Required (grams) *</label>
                                <input
                                    type="number"
                                    name="weightReq"
                                    value={formData.weightReq}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                    placeholder="e.g. 500"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors shadow"
                    >
                        {submitting ? "Submitting Request..." : "Submit Request"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddRequest;