import axios from 'axios';

const apiBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: apiBaseURL,
    withCredentials: true, // Important for cookies
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const message = error.response.data?.message || 'An error occurred';
            return Promise.reject({ message, status: error.response.status });
        }
        if (error.request) {
            return Promise.reject({
                message: 'Backend unavailable. Please start the server at http://localhost:4000.',
                isNetworkError: true,
            });
        }
        return Promise.reject({ message: error.message || 'Request failed' });
    }
);

// Auth API calls
export const authAPI = {
    register: async (name, email, password) => {
        const response = await api.post('/auth/register', { name, email, password });
        return response.data;
    },

    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    isAuthenticated: async () => {
        const response = await api.post('/auth/is-auth');
        return response.data;
    },

    sendVerifyOtp: async () => {
        const response = await api.post('/auth/send-verify-otp');
        return response.data;
    },

    verifyEmail: async (otp) => {
        const response = await api.post('/auth/verify-account', { otp });
        return response.data;
    },

    sendResetOtp: async (email) => {
        const response = await api.post('/auth/send-reset-otp', { email });
        return response.data;
    },

    resetPassword: async (email, otp, newPassword) => {
        const response = await api.post('/auth/reset-password', { email, otp, newPassword });
        return response.data;
    },
};

// User API calls
export const userAPI = {
    getUserData: async () => {
        const response = await api.get('/user/data');
        return response.data;
    },

    getUserBookings: async () => {
        const response = await api.get('/user/bookings');
        return response.data;
    },
};

// Payment API calls
export const paymentAPI = {
    createOrder: async ({ amount, bookingId, roomId, roomName }) => {
        const response = await api.post('/payment/create-order', {
            amount,
            bookingId,
            roomId,
            roomName,
        });
        return response.data;
    },

    verifyPayment: async ({ order_id, payment_id, signature, amount, bookingId, roomId, roomName, checkIn, checkOut }) => {
        const response = await api.post('/payment/verify', {
            order_id,
            payment_id,
            signature,
            amount,
            bookingId,
            roomId,
            roomName,
            checkIn,
            checkOut,
        });
        return response.data;
    },

    cancelBooking: async (bookingId) => {
        const response = await api.post('/payment/cancel-booking', { bookingId });
        return response.data;
    },
};

export default api;
