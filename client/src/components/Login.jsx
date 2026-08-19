import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSeedling, FaSignInAlt, FaLock, FaUser, FaShieldAlt } from "react-icons/fa";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const role = data?.user?.role || data?.role;

        if (role) {
          localStorage.setItem("role", role);
          localStorage.setItem("user", JSON.stringify(data.user));

          if (role.toUpperCase() === "ADMIN") {
            navigate("/admin-dashboard");
          } else {
            navigate("/staff-dashboard");
          }
        } else {
          setError("User role unrecognized.");
        }
      } else {
        const errorMessage = data?.message || data?.error || "Invalid username or password";
        setError(errorMessage);
      }
    } catch (err) {
      setError("Unable to connect to server. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Top brand header */}
        <div className="bg-gradient-to-br from-emerald-600 to-green-700 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-white mb-3 shadow-inner">
            <FaSeedling className="text-2xl" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">SeedTrack Pro</h1>
          <p className="text-xs text-emerald-100 mt-1 font-medium">
            Genebank Management & Requisition System
          </p>
        </div>

        {/* Login Form */}
        <div className="p-7 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <FaShieldAlt className="text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="username">
                Username / Email
              </label>
              <div className="relative">
                <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 mt-2 cursor-pointer"
            >
              <span>{loading ? "Authenticating..." : "Sign In to SeedTrack"}</span>
              <FaSignInAlt className="text-xs" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;