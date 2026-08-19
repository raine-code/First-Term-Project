import { useState, useEffect } from "react";
import { FaCheckCircle, FaPaperPlane, FaBoxes, FaClock } from "react-icons/fa";

const DailyStats = ({ reloadTrigger }) => {
  const [stats, setStats] = useState({
    approvedSeeds: 0,
    distributedSeeds: 0,
    totalSeedPackets: 0,
    currentRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDailyStats = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/requests/stats");
        const result = await response.json();

        if (isMounted && response.ok && result.success && result.data) {
          setStats({
            approvedSeeds: result.data.approvedSeeds ?? 0,
            distributedSeeds: result.data.distributedSeeds ?? 0,
            totalSeedPackets: result.data.totalSeedPackets ?? 0,
            currentRequests: result.data.currentRequests ?? 0,
          });
        }
      } catch (error) {
        console.warn("Could not load daily stats from server, showing default stats:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDailyStats();
    return () => {
      isMounted = false;
    };
  }, [reloadTrigger]);

  const statCards = [
    {
      title: "Approved Seeds",
      value: stats.approvedSeeds,
      subtext: "Ready for processing",
      icon: <FaCheckCircle className="text-emerald-600 text-xl" />,
      iconBg: "bg-emerald-50 border border-emerald-100",
      accentBorder: "border-l-emerald-500",
    },
    {
      title: "Distributed Seeds",
      value: stats.distributedSeeds,
      subtext: "Successfully dispatched",
      icon: <FaPaperPlane className="text-blue-600 text-xl" />,
      iconBg: "bg-blue-50 border border-blue-100",
      accentBorder: "border-l-blue-500",
    },
    {
      title: "Total Seed Packets",
      value: stats.totalSeedPackets,
      subtext: "In active bank inventory",
      icon: <FaBoxes className="text-indigo-600 text-xl" />,
      iconBg: "bg-indigo-50 border border-indigo-100",
      accentBorder: "border-l-indigo-500",
    },
    {
      title: "Pending Requests",
      value: stats.currentRequests,
      subtext: "Requires admin review",
      icon: <FaClock className="text-amber-600 text-xl" />,
      iconBg: "bg-amber-50 border border-amber-100",
      accentBorder: "border-l-amber-500",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 bg-white p-5 rounded-xl border border-slate-200 shadow-xs animate-pulse flex items-center justify-between"
          >
            <div className="space-y-2">
              <div className="h-3 w-24 bg-slate-200 rounded"></div>
              <div className="h-7 w-16 bg-slate-300 rounded"></div>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, idx) => (
        <div
          key={idx}
          className={`bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 border-l-4 ${card.accentBorder} flex items-center justify-between group`}
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {card.title}
            </p>
            <p className="text-2xl font-bold text-slate-800 tracking-tight">
              {card.value.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">{card.subtext}</p>
          </div>
          <div
            className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center shadow-xs transition-transform group-hover:scale-110`}
          >
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DailyStats;