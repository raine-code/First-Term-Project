import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaSeedling,
  FaSignOutAlt,
  FaChartBar,
  FaBoxes,
  FaHome,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getStoredUser = () => {
    try {
      const item = localStorage.getItem("user");
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  };

  const user = getStoredUser();
  const role = user?.role || localStorage.getItem("role") || "STAFF";
  const isAdmin = role?.toUpperCase() === "ADMIN";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const navLinks = isAdmin
    ? [
        { name: "Dashboard", path: "/admin-dashboard", icon: <FaHome className="text-base" /> },
        { name: "Seed Inventory", path: "/seed-list", icon: <FaBoxes className="text-base" /> },
        { name: "Analytics", path: "/analytics", icon: <FaChartBar className="text-base" /> },
      ]
    : [
        { name: "Dashboard", path: "/staff-dashboard", icon: <FaHome className="text-base" /> },
      ];

  const isActive = (path) => {
    return location.pathname === path || (path === "/seed-list" && location.pathname === "/seeds");
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return isAdmin ? "AD" : "ST";
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link
              to={isAdmin ? "/admin-dashboard" : "/staff-dashboard"}
              className="flex items-center gap-2.5 group transition-transform hover:scale-[1.01]"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-all">
                <FaSeedling className="text-xl" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  SeedTrack
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Pro
                  </span>
                </span>
                <span className="text-xs text-slate-500 font-medium">Genebank Management</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 ml-4">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? "bg-emerald-50 text-emerald-700 font-semibold shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                    }`}
                  >
                    <span className={active ? "text-emerald-600" : "text-slate-400"}>
                      {link.icon}
                    </span>
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Desktop Right Side (User Profile & Logout) */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shadow-xs">
                  {getUserInitials()}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 leading-tight">
                    {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : "User"}
                  </span>
                  <span className={`text-[10px] font-semibold tracking-wide uppercase ${isAdmin ? 'text-emerald-600' : 'text-blue-600'}`}>
                    {role}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                title="Sign out"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 text-xs font-medium transition-all cursor-pointer"
              >
                <FaSignOutAlt className="text-sm" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          {/* User Info Mobile */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm">
                {getUserInitials()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : "User"}
                </p>
                <span className={`text-[11px] font-semibold uppercase ${isAdmin ? 'text-emerald-600' : 'text-blue-600'}`}>
                  {role} Account
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs text-rose-600 font-semibold px-2.5 py-1.5 rounded bg-rose-50 border border-rose-100"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>

          {/* Nav items */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    active
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className={active ? "text-emerald-600" : "text-slate-400"}>
                    {link.icon}
                  </span>
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
