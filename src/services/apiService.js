import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL; // API base URL from environment variables

// Create an Axios instance with base URL and default headers
const apiService = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach the token to every request if available
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to log errors globally
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/* ============================
   Authentication API Functions
   ============================ */
export const loginUser = async (email, password) => {
  return apiService.post("/auth/user/login", { email, password });
};

export const signUpUser = async (userData) => {
  return apiService.post("/auth/user", userData);
};

export const getUserProfile = async () => {
  return apiService.get("/auth/user/profile");
};

export const updateUserProfile = async (userData) => {
  return apiService.put("/auth/user/profile", userData);
};

/* ============================
   Admin API Functions
   ============================ */

// Get a paginated list of users
export const getUsers = async (page, size) => {
  return apiService.get(`/auth/user?page=${page}&size=${size}`);
};

// Delete a user by their ID
export const deleteUser = async (userId) => {
  return apiService.delete(`/auth/user/${userId}`);
};

// Get a paginated list of tickets
export const getTickets = async (page, size) => {
  return apiService.get(`/auth/tickets?page=${page}&size=${size}`);
};

// Update the status of a ticket by its ID
export const updateTicketStatus = async (ticketId, status) => {
  return apiService.put(`/auth/tickets/${ticketId}`, { status });
};

// Delete a ticket by its ID
export const deleteTicket = async (ticketId) => {
  return apiService.delete(`/auth/tickets/${ticketId}`);
};

/* ============================
   Logout Function
   ============================ */
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export default apiService;
