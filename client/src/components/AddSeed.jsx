import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
                alert("New seed registered successfully!");
                navigate("/seeds");
            } else {
                setError(result.error || "Failed to register seed.");
            }
        } catch (err) {
            console.error("Error submitting seed:", err);
            setError("Network error occurred while submitting.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-8 border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Register New Seed</h1>
                    <button
                        onClick={() => navigate("/seeds")}
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
                    {/* SEED BASIC DETAILS */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                        <h2 className="text-md font-semibold text-gray-700 border-b pb-2">Seed Identification</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Seed Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. NSIC Rc 60"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Barcode *</label>
                                <input
                                    type="text"
                                    name="barcode"
                                    value={formData.barcode}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. 2023-01-0001-1"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Accession Number</label>
                                <input
                                    type="string"
                                    name="accNo"
                                    value={formData.accNo}
                                    onChange={handleChange}
                                    placeholder="e.g. PRRI000001"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location / Rack</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. T679"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* STOCK & METRICS */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                        <h2 className="text-md font-semibold text-gray-700 border-b pb-2">Stock & Viability Metrics</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Weight (grams) *</label>
                                <input
                                    type="number"
                                    name="currentWeight"
                                    value={formData.currentWeight}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. 65"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock On-hand *</label>
                                <input
                                    type="number"
                                    name="stockOnhand"
                                    value={formData.stockOnhand}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. 90"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Viability *</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="viability"
                                    value={formData.viability}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. 9.9"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Availability *</label>
                                <select
                                    name="availability"
                                    value={formData.availability}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
                                >
                                    <option value="AVAILABLE">AVAILABLE</option>
                                    <option value="UNAVAILABLE">UNAVAILABLE</option>
                                    <option value="RESERVED">RESERVED</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors shadow"
                    >
                        {submitting ? "Registering Seed..." : "Register Seed"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddSeed;