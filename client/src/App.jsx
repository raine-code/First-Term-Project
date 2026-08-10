// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import BarcodeScanner from "./components/BarcodeScanner"; // or Dashboard component
import AdminDashboard from "./components/AdminDashboard";
import StaffDashboard from "./components/StaffDashboard";
import AnalyticsPage from './components/Analytics';
import AddRequest from "./components/AddRequest";
import SeedList from "./components/SeedList";
import AddSeed from "./components/AddSeed";

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
      <Route path="/seeds" element={<SeedList />} />
      <Route path="/add-seed" element={<AddSeed />} />
    </Routes>
  )
}

export default App