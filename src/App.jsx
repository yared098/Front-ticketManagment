import { Routes, Route } from "react-router-dom";
import Login from "./login";
import SignUp from "./signUp";
import Dashboard from "./Components/adminDashboard";
import UserDashboard from "./Components/userDashboard";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute />} />
      <Route path="/admin-dashboard" element={<Dashboard />} />
      <Route path="/user-dashboard" element={<UserDashboard />} />
    </Routes>
  );
}

export default App;
