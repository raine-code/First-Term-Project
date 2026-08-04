import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RequestCalendar = ({ role, reloadTrigger }) => {
    const [requests, setRequests] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const navigate = useNavigate();

    useEffect(() => {
        // Scoped safely inside useEffect to avoid hoisting errors
        const fetchRequests = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/requests/list");
                const responseData = await response.json();

                if (response.ok) {
                    const requestArray = responseData.data || responseData.requests || [];
                    setRequests(requestArray);
                }
            } catch (error) {
                console.error("Error fetching requests for calendar:", error);
            }
        };

        fetchRequests();
    }, [reloadTrigger]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const getRequestsForDay = (day) => {
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        return requests.filter(req => {
            if (req.deadlineDate !== dateString) return false;
            if (role?.toUpperCase() === "STAFF") {
                return req.status?.toUpperCase() === "APPROVED";
            }
            return req.status?.toUpperCase() !== "REJECTED" && req.status?.toUpperCase() !== "DISPATCHED";
        });
    };

    const renderDays = () => {
        const days = [];

        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="p-2 border border-gray-100 bg-gray-50"></div>);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dayRequests = getRequestsForDay(d);

            days.push(
                <div key={`day-${d}`} className="p-2 border border-gray-200 min-h-[100px] bg-white transition-colors hover:bg-gray-50">
                    <div className="font-semibold text-sm text-gray-700">{d}</div>
                    <div className="mt-1 space-y-1 overflow-y-auto max-h-[70px]">
                        {dayRequests.map(req => (
                            <div
                                key={req.idRequest}
                                onClick={() => role?.toUpperCase() === "STAFF" ? navigate(`/scanner/${req.idRequest}`) : null}
                                className={`text-xs p-1 rounded truncate cursor-pointer ${role?.toUpperCase() === "STAFF" ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : "bg-yellow-100 text-yellow-800"
                                    }`}
                                title={`Req #${req.idRequest} - ${req.Requester?.fName || 'Request'}`}
                            >
                                #{req.idRequest} {req.Requester?.fName}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return days;
    };

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 mt-6">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">Seed Processing Deadlines</h2>
                <div className="flex space-x-2">
                    <button onClick={handlePrevMonth} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100">&lt;</button>
                    <span className="px-3 py-1 font-semibold text-gray-700 w-40 text-center">{monthNames[month]} {year}</span>
                    <button onClick={handleNextMonth} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100">&gt;</button>
                </div>
            </div>

            <div className="grid grid-cols-7 bg-gray-100 border-b border-gray-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-gray-600 uppercase">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 bg-gray-200 gap-[1px]">
                {renderDays()}
            </div>
        </div>
    );
};

export default RequestCalendar;