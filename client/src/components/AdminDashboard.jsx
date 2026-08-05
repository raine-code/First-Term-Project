import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import DailyStats from "./reusables/dailystats"
import RequestList from "./reusables/RequestList"
import RequestCalendar from "./reusables/RequestCalendar"


const AdminDashboard = () => {
  const navigate = useNavigate()
  const [reloadTrigger] = useState(0);

  const [user] = useState(() => {
    const storedUser = localStorage.getItem("user")
    return storedUser ? JSON.parse(storedUser) : null
  })

  useEffect(() => {
    if (!user) {
      navigate("/")
    }
  }, [user, navigate])

  const handleLogout = () => {
    localStorage.clear()
    navigate("/")
  }

  const [statsTrigger, setStatsTrigger] = useState(0);

  // Function to refresh stats when a request action occurs
  const handleRefreshStats = () => {
    setStatsTrigger((prev) => prev + 1);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            Welcome back, {user ? `${user.firstName} ${user.lastName}` : "User"}! 👋
          </h1>
          <p className="text-xl text-gray-500">
            Logged in as: <span className="font-semibold text-green-600">{user?.role}</span>
          </p>
        </div>
        <button
          onClick={() => navigate('/analytics')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-sm font-medium shadow transition-colors"
        >
          Analytics
        </button>
        <button
          onClick={() => navigate('/add-request')}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded text-sm font-medium shadow transition-colors"
        >
          Add Request
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition-colors"
        >
          Logout
        </button>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Daily Statistic</h2>
        <DailyStats reloadTrigger={statsTrigger} />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Deadlines</h2>
      
        {/* 1. Pass reloadTrigger to Calendar */}
        <RequestCalendar reloadTrigger={reloadTrigger} />
      </div>

      <div className="p-6 space-y-6">
        {/* 1. Pass statsTrigger to your stats component so it re-fetches in its useEffect */}

        {/* 2. Pass handleRefreshStats as onStatusChange to RequestList */}
        <RequestList role="ADMIN" onStatusChange={handleRefreshStats} />
      </div>

    </div>
  )
}

export default AdminDashboard