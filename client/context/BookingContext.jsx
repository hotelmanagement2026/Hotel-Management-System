import React, { createContext, useContext, useState, useEffect } from 'react';
import { paymentAPI, userAPI } from '../utils/api';
import { useAuth } from './AuthContext';

const BookingContext = createContext(undefined);

export const BookingProvider = ({ children }) => {
    const [bookings, setBookings] = useState([]);
    const [currentBookingDraft, setBookingDraft] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastError, setLastError] = useState(null);
    const { user, isAuthenticated } = useAuth();

    // Fetch user bookings from backend when user logs in
    useEffect(() => {
        if (isAuthenticated && user) {
            fetchUserBookings();
        } else {
            setBookings([]);
        }
    }, [isAuthenticated, user]);

    const fetchUserBookings = async () => {
        setLoading(true);
        setLastError(null);
        try {
            console.log('Fetching user bookings...');
            const response = await userAPI.getUserBookings();
            console.log('Fetch response:', response);
            if (response.success) {
                setBookings(response.bookings || []);
            }
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
            setLastError(error.message || 'Unknown error');
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const addBooking = async (booking) => {
        // After successful booking, wait a moment for DB to commit, then refetch from backend
        await new Promise(resolve => setTimeout(resolve, 500));
        await fetchUserBookings();
    };

    const cancelBooking = async (id) => {
        try {
            await paymentAPI.cancelBooking(id);
            // Refetch bookings from backend after cancellation
            await fetchUserBookings();
            alert('Booking cancelled successfully');
        } catch (error) {
            console.error("Cancellation failed", error);
            alert("Failed to cancel booking");
        }
    };

    return (
        <BookingContext.Provider value={{ bookings, addBooking, cancelBooking, currentBookingDraft, setBookingDraft, loading, fetchUserBookings, lastError }}>
            {children}
        </BookingContext.Provider>
    );
};

export const useBooking = () => {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
};
