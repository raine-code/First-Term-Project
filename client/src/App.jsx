// src/App.jsx
import { Routes, Route } from "react-router-dom"
import Login from "./components/Login"
import BarcodeScanner from "./components/BarcodeScanner" // or Dashboard component
import AdminDashboard from "./components/AdminDashboard"
import StaffDashboard from "./components/StaffDashboard"
import AnalyticsPage from './components/Analytics';
import AddRequest from "./components/AddRequest"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/staff-dashboard" element={<StaffDashboard />} />
      <Route path="/scanner" element={<BarcodeScanner />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/requests" element={<StaffDashboard />} />
      <Route path="/add-request" element={<AddRequest />} />
    </Routes>
  )
}

export default App