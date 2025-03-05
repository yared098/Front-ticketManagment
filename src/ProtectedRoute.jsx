import { Navigate } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")); // Parse the user object from localStorage

  // Check if the token exists and if it is expired
  const isTokenExpired = (token) => {
    if (!token) return true;

    const payload = JSON.parse(atob(token.split(".")[1])); // Decode token payload (assuming JWT)
    const currentTime = Date.now() / 1000; // Current time in seconds

    return payload.exp < currentTime; // Check if token's expiration time is in the past
  };

  // If there's no token or if the token is expired, redirect to login
  if (!token || !user || isTokenExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // Clear user data if session expired
    return <Navigate to="/login" replace />; // Redirect to login if no token or session expired
  }

  const userRole = user.role; // Extract the role from the user object

  // If the user is an admin, redirect to the admin dashboard
  if (userRole === "admin") {
    return <Navigate to="/admin-dashboard" replace />;
  }
  
  // If the user is a normal user, redirect to the user dashboard
  else if (userRole === "user") {
    return <Navigate to="/user-dashboard" replace />;
  }

  return <Navigate to="/" replace />; // Default redirect, in case no role is found
};

export default ProtectedRoute;
