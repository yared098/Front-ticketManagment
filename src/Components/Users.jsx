import { useState, useEffect } from "react";

export default function Users({ apiBaseUrl, userPage, pageSize, filter }) {
    const [users, setUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        // Get the current user's email from localStorage
        const currentUserData = JSON.parse(localStorage.getItem("user")); // Get user from localStorage
        const currentUserEmail = currentUserData ? currentUserData.email : null; // Get the email if exists

        fetch(`${apiBaseUrl}/auth/user?page=${userPage}&size=${pageSize}`)
            .then((res) => res.json())
            .then((data) => {
                // Filter out the current user by comparing email
                const filteredUsers = data.data?.filter(user => user.email !== currentUserEmail) || [];
                setUsers(filteredUsers);
                setTotalUsers(data.pagination?.totalCount || 0);
            })
            .catch((error) => console.error("Error fetching users:", error));
    }, [userPage, pageSize, apiBaseUrl]);

    const handleDeleteUser = (userId) => {
        fetch(`${apiBaseUrl}/auth/user/${userId}`, { method: "DELETE" })
            .then((res) => res.json())
            .then(() => {
                setUsers((prevUsers) => prevUsers.filter(user => user._id !== userId));
                alert("User deleted successfully!");
            })
            .catch((error) => console.error("Error deleting user:", error));
    };

    const handleViewDetails = (user) => {
        setSelectedUser(user);
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        setSelectedUser(null); // Reset selected user when closing the popup
    };

    return (
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
                                <td className="border p-2 flex justify-between space-x-2">
                                    <button 
                                        onClick={() => handleDeleteUser(user._id)} 
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                                        Delete
                                    </button>
                                    <button 
                                        onClick={() => handleViewDetails(user)} 
                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Side Slide Popup */}
            {showPopup && selectedUser && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-end">
                    <div className="bg-white w-80 h-full p-6 shadow-lg">
                        <h3 className="text-xl font-semibold mb-4">User Details</h3>
                        <div>
                            <label className="block text-sm mb-2">Full Name: {selectedUser.fullname}</label>
                            <label className="block text-sm mb-2">Username: {selectedUser.username}</label>
                            <label className="block text-sm mb-2">Email: {selectedUser.email}</label>
                            <label className="block text-sm mb-4">Created At: {new Date(selectedUser.createdAt).toLocaleDateString()}</label>
                            
                            <div className="flex justify-between">
                                <button 
                                    onClick={handleClosePopup} 
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
