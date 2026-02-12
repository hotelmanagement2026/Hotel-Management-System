import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { FaCalendarAlt, FaBan, FaCheckCircle, FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';

const BookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [roomFilter, setRoomFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    useEffect(() => {
        filterBookings();
    }, [bookings, dateFrom, dateTo, roomFilter]);

    const fetchBookings = async () => {
        try {
            const { data } = await api.get('/admin/bookings');
            if (data.success) {
                setBookings(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterBookings = () => {
        let filtered = bookings;

        if (dateFrom) {
            filtered = filtered.filter(booking =>
                new Date(booking.checkIn) >= new Date(dateFrom)
            );
        }

        if (dateTo) {
            filtered = filtered.filter(booking =>
                new Date(booking.checkOut) <= new Date(dateTo)
            );
        }

        if (roomFilter !== 'all') {
            filtered = filtered.filter(booking => booking.roomName === roomFilter);
        }

        setFilteredBookings(filtered);
    };

    const handleCheckIn = async (booking) => {
        try {
            const { data } = await api.put(`/admin/checkin/${booking._id}`);
            if (data.success) {
                fetchBookings();
                alert('Guest checked in successfully!');
            }
        } catch (error) {
            console.error('Check-in failed:', error);
            alert(error.response?.data?.message || 'Check-in failed');
        }
    };

    const handleCheckOut = async (booking) => {
        try {
            const { data } = await api.put(`/admin/checkout/${booking._id}`);
            if (data.success) {
                fetchBookings();
                alert('Guest checked out successfully! Room is now available.');
            }
        } catch (error) {
            console.error('Check-out failed:', error);
            alert(error.response?.data?.message || 'Check-out failed');
        }
    };

    const handleCancelBooking = (booking) => {
        setSelectedBooking(booking);
        setModalAction('cancel');
        setShowModal(true);
    };

    const handleCompleteBooking = (booking) => {
        setSelectedBooking(booking);
        setModalAction('complete');
        setShowModal(true);
    };

    const confirmAction = async () => {
        if (!selectedBooking) return;

        try {
            if (modalAction === 'cancel') {
                await api.put(`/admin/bookings/${selectedBooking._id}/cancel`);
            } else if (modalAction === 'complete') {
                await api.put(`/admin/bookings/${selectedBooking._id}/complete`);
            }

            fetchBookings();
            setShowModal(false);
            setSelectedBooking(null);
        } catch (error) {
            console.error('Action failed:', error);
            alert(error.response?.data?.message || 'Action failed');
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: 'bg-yellow-900', text: 'text-yellow-300', label: 'Pending' },
            verified: { bg: 'bg-blue-900', text: 'text-blue-300', label: 'Confirmed' },
            cancelled: { bg: 'bg-red-900', text: 'text-red-300', label: 'Cancelled' },
            completed: { bg: 'bg-green-900', text: 'text-green-300', label: 'Completed' },
            created: { bg: 'bg-gray-900', text: 'text-gray-300', label: 'Created' },
        };

        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`px-3 py-1 rounded text-xs uppercase tracking-wider ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const getBookingStatusBadge = (bookingStatus) => {
        const statusConfig = {
            confirmed: { bg: 'bg-blue-900', text: 'text-blue-300', label: 'Confirmed' },
            checked_in: { bg: 'bg-purple-900', text: 'text-purple-300', label: 'Checked In' },
            checked_out: { bg: 'bg-green-900', text: 'text-green-300', label: 'Checked Out' },
        };

        const config = statusConfig[bookingStatus] || statusConfig.confirmed;
        return (
            <span className={`px-3 py-1 rounded text-xs uppercase tracking-wider ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const uniqueRooms = [...new Set(bookings.map(b => b.roomName).filter(Boolean))];

    if (loading) {
        return <div className="p-8 text-center text-stone-400">Loading bookings...</div>;
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-serif text-gold-400 mb-2">Booking Management</h1>
                <p className="text-stone-400">Manage all hotel bookings</p>
            </div>

            {/* Filters */}
            <div className="bg-dark-800 p-6 rounded border border-stone-800 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Date From */}
                    <div>
                        <label className="block text-sm text-stone-400 mb-2 uppercase tracking-wider">From Date</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full px-4 py-2 bg-dark-900 border border-stone-700 rounded text-stone-300 focus:border-gold-400 focus:outline-none"
                        />
                    </div>

                    {/* Date To */}
                    <div>
                        <label className="block text-sm text-stone-400 mb-2 uppercase tracking-wider">To Date</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full px-4 py-2 bg-dark-900 border border-stone-700 rounded text-stone-300 focus:border-gold-400 focus:outline-none"
                        />
                    </div>

                    {/* Room Filter */}
                    <div>
                        <label className="block text-sm text-stone-400 mb-2 uppercase tracking-wider">Room Type</label>
                        <select
                            value={roomFilter}
                            onChange={(e) => setRoomFilter(e.target.value)}
                            className="w-full px-4 py-2 bg-dark-900 border border-stone-700 rounded text-stone-300 focus:border-gold-400 focus:outline-none"
                        >
                            <option value="all">All Rooms</option>
                            {uniqueRooms.map(room => (
                                <option key={room} value={room}>{room}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-dark-800 rounded border border-stone-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-dark-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs text-stone-400 uppercase tracking-wider">Booking ID</th>
                                <th className="px-6 py-4 text-left text-xs text-stone-400 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-left text-xs text-stone-400 uppercase tracking-wider">Room</th>
                                <th className="px-6 py-4 text-left text-xs text-stone-400 uppercase tracking-wider">Check-In</th>
                                <th className="px-6 py-4 text-left text-xs text-stone-400 uppercase tracking-wider">Check-Out</th>
                                <th className="px-6 py-4 text-left text-xs text-stone-400 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-left text-xs text-stone-400 uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-4 text-left text-xs text-stone-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs text-stone-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-800">
                            {filteredBookings.length > 0 ? (
                                filteredBookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-dark-700 transition-colors">
                                        <td className="px-6 py-4 text-stone-300 font-mono text-sm">{booking.bookingId || 'N/A'}</td>
                                        <td className="px-6 py-4 text-stone-300">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{booking.userName || 'Guest'}</span>
                                                <span className="text-xs text-stone-500">{booking.userEmail || ''}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-stone-300">{booking.roomName || 'N/A'}</td>
                                        <td className="px-6 py-4 text-stone-400 text-sm">
                                            {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-stone-400 text-sm">
                                            {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-stone-300 font-semibold">
                                            ₹{booking.amount?.toLocaleString() || 0}
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(booking.status)}</td>
                                        <td className="px-6 py-4">{getBookingStatusBadge(booking.bookingStatus || 'confirmed')}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {/* Check-In Button */}
                                                {booking.status === 'verified' && booking.bookingStatus === 'confirmed' && (
                                                    <button
                                                        onClick={() => handleCheckIn(booking)}
                                                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs uppercase tracking-wider transition-colors flex items-center gap-1"
                                                        title="Check In"
                                                    >
                                                        <FaSignInAlt size={12} />
                                                        Check-In
                                                    </button>
                                                )}

                                                {/* Check-Out Button */}
                                                {booking.bookingStatus === 'checked_in' && (
                                                    <button
                                                        onClick={() => handleCheckOut(booking)}
                                                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs uppercase tracking-wider transition-colors flex items-center gap-1"
                                                        title="Check Out"
                                                    >
                                                        <FaSignOutAlt size={12} />
                                                        Check-Out
                                                    </button>
                                                )}

                                                {/* Cancel Button */}
                                                {booking.status === 'verified' && booking.bookingStatus !== 'checked_out' && (
                                                    <button
                                                        onClick={() => handleCancelBooking(booking)}
                                                        className="p-2 text-red-400 hover:bg-red-400 hover:text-white rounded transition-colors"
                                                        title="Cancel Booking"
                                                    >
                                                        <FaBan size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="px-6 py-8 text-center text-stone-500">
                                        No bookings found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showModal && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-800 border border-stone-700 rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-serif text-gold-400 mb-4">
                            {modalAction === 'cancel' ? 'Cancel Booking' : 'Complete Booking'}
                        </h3>
                        <p className="text-stone-300 mb-6">
                            {modalAction === 'cancel'
                                ? `Are you sure you want to cancel booking ${selectedBooking.bookingId}?`
                                : `Mark booking ${selectedBooking.bookingId} as completed?`
                            }
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={confirmAction}
                                className={`flex-1 px-4 py-2 rounded font-medium ${modalAction === 'cancel'
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                    }`}
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2 bg-stone-700 hover:bg-stone-600 text-white rounded font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingManagement;
