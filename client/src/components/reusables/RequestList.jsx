import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
// import {onStatusChange} from "../utils/onStatusChange";

const RequestList = ({ role, onRequestUpdate }) => {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [deadlines, setDeadlines] = useState({}) // Stores temporary date picker inputs
    const [reloadTrigger, setReloadTrigger] = useState(0) // Used to re-trigger useEffect safely
    const navigate = useNavigate()

    useEffect(() => {
        // Reverted: Declared inside useEffect to prevent TDZ hoisting errors
        const fetchRequests = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/requests/list")
                const responseData = await response.json()
                if (response.ok) {
                    const requestArray = responseData.data || responseData.requests || []
                    if (Array.isArray(requestArray)) {
                        setRequests(requestArray)

                        // Pre-fill local date picker state with existing DB deadlines
                        const initialDeadlines = {}
                        requestArray.forEach((req) => {
                            if (req.deadlineDate) {
                                initialDeadlines[req.idRequest] = req.deadlineDate
                            }
                        })
                        setDeadlines(initialDeadlines)
                    } else {
                        console.error("Backend did not return an array:", responseData)
                        setRequests([])
                    }
                }
            } catch (error) {
                console.error("Error fetching requests:", error)
                setRequests([])
            } finally {
                setLoading(false)
            }
        }

        fetchRequests()
    }, [reloadTrigger]) // Runs on mount or when reloadTrigger updates

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case "PENDING": return "bg-yellow-100 text-yellow-800"
            case "APPROVED": return "bg-green-100 text-green-800"
            case "REJECTED": return "bg-red-100 text-red-800"
            case "DISPATCHED": return "bg-blue-100 text-blue-800"
            default: return "bg-gray-100 text-gray-800"
        }
    }

    const handleDateChange = (idRequest, dateValue) => {
        setDeadlines((prev) => ({
            ...prev,
            [idRequest]: dateValue,
        }))
    }

    const handleSaveDeadline = async (idRequest) => {
        const selectedDate = deadlines[idRequest];
        if (!selectedDate) {
            alert("Please select a date first.");
            return;
        }

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
                alert(`Deadline set for Request #${idRequest}!`);

                // Refreshes the RequestList table
                setReloadTrigger((prev) => prev + 1);

                // 2. Triggers parent dashboard (Calendar + Daily Stats) to re-fetch!
                if (onRequestUpdate) {
                    onRequestUpdate();
                }
            } else {
                alert("Error: " + (data.error || "Failed to set deadline"));
            }
        } catch (err) {
            console.error("Failed to save deadline:", err);
            alert("Network error occurred.");
        }
    };

    const handleUpdateStatus = async (idRequest, newStatus) => {
        // Optional confirmation dialog
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
                alert(`Request #${idRequest} successfully ${newStatus}!`);

                // Refreshes the RequestList table
                setReloadTrigger((prev) => prev + 1);

                // 2. Triggers the parent dashboard / daily stats to re-fetch!
                if (onRequestUpdate) {
                    onRequestUpdate();
                }
            } else {
                alert("Error: " + (data.error || "Failed to update status"));
            }
        } catch (err) {
            console.error("Failed to update status:", err);
            alert("Network error occurred while updating status.");
        }
    };

    const handleOpenScanner = (request) => {
        // Navigate to the scanner page and pass the request data in the state
        navigate('/scanner', { state: { requestData: request } });
    };

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Loading requests...</div>
    }

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requestor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested Seed</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((request, index) => (
                        <tr key={request.idRequest || index} className="hover:bg-gray-50 transition-colors">

                            {/* Request ID */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                #{request.idRequest}
                            </td>

                            {/* Requestor Name */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {request.Requester
                                    ? `${request.Requester.fName} ${request.Requester.lName}`
                                    : "Unknown Requestor"}
                            </td>

                            {/* Requested Seed Name */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {request.RequestLineItems && request.RequestLineItems.length > 0 && request.RequestLineItems[0].Active
                                    ? request.RequestLineItems[0].Active.name
                                    : "Unknown Seed"}
                            </td>

                            {/* ADD THIS NEW COLUMN: Requested Quantity */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium text-blue-600">
                                {request.weightReq ? `${request.weightReq} grams` : "N/A"}
                            </td>

                            {/* Status Badge */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                                    {request.status || "PENDING"}
                                </span>
                            </td>

                            {/* Action Buttons & Admin Deadline Selector */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                {/* ADMIN VIEW */}
                                {role?.toUpperCase() === "ADMIN" && (
                                    <div className="flex flex-col md:flex-row items-center justify-center gap-2">
                                        {/* Admin Deadline Picker */}
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="date"
                                                value={deadlines[request.idRequest] || ""}
                                                onChange={(e) => handleDateChange(request.idRequest, e.target.value)}
                                                className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                                            />
                                            <button
                                                onClick={() => handleSaveDeadline(request.idRequest)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-colors"
                                            >
                                                Set Deadline
                                            </button>
                                        </div>

                                        {/* Approve / Reject Buttons (if Pending) */}
                                        {request.status?.toUpperCase() === "PENDING" && (
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleUpdateStatus(request.idRequest, "APPROVED")}
                                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition-colors"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(request.idRequest, "REJECTED")}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* STAFF VIEW */}
                                {role?.toUpperCase() === "STAFF" && request.status?.toUpperCase() === "APPROVED" && (
                                    <button
                                       
                                        onClick={() => navigate('/scanner', { state: { requestData: request } })}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors"
                                    >
                                        Open Scanner
                                    </button>
                                )}

                                {/* NO ACTIONS FALLBACK */}
                                {role?.toUpperCase() === "STAFF" && request.status?.toUpperCase() !== "APPROVED" && (
                                    <span className="text-gray-400 text-xs italic">No actions available</span>
                                )}
                            </td>
                        </tr>
                    ))}

                    {/* Empty State */}
                    {requests.length === 0 && (
                        <tr>
                            <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                No requests found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default RequestList