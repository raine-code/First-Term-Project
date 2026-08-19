import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import DailyStats from "./reusables/dailystats";
import RequestList from "./reusables/RequestList";
import RequestCalendar from "./reusables/RequestCalendar";
import { FaPlusCircle, FaBoxes } from "react-icons/fa";

const AdminDashboard = () => {
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

  // Function to refresh stats & calendar when a request status is changed or deadline updated
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
        {/* Welcome Header Box */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {currentDateFormatted}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : "Administrator"}! 👋
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Here is your seed inventory overview, pending orders, and processing timeline.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/add-request"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs hover:shadow transition-all"
            >
              <FaPlusCircle className="text-sm" />
              <span>Add Request</span>
            </Link>
            <Link
              to="/add-seed"
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs hover:shadow transition-all"
            >
              <FaBoxes className="text-sm" />
              <span>Register Seed</span>
            </Link>
          </div>
        </div>

        {/* Section 1: KPI Statistics */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              System Metrics
            </h2>
            <span className="text-xs text-slate-400">Auto-synced</span>
          </div>
          <DailyStats reloadTrigger={statsTrigger} />
        </section>

        {/* Section 2: Calendar Deadlines */}
        <section className="space-y-3">
          <RequestCalendar role="ADMIN" reloadTrigger={statsTrigger} />
        </section>

        {/* Section 3: Requisition Orders Table */}
        <section className="space-y-3">
          <RequestList
            role="ADMIN"
            onRequestUpdate={handleRefreshData}
            onStatusChange={handleRefreshData}
          />
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;