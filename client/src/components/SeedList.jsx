import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SeedList = () => {
    const [seeds, setSeeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSeeds = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/requests/seeds-all");
                const result = await response.json();

                if (response.ok && result.success) {
                    setSeeds(result.data || []);
                } else {
                    setError("Failed to fetch seed inventory.");
                }
            } catch (err) {
                console.error("Error fetching seed list:", err);
                setError("Network error while loading seeds.");
            } finally {
                setLoading(false);
            }
        };

        fetchSeeds();
    }, []);

    const getAvailabilityBadge = (status) => {
        switch (status?.toUpperCase()) {
            case "AVAILABLE":
                return "bg-green-100 text-green-800 border-green-300";
            case "UNAVAILABLE":
                return "bg-red-100 text-red-800 border-red-300";
            case "RESERVED":
                return "bg-yellow-100 text-yellow-800 border-yellow-300";
            default:
                return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header Bar */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Seed Inventory</h1>
                    <p className="text-gray-500 mt-1">Manage active seed inventory and stock availability</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate("/add-seed")}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded shadow transition-colors"
                    >
                        Add New Seed
                    </button>
                    <button
                        onClick={() => navigate("/admin-dashboard")}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded shadow transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded text-sm">
                    {error}
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div className="text-center py-10 text-gray-500">Loading seed inventory...</div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">GID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Seed Name</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Current Weight (g)</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Viability</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Barcode</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Stock On-hand</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Availability</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {seeds.length > 0 ? (
                                seeds.map((seed) => (
                                    <tr key={seed.idActive} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{seed.idActive}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{seed.idFkGid || "N/A"}</td>
                                        <td className="px-4 py-3 text-sm font-semibold text-gray-800">{seed.name}</td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-700">{seed.currentWeight}</td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-700">{seed.viability}</td>
                                        <td className="px-4 py-3 text-sm font-mono text-blue-600">{seed.barcode}</td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-700">{seed.stockOnhand}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{seed.location || "N/A"}</td>
                                        <td className="px-4 py-3 text-sm text-center">
                                            <span className={`px-2 py-1 text-xs font-semibold border rounded-full ${getAvailabilityBadge(seed.availability)}`}>
                                                {seed.availability}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="px-6 py-6 text-center text-gray-500 text-sm">
                                        No active seeds found in inventory.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SeedList;