import { Navigate } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")); // Parse the user object from localStorage

  if (!token || !user) {
    return <Navigate to="/login" replace />; // Redirect to login if not logged in or no user
  }

  const userRole = user.role; // Extract the role from the user object

  if (userRole === "admin") {
    return <Navigate to="/admin-dashboard" replace />; // Redirect admin to admin dashboard
  } else if (userRole === "user") {
    return <Navigate to="/user-dashboard" replace />; // Redirect user to user dashboard
  }

  return <Navigate to="/" replace />; // Default redirect, in case no role is found
};

export default ProtectedRoute;
