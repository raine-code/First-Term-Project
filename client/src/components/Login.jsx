import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FaSignInAlt } from "react-icons/fa"

const Login = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        try {
            const response = await fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            })

            const data = await response.json()

            if (response.ok) {
                const role = data?.user?.role || data?.role

                if (role) {
                    localStorage.setItem("role", role)
                    localStorage.setItem("user", JSON.stringify(data.user))

                    if (role.toUpperCase() === "ADMIN") {
                        navigate("/admin-dashboard")
                    } else {
                        navigate("/staff-dashboard")
                    }
                } else {
                    console.error("Role missing from server response:", data)
                    setError("User role not recognized.")
                }
            } else {
                const errorMessage = data?.message || data?.error || "Invalid username or password"
                console.error("Login failed:", errorMessage)
                setError(errorMessage)
            }
        } catch (err) {
            setError("Network error. Please try again.")
            console.error("Network error during login:", err)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md flex flex-col gap-4 text-center"
            >
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">SEED TRACK</h2>
                    <p className="text-sm text-gray-500 mt-1">Secure. Track. Preserve</p>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 text-sm p-2 rounded border border-red-200">
                        {error}
                    </div>
                )}

                <div className="flex flex-col text-left gap-1">
                    <label htmlFor="username" className="text-sm font-medium text-gray-700">Username</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter Username"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                    />
                </div>

                <div className="flex flex-col text-left gap-1">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter Password"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors mt-2"
                >
                    Login <FaSignInAlt />
                </button>
            </form>
        </div>
    )
}

export default Login