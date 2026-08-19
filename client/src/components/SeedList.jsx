import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import {
  FaBoxes,
  FaPlusCircle,
  FaSearch,
  FaExclamationCircle,
} from "react-icons/fa";

const SeedList = () => {
  const [seeds, setSeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("ALL");
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchSeeds = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/requests/seeds-all");
        const result = await response.json();

        if (isMounted) {
          if (response.ok) {
            const list = Array.isArray(result)
              ? result
              : result.data || result.seeds || [];
            setSeeds(Array.isArray(list) ? list : []);
          } else {
            setError("Failed to fetch seed inventory.");
          }
        }
      } catch (err) {
        console.error("Error fetching seed list:", err);
        if (isMounted) setError("Network error while loading seeds.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSeeds();
    return () => {
      isMounted = false;
    };
  }, []);

  // Helper function to safely extract Accession / GID string without crashing React
  const getAccNoDisplay = (seed) => {
    if (!seed) return "N/A";
    if (seed.Gid && typeof seed.Gid === "object" && seed.Gid.accNo) {
      return String(seed.Gid.accNo);
    }
    if (seed.idFkGid && typeof seed.idFkGid === "object" && seed.idFkGid.accNo) {
      return String(seed.idFkGid.accNo);
    }
    if (typeof seed.idFkGid === "string" || typeof seed.idFkGid === "number") {
      return String(seed.idFkGid);
    }
    if (typeof seed.accNo === "string" || typeof seed.accNo === "number") {
      return String(seed.accNo);
    }
    return "N/A";
  };

  const getAvailabilityBadge = (status) => {
    const s = typeof status === "string" ? status.toUpperCase() : "AVAILABLE";
    switch (s) {
      case "AVAILABLE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Available
          </span>
        );
      case "UNAVAILABLE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Unavailable
          </span>
        );
      case "RESERVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Reserved
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {s}
          </span>
        );
    }
  };

  const filteredSeeds = useMemo(() => {
    if (!Array.isArray(seeds)) return [];
    return seeds.filter((seed) => {
      if (!seed) return false;
      const statusStr = typeof seed.availability === "string" ? seed.availability : "";
      const matchesAvailability =
        availabilityFilter === "ALL" ||
        statusStr.toUpperCase() === availabilityFilter.toUpperCase();

      const name = typeof seed.name === "string" ? seed.name.toLowerCase() : "";
      const barcode = typeof seed.barcode === "string" ? seed.barcode.toLowerCase() : "";
      const accNo = getAccNoDisplay(seed).toLowerCase();
      const location = typeof seed.location === "string" ? seed.location.toLowerCase() : "";
      const query = searchTerm.toLowerCase();

      const matchesSearch =
        name.includes(query) ||
        barcode.includes(query) ||
        accNo.includes(query) ||
        location.includes(query);

      return matchesAvailability && matchesSearch;
    });
  }, [seeds, availabilityFilter, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
              <FaBoxes className="text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Seed Inventory & Genebank Stock
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Manage physical accessions, seed viability ratings, and warehouse bin locations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/add-seed"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs hover:shadow transition-all"
            >
              <FaPlusCircle className="text-sm" />
              <span>Register Seed</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-2">
            <FaExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search seed name, barcode, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium mr-1 hidden md:inline">Filter Status:</span>
            {["ALL", "AVAILABLE", "RESERVED", "UNAVAILABLE"].map((tab) => {
              const active = availabilityFilter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setAvailabilityFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    active
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/60"
                  }`}
                >
                  {tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Seed ID</th>
                  <th className="px-5 py-3">Accession / GID</th>
                  <th className="px-5 py-3">Variety / Seed Name</th>
                  <th className="px-5 py-3 text-right">Stock Weight (g)</th>
                  <th className="px-5 py-3 text-right">Viability</th>
                  <th className="px-5 py-3">Barcode</th>
                  <th className="px-5 py-3 text-right">Packets</th>
                  <th className="px-5 py-3">Bin Location</th>
                  <th className="px-5 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-slate-400 text-xs">
                      Loading inventory items...
                    </td>
                  </tr>
                ) : filteredSeeds.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <FaBoxes className="text-3xl mb-2 text-slate-300" />
                        <p className="text-sm font-medium text-slate-600">No seeds matched your criteria</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Try searching for another keyword or clear your filter.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSeeds.map((seed, index) => (
                    <tr
                      key={
                        typeof seed.idActive === "number" || typeof seed.idActive === "string"
                          ? seed.idActive
                          : index
                      }
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap font-mono text-xs text-slate-900 font-bold">
                        #{seed.idActive ?? index + 1}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500 font-mono">
                        {getAccNoDisplay(seed)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-800">
                        {typeof seed.name === "string" ? seed.name : "Unspecified"}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-mono font-bold text-slate-700">
                        {seed.currentWeight ?? 0} g
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-mono text-slate-600">
                        {seed.viability ?? "N/A"}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs font-mono text-emerald-600 font-medium">
                        {seed.barcode ?? "N/A"}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-mono text-slate-700">
                        {seed.stockOnhand ?? 0}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-600">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                          {typeof seed.location === "string" ? seed.location : "Default Bin"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-center">
                        {getAvailabilityBadge(seed.availability)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SeedList;