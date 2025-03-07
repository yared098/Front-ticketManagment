import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid'; // Correct import path
import { useReducer, useEffect } from 'react';

// Define the initial state
const initialState = {
    ticketsData: [],
    openForm: false,
    openTicketDetails: false,
    formData: { title: '', description: '' },
    searchQuery: '',
    selectedTicket: null,
    userId: '',
    loading: true,
};

// Define actions for the reducer
const actionTypes = {
    SET_USER_ID: 'SET_USER_ID',
    SET_TICKETS: 'SET_TICKETS',
    SET_LOADING: 'SET_LOADING',
    SET_FORM_DATA: 'SET_FORM_DATA',
    TOGGLE_FORM: 'TOGGLE_FORM',
    TOGGLE_TICKET_DETAILS: 'TOGGLE_TICKET_DETAILS',
    SET_SELECTED_TICKET: 'SET_SELECTED_TICKET',
    SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
};

// Reducer function
const reducer = (state, action) => {
    switch (action.type) {
        case actionTypes.SET_USER_ID:
            return { ...state, userId: action.payload };
        case actionTypes.SET_TICKETS:
            return { ...state, ticketsData: action.payload };
        case actionTypes.SET_LOADING:
            return { ...state, loading: action.payload };
        case actionTypes.SET_FORM_DATA:
            return { ...state, formData: { ...state.formData, [action.payload.name]: action.payload.value } };
        case actionTypes.TOGGLE_FORM:
            return { ...state, openForm: action.payload };
        case actionTypes.TOGGLE_TICKET_DETAILS:
            return { ...state, openTicketDetails: action.payload };
        case actionTypes.SET_SELECTED_TICKET:
            return { ...state, selectedTicket: action.payload };
        case actionTypes.SET_SEARCH_QUERY:
            return { ...state, searchQuery: action.payload };
        default:
            return state;
    }
};

export default function UserDashboard() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { ticketsData, openForm, openTicketDetails, formData, searchQuery, selectedTicket, userId, loading } = state;

    const token = localStorage.getItem('authToken');
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        const savedUserId = savedUser ? savedUser.user_id : null;

        if (savedUserId) {
            dispatch({ type: actionTypes.SET_USER_ID, payload: savedUserId });
        } else {
            console.error('User ID is not available in localStorage.');
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
                    dispatch({ type: actionTypes.SET_TICKETS, payload: data.data || [] });
                } else {
                    console.error('Failed to fetch tickets. Status:', response.status);
                }
            } catch (error) {
                console.error('Error fetching tickets:', error);
            } finally {
                dispatch({ type: actionTypes.SET_LOADING, payload: false });
            }
        };

        if (userId) {
            fetchTickets();
        }
    }, [userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        dispatch({ type: actionTypes.SET_FORM_DATA, payload: { name, value } });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userId) {
            console.error('User ID is not available.');
            return;
        }

        const ticketData = JSON.stringify({ ...formData, createdBy: String(userId) });

        try {
            let response;

            if (selectedTicket) {
                response = await fetch(`${apiBaseUrl}/auth/tickets/${selectedTicket.ticket_id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: ticketData,
                });
            } else {
                response = await fetch(`${apiBaseUrl}/auth/tickets`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: ticketData,
                });
            }

            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.statusText}`);
            }

            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
                const newTicket = await response.json();
                if (newTicket) {
                    if (selectedTicket) {
                        dispatch({
                            type: actionTypes.SET_TICKETS,
                            payload: ticketsData.map((ticket) =>
                                ticket.ticket_id === selectedTicket.ticket_id ? newTicket : ticket
                            ),
                        });
                    } else {
                        dispatch({ type: actionTypes.SET_TICKETS, payload: [...ticketsData, newTicket] });
                    }
                    dispatch({ type: actionTypes.TOGGLE_FORM, payload: false });
                }
            } else {
                const text = await response.text();
                throw new Error(`Expected JSON but received: ${text}`);
            }
        } catch (error) {
            console.error('Error:', error);
        }

        dispatch({ type: actionTypes.SET_SELECTED_TICKET, payload: null });
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        window.location.href = '/login';
    };

    const filteredTickets = ticketsData.filter((ticket) =>
        ticket.title && ticket.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleTicketClick = (ticket) => {
        dispatch({ type: actionTypes.SET_SELECTED_TICKET, payload: ticket });
        dispatch({ type: actionTypes.TOGGLE_TICKET_DETAILS, payload: true });
    };

    const handleEditTicket = (ticket) => {
        dispatch({ type: actionTypes.SET_SELECTED_TICKET, payload: ticket });
        dispatch({ type: actionTypes.TOGGLE_FORM, payload: true });
    };

    const handleDeleteTicket = async (ticketId) => {
        try {
            const response = await fetch(`${apiBaseUrl}/auth/tickets/${ticketId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                dispatch({
                    type: actionTypes.SET_TICKETS,
                    payload: ticketsData.filter((ticket) => ticket.ticket_id !== ticketId),
                });
            } else {
                console.error('Failed to delete ticket');
            }
        } catch (error) {
            console.error('Error deleting ticket:', error);
        }
    };

    const handleFormClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div className="p-6">

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">User Dashboard</h1>

                <div className="flex space-x-4">
                    <input
                        type="text"
                        placeholder="Search Tickets"
                        value={searchQuery}
                        onChange={(e) => dispatch({ type: actionTypes.SET_SEARCH_QUERY, payload: e.target.value })}
                        className="w-full sm:w-64 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </div>


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
                            className={`px-2 py-1 rounded text-sm font-bold ${ticket.status === 'Open'
                                ? 'bg-green-200 text-green-800'
                                : ticket.status === 'Closed'
                                    ? 'bg-red-200 text-red-800'
                                    : 'bg-yellow-200 text-yellow-800'
                                }`}
                        >
                            {ticket.status}
                        </span>
                        <div className="flex justify-end mt-2">
                            <PencilIcon
                                className="w-5 h-5 text-blue-500 cursor-pointer mr-2"
                                onClick={() => handleEditTicket(ticket)}
                            />
                            <TrashIcon
                                className="w-5 h-5 text-red-500 cursor-pointer"
                                onClick={() => handleDeleteTicket(ticket.ticket_id)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Action Button for Adding New Ticket */}
            <button
                className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600"
                onClick={() => dispatch({ type: actionTypes.TOGGLE_FORM, payload: true })}
            >
                +
            </button>

            {/* Sliding Form */}
            {openForm && (
                <div
                    className="fixed inset-0 flex justify-end items-center bg-black bg-opacity-50 z-50"
                    onClick={() => dispatch({ type: actionTypes.TOGGLE_FORM, payload: false })}
                >
                    <div
                        className="bg-white p-6 rounded-lg shadow-lg w-4/5 md:w-2/5 lg:w-1/3 h-full transform transition-all duration-500 ease-in-out"
                        style={{
                            transform: openForm ? 'translateX(0)' : 'translateX(100%)',
                        }}
                        onClick={handleFormClick}
                    >
                        <h2 className="text-xl font-bold mb-4">
                            {selectedTicket ? 'Update Ticket' : 'Add Ticket'}
                        </h2>
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
                                    className="mt-1 p-3 w-full border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    className="mt-1 p-3 w-full border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => dispatch({ type: actionTypes.TOGGLE_FORM, payload: false })}
                                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-300 rounded-lg hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                                >
                                    {selectedTicket ? 'Update' : 'Add'} Ticket
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Ticket Details Modal */}
            {openTicketDetails && selectedTicket && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-4/5 md:w-2/5 lg:w-1/3 h-full overflow-auto">
                        <h2 className="text-xl font-bold mb-4">Ticket Details</h2>
                        <div className="mb-4">
                            <h3 className="font-semibold">Title</h3>
                            <p>{selectedTicket.title}</p>
                        </div>
                        <div className="mb-4">
                            <h3 className="font-semibold">Description</h3>
                            <p>{selectedTicket.description}</p>
                        </div>
                        <div className="mb-4">
                            <h3 className="font-semibold">Status</h3>
                            <p>{selectedTicket.status}</p>
                        </div>
                        <button
                            onClick={() => dispatch({ type: actionTypes.TOGGLE_TICKET_DETAILS, payload: false })}
                            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
