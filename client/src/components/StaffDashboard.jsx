import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import DailyStats from "./reusables/dailystats";
import RequestList from "./reusables/RequestList";
import RequestCalendar from "./reusables/RequestCalendar";

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [statsTrigger, setStatsTrigger] = useState(0);

  const getStoredUser = () => {
    try {
      const item = localStorage.getItem("user");
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  };

  const user = getStoredUser();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleRefreshData = () => {
    setStatsTrigger((prev) => prev + 1);
  };

  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {currentDateFormatted}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : "Staff Member"}! 👋
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Fulfill approved requests by clicking "Scan & Dispatch" on an approved order below.
            </p>
          </div>
        </div>

        {/* Section 1: KPI Statistics */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Operations Overview
            </h2>
            <span className="text-xs text-slate-400">Live Status</span>
          </div>
          <DailyStats reloadTrigger={statsTrigger} />
        </section>

        {/* Section 2: Calendar Deadlines */}
        <section className="space-y-3">
          <RequestCalendar role="STAFF" reloadTrigger={statsTrigger} />
        </section>

        {/* Section 3: Approved Requisition Orders */}
        <section className="space-y-3">
          <RequestList
            role="STAFF"
            onRequestUpdate={handleRefreshData}
            onStatusChange={handleRefreshData}
          />
        </section>
      </main>
    </div>
  );
};

export default StaffDashboard;