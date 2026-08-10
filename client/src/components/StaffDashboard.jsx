import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import DailyStats from "./reusables/dailystats"
import RequestList from "./reusables/RequestList"
import RequestCalendar from "./reusables/RequestCalendar"



const StaffDashboard = () => {
    const navigate = useNavigate()

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
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition-colors"
                >
                    Logout
                </button>
            </div>

            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Daily Statistic</h2>
                <DailyStats/>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Deadlines</h2>
                <RequestCalendar role={user?.role} />
            </div>

            <div>
                Request List Component Here
                <RequestList role={user?.role} />
            </div>
        </div>
    )
}

export default StaffDashboard