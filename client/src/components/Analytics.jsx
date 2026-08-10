import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AnalyticsPage = () => {
    // 1. ADD topLocations and topAgencies to state
    const [analytics, setAnalytics] = useState({
        topSeeds: [],
        topRequesters: [],
        topLocations: [],
        topAgencies: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/requests/analytics");
                const result = await response.json();

                console.log("Backend Response:", result);

                if (response.ok && result.success) {
                    // 2. UPDATE state setter
                    setAnalytics({
                        topSeeds: result.data?.topSeeds || [],
                        topRequesters: result.data?.topRequesters || [],
                        topLocations: result.data?.topLocations || [],
                        topAgencies: result.data?.topAgencies || [],
                    });
                } else {
                    setError("Failed to fetch analytics data.");
                }
            } catch (error) {
                console.error("Error fetching analytics:", error);
                setError("Network error occurred while fetching analytics.");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    return (
        <div className="m-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Operation Analytics</h1>
                    <p className="text-gray-600 mt-1">Overview of seed distribution and request trends</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded shadow transition-colors"
                >
                    Back to Dashboard
                </button>
            </div>

            {loading ? (
                <div className="text-center text-gray-500 mt-10">Loading analytics...</div>
            ) : error ? (
                <div className="text-center text-red-500 mt-10">{error}</div>
            ) : (
                <div className="space-y-8">
                    {/* ROW 1: EXISTING CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Card 1: Most Requested Seeds */}
                        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                            <div className="bg-purple-50 p-4 border-b border-gray-200">
                                <h2 className="text-lg font-bold text-purple-800">Most Requested Seeds</h2>
                            </div>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seed Name</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Requests</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {analytics.topSeeds.length > 0 ? (
                                        analytics.topSeeds.map((seed, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {seed.seedName || "Unknown Seed"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700 font-bold">
                                                    {seed.requestCount || 0}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="2" className="px-6 py-4 text-center text-sm text-gray-500">
                                                No data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Card 2: Top Requesters */}
                        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                            <div className="bg-blue-50 p-4 border-b border-gray-200">
                                <h2 className="text-lg font-bold text-blue-800">Top Requesters (Seeds Distributed)</h2>
                            </div>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requester Name</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Dispatched Count</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {analytics.topRequesters.length > 0 ? (
                                        analytics.topRequesters.map((req, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {req.fName || "Unknown"} {req.lName || "User"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-bold">
                                                    {req.distributedCount || 0}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="2" className="px-6 py-4 text-center text-sm text-gray-500">
                                                No data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ROW 2: NEW DEMAND GEOGRAPHY CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Card 3: Demand by Location */}
                        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                            <div className="bg-amber-50 p-4 border-b border-gray-200">
                                <h2 className="text-lg font-bold text-amber-800">Demand by Province/Town</h2>
                            </div>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Requests</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {analytics.topLocations.length > 0 ? (
                                        analytics.topLocations.map((loc, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {loc.location}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700 font-bold">
                                                    {loc.count || 0}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="2" className="px-6 py-4 text-center text-sm text-gray-500">
                                                No data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Card 4: Top Agencies */}
                        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                            <div className="bg-teal-50 p-4 border-b border-gray-200">
                                <h2 className="text-lg font-bold text-teal-800">Top Requesting Agencies</h2>
                            </div>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agency Name</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Requests</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {analytics.topAgencies.length > 0 ? (
                                        analytics.topAgencies.map((ag, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {ag.agency}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700 font-bold">
                                                    {ag.count || 0}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="2" className="px-6 py-4 text-center text-sm text-gray-500">
                                                No data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;