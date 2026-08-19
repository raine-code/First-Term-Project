import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import {
  FaChartBar,
  FaSeedling,
  FaUsers,
  FaMapMarkerAlt,
  FaBuilding,
  FaArrowLeft,
  FaExclamationCircle,
} from "react-icons/fa";

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState({
    topSeeds: [],
    topRequesters: [],
    topLocations: [],
    topAgencies: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/requests/analytics");
        const result = await response.json();

        if (isMounted && response.ok && result.success) {
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
        if (isMounted) setError("Network error occurred while fetching analytics.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  const getMaxVal = (arr, key) => {
    if (!arr || arr.length === 0) return 1;
    return Math.max(...arr.map((item) => Number(item[key]) || 0), 1);
  };

  const topSeedMax = getMaxVal(analytics.topSeeds, "requestCount");
  const topReqMax = getMaxVal(analytics.topRequesters, "distributedCount");
  const topLocMax = getMaxVal(analytics.topLocations, "count");
  const topAgMax = getMaxVal(analytics.topAgencies, "count");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
              <FaChartBar className="text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Operations & Requisition Analytics
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Insights into demand trends, active varieties, regional distribution, and top partner agencies
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs transition-all"
          >
            <FaArrowLeft className="text-xs text-slate-400" />
            <span>Back to Previous</span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-2">
            <FaExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-64 bg-white rounded-2xl border border-slate-200 p-6 animate-pulse"
              >
                <div className="h-4 w-32 bg-slate-200 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-8 bg-slate-100 rounded"></div>
                  <div className="h-8 bg-slate-100 rounded"></div>
                  <div className="h-8 bg-slate-100 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Most Requested Seeds */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <FaSeedling className="text-base" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Most Requested Seeds</h2>
                  <p className="text-[11px] text-slate-400">Total orders by seed variety</p>
                </div>
              </div>
              <div className="p-5 flex-1 space-y-4">
                {analytics.topSeeds.length > 0 ? (
                  analytics.topSeeds.map((seed, idx) => {
                    const count = seed.requestCount || 0;
                    const pct = Math.round((count / topSeedMax) * 100);
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span className="truncate pr-2">
                            {idx + 1}. {seed.seedName || "Unknown Seed"}
                          </span>
                          <span className="font-mono text-emerald-700">{count} orders</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">No seed request data available yet.</p>
                )}
              </div>
            </div>

            {/* Card 2: Top Requesters */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <FaUsers className="text-base" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Top Requesters (Distributed)</h2>
                  <p className="text-[11px] text-slate-400">Researchers and recipients by successful orders</p>
                </div>
              </div>
              <div className="p-5 flex-1 space-y-4">
                {analytics.topRequesters.length > 0 ? (
                  analytics.topRequesters.map((req, idx) => {
                    const count = req.distributedCount || 0;
                    const pct = Math.round((count / topReqMax) * 100);
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span className="truncate pr-2">
                            {idx + 1}. {req.fName || ""} {req.lName || "User"}
                          </span>
                          <span className="font-mono text-blue-700">{count} dispatched</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">No distributed requester data available yet.</p>
                )}
              </div>
            </div>

            {/* Card 3: Demand by Location */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <FaMapMarkerAlt className="text-base" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Demand by Province / Town</h2>
                  <p className="text-[11px] text-slate-400">Requisitions grouped by geographic region</p>
                </div>
              </div>
              <div className="p-5 flex-1 space-y-4">
                {analytics.topLocations.length > 0 ? (
                  analytics.topLocations.map((loc, idx) => {
                    const count = loc.count || 0;
                    const pct = Math.round((count / topLocMax) * 100);
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span className="truncate pr-2">
                            {idx + 1}. {loc.location}
                          </span>
                          <span className="font-mono text-amber-700">{count} requests</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">No location demand data available yet.</p>
                )}
              </div>
            </div>

            {/* Card 4: Top Requesting Agencies */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                  <FaBuilding className="text-base" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Top Requesting Agencies</h2>
                  <p className="text-[11px] text-slate-400">Government departments, universities, & institutes</p>
                </div>
              </div>
              <div className="p-5 flex-1 space-y-4">
                {analytics.topAgencies.length > 0 ? (
                  analytics.topAgencies.map((ag, idx) => {
                    const count = ag.count || 0;
                    const pct = Math.round((count / topAgMax) * 100);
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span className="truncate pr-2">
                            {idx + 1}. {ag.agency}
                          </span>
                          <span className="font-mono text-teal-700">{count} requests</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">No agency request data available yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AnalyticsPage;