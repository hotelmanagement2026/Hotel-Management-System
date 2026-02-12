/**
 * User Interface based on MongoDB Schema
 */
export interface User {
    _id: string;
    name: string;
    email: string;
    password?: string; // Not usually returned to client
    isAccountVerified: boolean;
    verifyOtp?: number;
    verifyOtpExpireAt?: number;
    resetOtp?: string;
    resetOtpExpireAt?: number;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Room Interface based on data/rooms.js
 */
export interface Room {
    id: string;
    name: string;
    price: number;
    rating: number;
    description: string;
    image: string;
    images: string[];
    type: 'Suite' | 'Penthouse' | 'Deluxe' | 'Standard' | string;
    amenities: string[];
    maxGuests: number;
    size: string;
}

/**
 * Booking Interface based on BookingContext usage
 */
export interface Booking {
    id: string;
    orderId?: string;
    paymentId?: string;
    roomId: string; // Foreign Key to Room
    userId: string; // Foreign Key to User
    checkIn: string; // ISO Date String
    checkOut: string; // ISO Date String
    guests: number;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    createdAt: string;
}

/**
 * Auth Context Interface
 */
export interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

/**
 * Booking Context Interface
 */
export interface BookingContextType {
    bookings: Booking[];
    currentBookingDraft: Partial<Booking> | null;
    setBookingDraft: (booking: Partial<Booking> | null) => void;
    addBooking: (booking: Booking) => void;
    cancelBooking: (id: string) => void;
}
