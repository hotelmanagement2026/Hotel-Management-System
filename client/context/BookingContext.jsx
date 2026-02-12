import React, { createContext, useContext, useState, useEffect } from 'react';
import { paymentAPI } from '../utils/api';

const BookingContext = createContext(undefined);

export const BookingProvider = ({ children }) => {
    const [bookings, setBookings] = useState([]);
    const [currentBookingDraft, setBookingDraft] = useState(null);

    useEffect(() => {
        const storedBookings = localStorage.getItem('lumiere_bookings');
        if (storedBookings) {
            setBookings(JSON.parse(storedBookings));
        }
    }, []);

    const addBooking = (booking) => {
        const updatedBookings = [...bookings, booking];
        setBookings(updatedBookings);
        localStorage.setItem('lumiere_bookings', JSON.stringify(updatedBookings));
    };

    const cancelBooking = async (id) => {
        try {
            await paymentAPI.cancelBooking(id);
            const updatedBookings = bookings.map(b =>
                b.id === id ? { ...b, status: 'cancelled' } : b
            );
            setBookings(updatedBookings);
            localStorage.setItem('lumiere_bookings', JSON.stringify(updatedBookings));
            // Ideally should re-fetch from backend if we were syncing real-time
            alert('Booking cancelled successfully');
        } catch (error) {
            console.error("Cancellation failed", error);
            alert("Failed to cancel booking");
        }
    };

    return (
        <BookingContext.Provider value={{ bookings, addBooking, cancelBooking, currentBookingDraft, setBookingDraft }}>
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
