import { useState, useEffect } from "react";

export default function Tickets({ apiBaseUrl, ticketPage, pageSize, filter }) {
    const [tickets, setTickets] = useState([]);
    const [totalTickets, setTotalTickets] = useState(0);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [newStatus, setNewStatus] = useState('');

    useEffect(() => {
        fetch(`${apiBaseUrl}/auth/tickets?page=${ticketPage}&size=${pageSize}`)
            .then((res) => res.json())
            .then((data) => {
                setTickets(data.data || []);
                setTotalTickets(data.pagination?.totalCount || 0);
            })
            .catch((error) => console.error("Error fetching tickets:", error));
    }, [ticketPage, pageSize, apiBaseUrl]);

    const handleDeleteTicket = (ticketId) => {
        fetch(`${apiBaseUrl}/auth/tickets/${ticketId}`, { method: "DELETE" })
            .then((res) => res.json())
            .then(() => {
                setTickets((prevTickets) => prevTickets.filter(ticket => ticket.ticket_id !== ticketId));
                alert("Ticket deleted successfully!");
            })
            .catch((error) => console.error("Error deleting ticket:", error));
    };

    const handleUpdateStatus = async () => {
        if (!selectedTicket || !newStatus) {
            console.error("Selected ticket or new status is missing.");
            return;
        }
    
        console.log("Selected Ticket ID:", selectedTicket.ticket_id);
        console.log("New Status:", newStatus);
        console.log(`API URL: ${apiBaseUrl}/auth/tickets/${selectedTicket.ticket_id}`);

    
        try {
            // Make the API call to update the ticket status
            const response = await fetch(`${apiBaseUrl}/auth/tickets/${selectedTicket.ticket_id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });
    
            if (!response.ok) {
                throw new Error("Failed to update ticket status");
            }
    
            const updatedTicket = await response.json();
            console.log("Updated ticket from backend:", updatedTicket);
    
            // Update the tickets state with the new status
            setTickets((prevTickets) =>
                prevTickets.map((ticket) =>
                    ticket.ticket_id === selectedTicket.ticket_id
                        ? { ...ticket, status: newStatus }
                        : ticket
                )
            );
    
            alert("Ticket status updated successfully!");
    
            // Close the popup after updating the status
            setShowPopup(false);
        } catch (error) {
            console.error("Error updating ticket status:", error);
        }
    };
    
    

    const handleViewDetails = (ticket) => {
        setSelectedTicket(ticket);
        setShowPopup(true);
        setNewStatus(ticket.status); // Set the current status when viewing the details
    };

    return (
        <div className="flex-1">
            <h2 className="text-xl font-bold mb-4">Tickets</h2>
            <div className="overflow-x-auto max-h-96">
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2">Ticket ID</th>
                            <th className="border p-2">Status</th>
                            <th className="border p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets
                            .filter(ticket => ticket.title.toLowerCase().includes(filter.toLowerCase())) // Apply filter
                            .map(ticket => (
                            <tr key={ticket.ticket_id} className="border hover:bg-gray-50">
                                <td className="border p-2">{ticket.title}</td>
                                <td className="border p-2">{ticket.status}</td>
                                <td className="border p-2 flex justify-between space-x-2">
                                    <button 
                                        onClick={() => handleDeleteTicket(ticket.ticket_id)} 
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                                        Delete
                                    </button>
                                    <button 
                                        onClick={() => handleViewDetails(ticket)} 
                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Slide-in Popup */}
            {showPopup && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-end">
                    <div className="bg-white w-80 h-full p-6 shadow-lg">
                        <h3 className="text-xl font-semibold mb-4">Update Ticket</h3>
                        <div>
                            <label className="block text-sm mb-2">Ticket ID: {selectedTicket?.ticket_id}</label>
                            <label className="block text-sm mb-2">Title: {selectedTicket?.title}</label>
                            <label className="block text-sm mb-4">Current Status: {selectedTicket?.status}</label>
                            
                            <div className="mb-4">
                                <label className="block text-sm mb-2">Update Status:</label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded"
                                >
                                    <option value="Open">Open</option>
                                    <option value="Closed">Closed</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="flex justify-between">
                                <button 
                                    onClick={() => setShowPopup(false)} 
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleUpdateStatus} 
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                                    Update Status
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
