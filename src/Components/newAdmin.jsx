import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Users from "./Users";
import Tickets from "./Tickets";

export default function AdminDashboardNew() {
    const [activeTab, setActiveTab] = useState("users");
    const [userPage, setUserPage] = useState(1);  // Pagination state for users
    const [ticketPage, setTicketPage] = useState(1);  // Pagination state for tickets
    const [pageSize] = useState(5);  // Page size for both users and tickets
    const [userFilter, setUserFilter] = useState("");  // Filter for users
    const [ticketFilter, setTicketFilter] = useState("");  // Filter for tickets

    const navigate = useNavigate();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    const handlePrevPage = () => {
        if (activeTab === "users") {
            setUserPage(userPage > 1 ? userPage - 1 : 1);
        } else {
            setTicketPage(ticketPage > 1 ? ticketPage - 1 : 1);
        }
    };

    const handleNextPage = () => {
        if (activeTab === "users") {
            setUserPage(userPage + 1);
        } else {
            setTicketPage(ticketPage + 1);
        }
    };

    const handleUserFilterChange = (e) => {
        setUserFilter(e.target.value);
        setUserPage(1);  // Reset to page 1 when filter changes
    };

    const handleTicketFilterChange = (e) => {
        setTicketFilter(e.target.value);
        setTicketPage(1);  // Reset to page 1 when filter changes
    };

    return (
        <div className="p-6 flex flex-col min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600">Logout</button>
            </div>

            <div className="flex space-x-4 mb-6">
                <button onClick={() => setActiveTab("users")} className="px-6 py-3 rounded-lg bg-green-500 text-white">Users</button>
                <button onClick={() => setActiveTab("tickets")} className="px-6 py-3 rounded-lg bg-blue-500 text-white">Tickets</button>
            </div>

            {/* Filters */}
            <div className="mb-4">
                {activeTab === "users" && (
                    <input
                        type="text"
                        value={userFilter}
                        onChange={handleUserFilterChange}
                        placeholder="Filter Users"
                        className="px-4 py-2 rounded-lg border border-gray-300 w-full"
                    />
                )}

                {activeTab === "tickets" && (
                    <input
                        type="text"
                        value={ticketFilter}
                        onChange={handleTicketFilterChange}
                        placeholder="Filter Tickets"
                        className="px-4 py-2 rounded-lg border border-gray-300 w-full"
                    />
                )}
            </div>

            {/* Pass page state, filter, and functions as props */}
            {activeTab === "users" ? (
                <Users 
                    apiBaseUrl={apiBaseUrl} 
                    userPage={userPage} 
                    pageSize={pageSize} 
                    filter={userFilter}  // Pass the filter to the Users component
                />
            ) : (
                <Tickets 
                    apiBaseUrl={apiBaseUrl} 
                    ticketPage={ticketPage} 
                    pageSize={pageSize} 
                    filter={ticketFilter}  // Pass the filter to the Tickets component
                />
            )}

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
                <button 
                    onClick={handlePrevPage} 
                    disabled={activeTab === "users" ? userPage === 1 : ticketPage === 1} 
                    className="px-4 py-2 bg-gray-300 rounded-lg">
                    Prev
                </button>
                <span>
                    Page {activeTab === "users" ? userPage : ticketPage}
                </span>
                <button 
                    onClick={handleNextPage} 
                    className="px-4 py-2 bg-gray-300 rounded-lg">
                    Next
                </button>
            </div>
        </div>
    );
}
