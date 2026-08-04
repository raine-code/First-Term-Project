import { useState, useEffect } from "react"

const DailyStats = ({ reloadTrigger }) => {
    const [stats, setStats] = useState(null);
   
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDailyStats = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/requests/stats")
                const result = await response.json()

                if (response.ok && result.success) {
                    setStats(result.data)
                }
            } catch (error) {
                console.error("Error loading daily stats:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchDailyStats();
    }, [reloadTrigger]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-28 bg-gray-100 animate-pulse rounded-lg border border-gray-200"></div>
                ))}
            </div>
        )
    }

    const statCards = [
        {
            title: "Approved Seeds",
            value: stats.approvedSeeds,
            bgColor: "bg-green-50",
            textColor: "text-green-700",
            borderColor: "border-green-200",
            iconBg: "bg-green-500",
            icon: (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            ),
        },
        {
            title: "Distributed Seeds",
            value: stats.distributedSeeds,
            bgColor: "bg-blue-50",
            textColor: "text-blue-700",
            borderColor: "border-blue-200",
            iconBg: "bg-blue-500",
            icon: (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            ),
        },
        {
            title: "Total Seed Packets",
            value: stats.totalSeedPackets,
            bgColor: "bg-purple-50",
            textColor: "text-purple-700",
            borderColor: "border-purple-200",
            iconBg: "bg-purple-500",
            icon: (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
        },
        {
            title: "Pending Requests",
            value: stats.currentRequests,
            bgColor: "bg-amber-50",
            textColor: "text-amber-700",
            borderColor: "border-amber-200",
            iconBg: "bg-amber-500",
            icon: (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((card, idx) => (
                <div
                    key={idx}
                    className={`p-4 rounded-lg border ${card.borderColor} ${card.bgColor} shadow-sm flex items-center justify-between transition-transform duration-200 hover:scale-[1.02]`}
                >
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                            {card.title}
                        </p>
                        <p className={`text-2xl font-bold ${card.textColor}`}>
                            {card.value.toLocaleString()}
                        </p>
                    </div>
                    <div className={`p-3 rounded-full ${card.iconBg} shadow-sm`}>
                        {card.icon}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default DailyStats