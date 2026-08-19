import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaClock } from "react-icons/fa";

const RequestCalendar = ({ role, reloadTrigger }) => {
  const [requests, setRequests] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isStaff = role?.toUpperCase() === "STAFF";

  useEffect(() => {
    let isMounted = true;
    const fetchRequests = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/requests/list");
        const responseData = await response.json();

        if (isMounted && response.ok) {
          const requestArray = responseData.data || responseData.requests || [];
          setRequests(Array.isArray(requestArray) ? requestArray : []);
        }
      } catch (error) {
        console.warn("Error fetching requests for calendar:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRequests();
    return () => {
      isMounted = false;
    };
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
  const handleToday = () => setCurrentDate(new Date());

  const today = new Date();
  const isToday = (day) => {
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const getRequestsForDay = (day) => {
    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    return requests.filter((req) => {
      if (req.deadlineDate !== dateString) return false;
      if (isStaff) {
        return req.status?.toUpperCase() === "APPROVED";
      }
      return req.status?.toUpperCase() !== "REJECTED";
    });
  };

  const getStatusBadgeStyle = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200";
      case "PENDING":
        return "bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200";
      case "DISPATCHED":
        return "bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  const renderDays = () => {
    const days = [];

    // Empty cells for days before the 1st
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="p-2 min-h-[90px] bg-slate-50/50 border border-slate-100 text-slate-300"
        />
      );
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dayRequests = getRequestsForDay(d);
      const currentDay = isToday(d);

      days.push(
        <div
          key={`day-${d}`}
          className={`p-2 border border-slate-100 min-h-[95px] transition-colors flex flex-col justify-between ${
            currentDay ? "bg-emerald-50/30" : "bg-white hover:bg-slate-50/80"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-semibold inline-flex items-center justify-center ${
                currentDay
                  ? "w-6 h-6 rounded-full bg-emerald-600 text-white font-bold"
                  : "text-slate-700"
              }`}
            >
              {d}
            </span>
            {dayRequests.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                {dayRequests.length}
              </span>
            )}
          </div>

          <div className="mt-1.5 space-y-1 overflow-y-auto max-h-[62px] pr-0.5">
            {dayRequests.map((req) => (
              <div
                key={req.idRequest}
                onClick={() => {
                  if (isStaff && req.status?.toUpperCase() === "APPROVED") {
                    navigate("/scanner", { state: { requestData: req } });
                  }
                }}
                className={`text-[11px] px-1.5 py-0.5 rounded font-medium truncate cursor-pointer transition-all shadow-2xs ${getStatusBadgeStyle(
                  req.status
                )}`}
                title={`Req #${req.idRequest} - ${req.Requester?.fName || "Requestor"} (${req.status})`}
              >
                #{req.idRequest} {req.Requester?.fName ? `${req.Requester.fName}` : "Req"}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-100/70 text-emerald-700">
            <FaCalendarAlt className="text-base" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Seed Processing Deadlines</h3>
            <p className="text-xs text-slate-500">Track target dates for seed preparation and dispatch</p>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous Month"
              className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <FaChevronLeft className="text-xs" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 min-w-[120px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              aria-label="Next Month"
              className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <FaChevronRight className="text-xs" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-px bg-slate-200">
        {renderDays()}
      </div>

      {/* Legend footer */}
      <div className="px-4 py-2.5 bg-slate-50/50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            Approved
          </span>
          {!isStaff && (
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              Pending
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            Dispatched
          </span>
        </div>
        {isStaff && (
          <span className="text-[11px] text-blue-600 font-medium">
            💡 Click on an approved request pill to scan barcode
          </span>
        )}
      </div>
    </div>
  );
};

export default RequestCalendar;