import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AdminLayout from './components/admin/AdminLayout';

// Pages
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import RoomDetails from './pages/RoomDetails';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import EmailVerify from './pages/EmailVerify';
import Dashboard from './pages/Dashboard';
import Booking from './pages/Booking';
import About from './pages/About';
import Contact from './pages/Contact';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import RoomManagement from './pages/admin/RoomManagement';
import BookingManagement from './pages/admin/BookingManagement';
import PaymentManagement from './pages/admin/PaymentManagement';
import Reports from './pages/admin/Reports';
import AdminReviews from './pages/admin/AdminReviews';
import PromoCodeManagement from './pages/admin/PromoCodeManagement';
import SeasonalDiscountManagement from './pages/admin/SeasonalDiscountManagement';

// Admin Components
import InvoiceManagement from './components/admin/InvoiceManagement';
import RefundManagement from './components/admin/RefundManagement';

// Layout wrapper for regular pages
const MainLayout = ({ children }) => (
    <div className="flex flex-col min-h-screen bg-dark-900 text-stone-100 font-sans selection:bg-gold-400 selection:text-dark-900">
        <Navbar />
        <main className="flex-grow">
            {children}
        </main>
        <Footer />
    </div>
);

const App = () => {
    return (
        <AuthProvider>
            <BookingProvider>
                <Router>
                    <Toaster position="top-right" toastOptions={{
                        style: {
                            background: '#1c1917',
                            color: '#e7e5e4',
                            border: '1px solid #44403c',
                        },
                    }} />
                    <Routes>
                        {/* Admin routes without Navbar/Footer */}
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<AdminDashboard />} />
                            <Route path="users" element={<UserManagement />} />
                            <Route path="rooms" element={<RoomManagement />} />
                            <Route path="bookings" element={<BookingManagement />} />
                            <Route path="payments" element={<PaymentManagement />} />
                            <Route path="reports" element={<Reports />} />
                            <Route path="reviews" element={<AdminReviews />} />
                            <Route path="invoices" element={<InvoiceManagement />} />
                            <Route path="promocodes" element={<PromoCodeManagement />} />
                            <Route path="discounts" element={<SeasonalDiscountManagement />} />
                            <Route path="refunds" element={<RefundManagement />} />
                        </Route>

                        {/* Regular routes with Navbar/Footer */}
                        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
                        <Route path="/rooms" element={<MainLayout><Rooms /></MainLayout>} />
                        <Route path="/rooms/:id" element={<MainLayout><RoomDetails /></MainLayout>} />
                        <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
                        <Route path="/forgot-password" element={<MainLayout><ForgotPassword /></MainLayout>} />
                        <Route path="/email-verify" element={<MainLayout><EmailVerify /></MainLayout>} />
                        <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
                        <Route path="/booking" element={<MainLayout><Booking /></MainLayout>} />
                        <Route path="/about" element={<MainLayout><About /></MainLayout>} />
                        <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
                    </Routes>
                </Router>
            </BookingProvider>
        </AuthProvider>
    );
};

export default App;
