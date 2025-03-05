import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("users");
    const [filter, setFilter] = useState(""); // Filter text
    const [ticketDetails, setTicketDetails] = useState(null);
    const [status, setStatus] = useState(""); // Ticket status
    const [users, setUsers] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [userPage, setUserPage] = useState(1); // Pagination for users
    const [ticketPage, setTicketPage] = useState(1); // Pagination for tickets
    const [pageSize, setPageSize] = useState(5); // Set the size to 5 for both users and tickets
    const [totalUsers, setTotalUsers] = useState(0); // Total number of users
    const [totalTickets, setTotalTickets] = useState(0); // Total number of tickets
    const navigate = useNavigate();

    
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;


    useEffect(() => {
        fetch(`${apiBaseUrl}/auth/user?page=${userPage}&size=${pageSize}`)
            .then((res) => res.json())
            .then((data) => {
                setUsers(data.data || []);
                setTotalUsers(data.pagination?.totalCount || 0);
            })
            .catch((error) => console.error("Error fetching users:", error));
    }, [userPage, pageSize]);

    // Fetch tickets from API
    useEffect(() => {
        fetch(`${apiBaseUrl}/auth/tickets?page=${ticketPage}&size=${pageSize}`)
            .then((res) => res.json())
            .then((data) => {
                setTickets(data.data || []);
                setTotalTickets(data.pagination?.totalCount || 0);
            })
            .catch((error) => console.error("Error fetching tickets:", error));
    }, [ticketPage, pageSize]);

    const showTicketDetails = (ticket) => {
        setTicketDetails(ticket);
        setStatus(ticket.status);
    };

    const handleUpdate = () => {
        if (ticketDetails) {
            console.log("Status to update:", status);  // Log the status value
            console.log("Ticket ID to update:", ticketDetails.ticket_id);  // Log ticket_id
    
            fetch(`${apiBaseUrl}auth/tickets/${ticketDetails.ticket_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }) // Ensure status is being passed correctly
            })
            .then((res) => res.json())
            .then((updatedTicket) => {
                console.log("Updated ticket from backend:", updatedTicket); // Check the updated ticket
                setTickets((prevTickets) => prevTickets.map(ticket => 
                    ticket.ticket_id === updatedTicket.ticket_id ? updatedTicket : ticket
                ));
                setTicketDetails(updatedTicket);
                alert("Ticket updated successfully!");
            })
            .catch((error) => console.error("Error updating ticket:", error));
        }
    };

    const handleDeleteUser = (userId) => {
        fetch(`${apiBaseUrl}/auth/user/${userId}`, {
            method: "DELETE",
        })
        .then((res) => res.json())
        .then(() => {
            setUsers((prevUsers) => prevUsers.filter(user => user._id !== userId));
            alert("User deleted successfully!");
        })
        .catch((error) => console.error("Error deleting user:", error));
    };

    const handleDeleteTicket = (ticketId) => {
        fetch(`${apiBaseUrl}/auth/tickets/${ticketId}`, {
            method: "DELETE",
        })
        .then((res) => res.json())
        .then(() => {
            setTickets((prevTickets) => prevTickets.filter(ticket => ticket.ticket_id !== ticketId));
            alert("Ticket deleted successfully!");
        })
        .catch((error) => console.error("Error deleting ticket:", error));
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    // Count tickets by status
    const ticketStats = {
        open: tickets.filter(ticket => ticket.status === "Open").length,
        closed: tickets.filter(ticket => ticket.status === "Closed").length,
        other: tickets.filter(ticket => ticket.status !== "Open" && ticket.status !== "Closed").length
    };

    return (
        <div className="p-6 flex flex-col min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600">Logout</button>
            </div>

            {/* Stats Cards */}
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-green-500 text-white p-4 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold">Users</h2>
                    <p className="text-2xl">{users.length}</p>
                </div>
                <div className="bg-blue-500 text-white p-4 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold">Open Tickets</h2>
                    <p className="text-2xl">{ticketStats.open}</p>
                </div>
                <div className="bg-red-500 text-white p-4 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold">Closed Tickets</h2>
                    <p className="text-2xl">{ticketStats.closed}</p>
                </div>
                <div className="bg-yellow-500 text-white p-4 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold">Other Tickets</h2>
                    <p className="text-2xl">{ticketStats.other}</p>
                </div>
            </div>

            <div className="flex items-center mb-6">
                <div className="flex space-x-4">
                    <button className={`px-6 py-3 rounded-lg shadow-md transition-all ${activeTab === "users" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-green-400 hover:text-white"}`} onClick={() => setActiveTab("users")}>Users</button>
                    <button className={`px-6 py-3 rounded-lg shadow-md transition-all ${activeTab === "tickets" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-green-400 hover:text-white"}`} onClick={() => setActiveTab("tickets")}>Tickets</button>
                </div>
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className="ml-4 p-2 border border-gray-300 rounded-lg"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>

            {/* Users Table */}
            {activeTab === "users" && (
                <div className="flex-1">
                    <h2 className="text-xl font-bold mb-4">Users</h2>
                    <div className="overflow-x-auto max-h-96">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border p-2">Full Name</th>
                                    <th className="border p-2">Username</th>
                                    <th className="border p-2">Email</th>
                                    <th className="border p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.filter(user => user.fullname.toLowerCase().includes(filter.toLowerCase())).map(user => (
                                    <tr key={user._id} className="border hover:bg-gray-50">
                                        <td className="border p-2">{user.fullname}</td>
                                        <td className="border p-2">{user.username}</td>
                                        <td className="border p-2">{user.email}</td>
                                        <td className="border p-2">
                                            <button 
                                                onClick={() => handleDeleteUser(user._id)} 
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination for Users */}
                    <div className="flex justify-between items-center mt-4 fixed bottom-0 left-0 right-0 bg-white px-4 py-2 shadow-md">
                        <button 
                            onClick={() => setUserPage(userPage > 1 ? userPage - 1 : 1)} 
                            disabled={userPage === 1} 
                            className="px-4 py-2 bg-gray-300 rounded-lg">
                            Prev
                        </button>
                        <span>Page {userPage} of {Math.ceil(totalUsers / pageSize)}</span>
                        <button 
                            onClick={() => setUserPage(userPage < Math.ceil(totalUsers / pageSize) ? userPage + 1 : userPage)} 
                            disabled={userPage === Math.ceil(totalUsers / pageSize)} 
                            className="px-4 py-2 bg-gray-300 rounded-lg">
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Tickets Table */}
            {activeTab === "tickets" && (
                <div className="flex-1">
                    <h2 className="text-xl font-bold mb-4">Tickets</h2>
                    <div className="overflow-x-auto max-h-96">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border p-2">Ticket ID</th>
                                    <th className="border p-2">Status</th>
                                    <th className="border p-2">Details</th>
                                    <th className="border p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.filter(ticket => ticket.ticket_id.toLowerCase().includes(filter.toLowerCase())).map(ticket => (
                                    <tr key={ticket.ticket_id} className="border hover:bg-gray-50">
                                        <td className="border p-2">{ticket.title}</td>
                                        <td className="border p-2">{ticket.status}</td>
                                        <td className="border p-2">
                                            <button 
                                                onClick={() => showTicketDetails(ticket)} 
                                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                                                View Details
                                            </button>
                                        </td>
                                        <td className="border p-2">
                                            <button 
                                                onClick={() => handleDeleteTicket(ticket.ticket_id)} 
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination for Tickets */}
                    <div className="flex justify-between items-center mt-4 fixed bottom-0 left-0 right-0 bg-white px-4 py-2 shadow-md">
                        <button 
                            onClick={() => setTicketPage(ticketPage > 1 ? ticketPage - 1 : 1)} 
                            disabled={ticketPage === 1} 
                            className="px-4 py-2 bg-gray-300 rounded-lg">
                            Prev
                        </button>
                        <span>Page {ticketPage} of {Math.ceil(totalTickets / pageSize)}</span>
                        <button 
                            onClick={() => setTicketPage(ticketPage < Math.ceil(totalTickets / pageSize) ? ticketPage + 1 : ticketPage)} 
                            disabled={ticketPage === Math.ceil(totalTickets / pageSize)} 
                            className="px-4 py-2 bg-gray-300 rounded-lg">
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Ticket Details */}
            {ticketDetails && (
                <div className="fixed top-0 left-0 right-0 bottom-0 bg-white bg-opacity-80 p-6">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto">
                        <h3 className="text-2xl font-bold mb-4">Ticket Details</h3>
                        <div className="mb-4">
                            <strong>Ticket ID:</strong> {ticketDetails.ticket_id}
                        </div>
                        <div className="mb-4">
                            <strong>Status:</strong> 
                            <select 
                                value={status} 
                                onChange={(e) => setStatus(e.target.value)} 
                                className="ml-2 p-2 border rounded-lg">
                                <option value="Open">Open</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                        <button 
                            onClick={handleUpdate} 
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                            Update Status
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
