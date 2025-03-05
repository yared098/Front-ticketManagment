import { useState, useEffect } from "react";

export default function UserDashboard() {
    const [ticketsData, setTicketsData] = useState([]);
    const [openForm, setOpenForm] = useState(false);
    const [formData, setFormData] = useState({ title: "", description: "" });
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [userId, setUserId] = useState(""); // Dynamically set userId from shared preferences
    const [loading, setLoading] = useState(true);
    // Retrieve token and userId from localStorage or sessionStorage
    const token = localStorage.getItem("authToken");

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    // UseEffect for setting the userId
    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem("user"));
        const savedUserId = savedUser ? savedUser.user_id : null;

        console.log("Retrieved user ID from localStorage:", savedUserId);

        if (savedUserId) {
            setUserId(savedUserId); // Set the userId in your state or use it as needed
        } else {
            console.error("User ID is not available in localStorage.");
        }
    }, []);

    
     useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/auth/tickets/my/${userId}`, {
                    method: 'GET',
                });

                if (response.ok) {
                    const data = await response.json();
                    setTicketsData(data.data || []);
                    // setTotalTickets(data.pagination?.totalCount || 0);
                } else {
                    console.error("Failed to fetch tickets. Status:", response.status);
                }
            } catch (error) {
                console.error("Error fetching tickets:", error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchTickets();
        }
    }, [userId]); // Ensure userId is included in the dependency array


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userId) {
            console.error("User ID is not available.");
            return;
        }

        const ticketData = { ...formData, createdBy: userId }; // Include user ID when submitting a new ticket

        if (selectedTicket) {
            // Update ticket
            console.log("Updating ticket:", selectedTicket.ticket_id);

            const response = await fetch(`${apiBaseUrl}/auth/tickets/${selectedTicket.ticket_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(ticketData),
            });

            const updatedTicket = await response.json();
            console.log("Updated ticket:", updatedTicket);

            if (response.ok) {
                setTicketsData((prevTickets) => {
                    return prevTickets.map((ticket) =>
                        ticket.ticket_id === selectedTicket.ticket_id ? updatedTicket : ticket
                    );
                });
                fetchTickets();
            } else {
                console.error("Failed to update ticket:", updatedTicket.message || "Unknown error");
            }
        } else {
            // Add new ticket
            console.log("Adding new ticket:", ticketData);

            const response = await fetch(`${apiBaseUrl}/auth/tickets`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(ticketData),
            });

            const newTicket = await response.json();
            console.log("New ticket added:", newTicket);

            if (response.ok) {
                setTicketsData((prevTickets) => [...prevTickets, newTicket]);
                fetchTickets();
            } else {
                console.error("Failed to add ticket:", newTicket.message || "Unknown error");
            }
        }

        setOpenForm(false); // Close the form after submission
        setSelectedTicket(null); // Clear selected ticket
    };

    const handleLogout = () => {
        console.log("User logged out.");
        localStorage.removeItem("authToken");
        localStorage.removeItem("userId");
        window.location.href = "/login"; // Redirect to the login page after logout
    };

    const filteredTickets = ticketsData.filter((ticket) =>
        ticket.title && ticket.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleTicketClick = (ticket) => {
        console.log("Selected ticket:", ticket);
        setSelectedTicket(ticket);
        setFormData({ title: ticket.title, description: ticket.description });
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">User Dashboard</h1>

            <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 mb-4"
            >
                Logout
            </button>

            <input
                type="text"
                placeholder="Search Tickets"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full mb-6 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTickets.map((ticket) => (
                    <div
                        key={ticket.ticket_id}
                        className="p-4 border rounded-lg shadow-md bg-white cursor-pointer"
                        onClick={() => handleTicketClick(ticket)}
                    >
                        <h3 className="font-semibold">{ticket.title}</h3>
                        <p>{ticket.description}</p>
                        <span
                            className={`px-2 py-1 rounded text-sm font-bold ${ticket.status === "Open"
                                ? "bg-green-200 text-green-800"
                                : ticket.status === "Closed"
                                    ? "bg-red-200 text-red-800"
                                    : "bg-yellow-200 text-yellow-800"
                                }`}
                        >
                            {ticket.status}
                        </span>
                    </div>
                ))}
            </div>

            <button
                className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600"
                onClick={() => setOpenForm(true)}
            >
                +
            </button>

            {(openForm || selectedTicket) && (
                <div className="fixed inset-0 flex justify-end items-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full md:w-4/5 lg:w-4/5 xl:w-3/5 h-4/5 overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{selectedTicket ? "Update Ticket" : "Add Ticket"}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                                >
                                    {selectedTicket ? "Update" : "Submit"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setOpenForm(false)}
                                    className="ml-4 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
