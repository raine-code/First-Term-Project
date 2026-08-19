import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaFilter,
  FaCheck,
  FaTimes,
  FaCalendarCheck,
  FaQrcode,
  FaClipboardList,
  FaRegCalendarAlt,
} from "react-icons/fa";

const RequestList = ({ role, onRequestUpdate, onStatusChange }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deadlines, setDeadlines] = useState({});
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [savingDeadlineId, setSavingDeadlineId] = useState(null);

  const navigate = useNavigate();
  const isAdmin = role?.toUpperCase() === "ADMIN";
  const isStaff = role?.toUpperCase() === "STAFF";

  useEffect(() => {
    let isMounted = true;
    const fetchRequests = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/requests/list");
        const responseData = await response.json();
        if (isMounted && response.ok) {
          const requestArray = responseData.data || responseData.requests || [];
          if (Array.isArray(requestArray)) {
            setRequests(requestArray);

            const initialDeadlines = {};
            requestArray.forEach((req) => {
              if (req.deadlineDate) {
                initialDeadlines[req.idRequest] = req.deadlineDate;
              }
            });
            setDeadlines(initialDeadlines);
          } else {
            setRequests([]);
          }
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
        if (isMounted) setRequests([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRequests();
    return () => {
      isMounted = false;
    };
  }, [reloadTrigger]);

  const triggerRefresh = () => {
    setReloadTrigger((prev) => prev + 1);
    if (onRequestUpdate) onRequestUpdate();
    if (onStatusChange) onStatusChange();
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pending
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Rejected
          </span>
        );
      case "DISPATCHED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Dispatched
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {status || "UNKNOWN"}
          </span>
        );
    }
  };

  const handleDateChange = (idRequest, dateValue) => {
    setDeadlines((prev) => ({
      ...prev,
      [idRequest]: dateValue,
    }));
  };

  const handleSaveDeadline = async (idRequest) => {
    const selectedDate = deadlines[idRequest];
    if (!selectedDate) {
      alert("Please select a valid date first.");
      return;
    }

    setSavingDeadlineId(idRequest);
    try {
      const response = await fetch("http://localhost:3000/api/requests/set-deadline", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idRequest,
          deadlineDate: selectedDate,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        triggerRefresh();
      } else {
        alert("Error: " + (data.error || "Failed to set deadline"));
      }
    } catch (err) {
      console.error("Failed to save deadline:", err);
      alert("Network error occurred.");
    } finally {
      setSavingDeadlineId(null);
    }
  };

  const handleUpdateStatus = async (idRequest, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark Request #${idRequest} as ${newStatus}?`)) {
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/requests/update-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idRequest, status: newStatus }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        triggerRefresh();
      } else {
        alert("Error: " + (data.error || "Failed to update status"));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Network error occurred while updating status.");
    }
  };

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        req.status?.toUpperCase() === statusFilter.toUpperCase();

      const requesterName = req.Requester
        ? `${req.Requester.fName || ""} ${req.Requester.lName || ""}`.toLowerCase()
        : "";
      const seedName =
        req.RequestLineItems && req.RequestLineItems.length > 0 && req.RequestLineItems[0].Active
          ? (req.RequestLineItems[0].Active.name || "").toLowerCase()
          : "";
      const idStr = String(req.idRequest || "");

      const matchesSearch =
        idStr.includes(searchTerm.toLowerCase()) ||
        requesterName.includes(searchTerm.toLowerCase()) ||
        seedName.includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [requests, statusFilter, searchTerm]);

  // Counts for filter pills
  const statusCounts = useMemo(() => {
    const counts = { ALL: requests.length, PENDING: 0, APPROVED: 0, DISPATCHED: 0, REJECTED: 0 };
    requests.forEach((r) => {
      const st = r.status?.toUpperCase();
      if (counts[st] !== undefined) counts[st]++;
    });
    return counts;
  }, [requests]);

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      {/* Header with Search and Filter Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
              <FaClipboardList className="text-base" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Seed Requisition Orders</h3>
              <p className="text-xs text-slate-500">
                Manage requests, assign deadline schedules, and track dispatch status
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search ID, requester, seed..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {["ALL", "PENDING", "APPROVED", "DISPATCHED", "REJECTED"].map((tab) => {
            const active = statusFilter === tab;
            const count = statusCounts[tab] || 0;
            return (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                  active
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/60"
                }`}
              >
                <span>{tab.charAt(0) + tab.slice(1).toLowerCase()}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    active ? "bg-slate-700 text-slate-200" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3">Order ID</th>
              <th className="px-5 py-3">Requester & Agency</th>
              <th className="px-5 py-3">Requested Seed</th>
              <th className="px-5 py-3 text-right">Required Grams</th>
              <th className="px-5 py-3 text-center">Status</th>
              <th className="px-5 py-3 text-center">Deadline / Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-sm">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-slate-400 text-xs">
                  Loading requisition requests...
                </td>
              </tr>
            ) : filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <FaClipboardList className="text-3xl mb-2 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No requests found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Try adjusting your search query or filter tab.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRequests.map((request) => {
                const requesterName = request.Requester
                  ? `${request.Requester.fName || ""} ${request.Requester.lName || ""}`.trim()
                  : "N/A";
                const seedName =
                  request.RequestLineItems &&
                  request.RequestLineItems.length > 0 &&
                  request.RequestLineItems[0].Active
                    ? request.RequestLineItems[0].Active.name
                    : "Unspecified Seed";

                return (
                  <tr key={request.idRequest} className="hover:bg-slate-50/70 transition-colors">
                    {/* ID */}
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono font-bold text-slate-900 text-xs">
                      #{request.idRequest}
                    </td>

                    {/* Requester */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-800 text-xs">{requesterName}</div>
                      <div className="text-[11px] text-slate-400">
                        {request.Requester?.agency || "Individual / Private"}
                      </div>
                    </td>

                    {/* Seed Name */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-medium text-slate-700 text-xs">{seedName}</div>
                      {request.studyTitle && (
                        <div className="text-[11px] text-slate-400 truncate max-w-[180px]" title={request.studyTitle}>
                          Study: {request.studyTitle}
                        </div>
                      )}
                    </td>

                    {/* Quantity */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-semibold text-emerald-700 font-mono">
                      {request.weightReq ? `${request.weightReq}g` : "N/A"}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-center">
                      {getStatusBadge(request.status)}
                    </td>

                    {/* Action Buttons */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* ADMIN ACTIONS */}
                        {isAdmin && (
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            {/* Deadline Picker */}
                            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
                              <input
                                type="date"
                                value={deadlines[request.idRequest] || ""}
                                onChange={(e) => handleDateChange(request.idRequest, e.target.value)}
                                className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                              <button
                                onClick={() => handleSaveDeadline(request.idRequest)}
                                disabled={savingDeadlineId === request.idRequest}
                                title="Set deadline"
                                className="bg-slate-800 hover:bg-slate-900 text-white px-2.5 py-1 rounded text-xs font-semibold transition-colors disabled:opacity-50"
                              >
                                {savingDeadlineId === request.idRequest ? "..." : "Set"}
                              </button>
                            </div>

                            {/* Approve / Reject */}
                            {request.status?.toUpperCase() === "PENDING" && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleUpdateStatus(request.idRequest, "APPROVED")}
                                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                                >
                                  <FaCheck className="text-[10px]" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(request.idRequest, "REJECTED")}
                                  className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                                >
                                  <FaTimes className="text-[10px]" />
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* STAFF ACTIONS */}
                        {isStaff && (
                          <>
                            {request.status?.toUpperCase() === "APPROVED" ? (
                              <button
                                onClick={() => navigate("/scanner", { state: { requestData: request } })}
                                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                              >
                                <FaQrcode className="text-xs" />
                                <span>Scan & Dispatch</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                {request.status?.toUpperCase() === "DISPATCHED"
                                  ? "Completed"
                                  : "Awaiting approval"}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestList;