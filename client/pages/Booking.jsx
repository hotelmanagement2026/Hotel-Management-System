import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import api, { paymentAPI } from '../utils/api';
import Button from '../components/ui/Button';
import PromoCodeInput from '../components/booking/PromoCodeInput';
import { FaCalendarAlt, FaUser, FaCheck } from 'react-icons/fa';

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const Booking = () => {
    const { user } = useAuth();
    const { currentBookingDraft, addBooking, setBookingDraft } = useBooking();
    const navigate = useNavigate();

    const [checkIn, setCheckIn] = useState(new Date().toISOString().split('T')[0]);
    const [checkOut, setCheckOut] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    });
    const [guests, setGuests] = useState(2);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [seasonalDiscount, setSeasonalDiscount] = useState(null);

    useEffect(() => {
        if (!currentBookingDraft?.roomId) {
            navigate('/rooms');
        }
    }, [currentBookingDraft, navigate]);

    useEffect(() => {
        const fetchSeasonalDiscount = async () => {
            // Reset first
            setSeasonalDiscount(null);

            if (checkIn && checkOut && currentBookingDraft?.roomName) {
                try {
                    const { data } = await api.get('/seasonal-discounts/active', {
                        params: {
                            checkInDate: checkIn,
                            checkOutDate: checkOut,
                            roomType: currentBookingDraft.roomName
                        }
                    });

                    if (data.success && data.data) {
                        setSeasonalDiscount(data.data);
                    }
                } catch (error) {
                    console.error("Failed to fetch seasonal discount:", error);
                }
            }
        };

        fetchSeasonalDiscount();
    }, [checkIn, checkOut, currentBookingDraft]);

    const calculateTotal = () => {
        if (!checkIn || !checkOut || !currentBookingDraft?.totalPrice) return 0;
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return nights > 0 ? nights * currentBookingDraft.totalPrice : 0;
    };

    const getSeasonalDiscountAmount = () => {
        if (!seasonalDiscount) return 0;
        const total = calculateTotal();
        return Math.round((total * seasonalDiscount.discountPercentage) / 100);
    };

    const getFinalAmount = () => {
        const total = calculateTotal();
        const seasonalAmount = getSeasonalDiscountAmount();
        let final = total - seasonalAmount;

        if (appliedPromo) {
            final = Math.max(0, final - appliedPromo.discountAmount);
        }
        return Math.max(0, final);
    };

    const handlePromoApplied = (promoData) => {
        setAppliedPromo(promoData);
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }

        const finalAmount = getFinalAmount();
        if (finalAmount <= 0) {
            // Allow free booking if discount covers everything? 
            // Usually still create order for record.
            // For now assuming > 0 check for razorpay.
            // setPaymentError('Please select valid check-in and check-out dates.');
            // return;
        }

        if (calculateTotal() <= 0) {
            setPaymentError('Please select valid check-in and check-out dates.');
            return;
        }

        const razorpayKey = (import.meta.env.VITE_RAZORPAY_KEY_ID || '').trim();
        const normalizedKey = razorpayKey.toLowerCase();
        const isPlaceholderKey =
            !razorpayKey ||
            normalizedKey === 'your_razorpay_key_id' ||
            normalizedKey.includes('placeholder') ||
            normalizedKey.includes('dummy') ||
            normalizedKey.includes('example');
        const isLikelyValidKey = /^rzp_(test|live)_[a-z0-9]+$/i.test(razorpayKey);

        // Skip razorpay check if amount is 0 (100% discount) - handling logic might differ but for now assume minimal payment
        if (finalAmount > 0 && (!razorpayKey || isPlaceholderKey || !isLikelyValidKey)) {
            setPaymentError('Razorpay key is invalid. Set VITE_RAZORPAY_KEY_ID to your real rzp_test_... key and restart the client.');
            return;
        }

        setPaymentError('');
        setIsProcessing(true);

        const bookingId = `booking_${Date.now()}`;

        // If amount is 0, skip razorpay
        if (finalAmount === 0) {
            const newBooking = {
                id: bookingId,
                orderId: 'FREE_BOOKING',
                paymentId: 'FREE_PAYMENT',
                roomId: currentBookingDraft?.roomId || '',
                roomName: currentBookingDraft?.roomName || '',
                checkIn,
                checkOut,
                guests,
                totalPrice: 0,
                status: 'confirmed',
                dateBooked: new Date().toISOString(),
                promoCode: appliedPromo ? appliedPromo.code : null,
                discountAmount: appliedPromo ? appliedPromo.discountAmount : 0
            };
            addBooking(newBooking);
            setBookingDraft(null);
            setIsSuccess(true);
            setIsProcessing(false);
            return;
        }

        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
            setPaymentError('Failed to load payment gateway. Please try again.');
            setIsProcessing(false);
            return;
        }

        try {
            const order = await paymentAPI.createOrder({
                amount: finalAmount,
                bookingId,
                roomId: currentBookingDraft?.roomId,
                roomName: currentBookingDraft?.roomName,
                checkIn,
                checkOut,
            });

            if (!order?.id) {
                setPaymentError('Unable to create payment order. Please try again.');
                setIsProcessing(false);
                return;
            }

            const options = {
                key: razorpayKey,
                amount: order.amount,
                currency: order.currency || 'INR',
                name: 'Lumiere Luxury Hotels',
                description: currentBookingDraft?.roomName || 'Room Booking',
                order_id: order.id,
                prefill: {
                    name: user?.name,
                    email: user?.email,
                },
                theme: {
                    color: '#D4AF37',
                },
                handler: async (response) => {
                    try {
                        const verifyResponse = await paymentAPI.verifyPayment({
                            order_id: response.razorpay_order_id,
                            payment_id: response.razorpay_payment_id,
                            signature: response.razorpay_signature,
                            amount: finalAmount,
                            bookingId,
                            roomId: currentBookingDraft?.roomId,
                            roomName: currentBookingDraft?.roomName,
                            checkIn,
                            checkOut,
                            promoCode: appliedPromo ? appliedPromo.code : null,
                            discountAmount: (seasonalDiscountAmount || 0) + (appliedPromo ? appliedPromo.discountAmount : 0),
                            seasonalDiscount: seasonalDiscount || null
                        });

                        if (!verifyResponse.success) {
                            setPaymentError(verifyResponse.message || 'Payment verification failed.');
                            setIsProcessing(false);
                            return;
                        }

                        const newBooking = {
                            id: bookingId,
                            orderId: response.razorpay_order_id,
                            paymentId: response.razorpay_payment_id,
                            roomId: currentBookingDraft?.roomId || '',
                            roomName: currentBookingDraft?.roomName || '',
                            checkIn,
                            checkOut,
                            guests,
                            totalPrice: finalAmount,
                            status: 'confirmed',
                            dateBooked: new Date().toISOString(),
                            promoCode: appliedPromo ? appliedPromo.code : null,
                            discountAmount: appliedPromo ? appliedPromo.discountAmount : 0
                        };

                        addBooking(newBooking);
                        setBookingDraft(null);
                        setIsSuccess(true);
                    } catch (error) {
                        setPaymentError(error.message || 'Payment verification failed.');
                    } finally {
                        setIsProcessing(false);
                    }
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on('payment.failed', (response) => {
                setPaymentError(response.error?.description || 'Payment failed. Please try again.');
                setIsProcessing(false);
            });
            razorpay.open();
        } catch (error) {
            setPaymentError(error.message || 'Payment process failed.');
            setIsProcessing(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-dark-800 p-10 border border-gold-400 text-center max-w-md w-full"
                >
                    <div className="w-20 h-20 bg-gold-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaCheck size={40} className="text-dark-900" />
                    </div>
                    <h2 className="text-3xl font-serif text-stone-100 mb-4">Booking Confirmed</h2>
                    <p className="text-stone-400 mb-2">Thank you for choosing Lumiere. Your reservation has been successfully confirmed.</p>
                    <p className="text-gold-400 text-sm mb-8">A confirmation email has been sent to your registered email address.</p>
                    <Link to="/dashboard">
                        <Button className="w-full">View My Dashboard</Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    const grossTotal = calculateTotal();
    const seasonalDiscountAmount = getSeasonalDiscountAmount();
    const finalTotal = getFinalAmount();

    return (
        <div className="pt-24 min-h-screen bg-dark-900">
            <div className="container mx-auto px-6 py-12">
                <h1 className="text-4xl font-serif text-stone-100 mb-12 text-center">Finalize Your Stay</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
                    {/* Summary */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="bg-dark-800 p-8 border-t-4 border-gold-400">
                            <h3 className="text-2xl font-serif text-stone-100 mb-6">Booking Summary</h3>
                            <div className="space-y-4 text-stone-300">
                                <div className="flex justify-between border-b border-stone-700 pb-4">
                                    <span>Room</span>
                                    <span className="font-bold text-gold-400">{currentBookingDraft?.roomName}</span>
                                </div>
                                <div className="flex justify-between border-b border-stone-700 pb-4">
                                    <span>Price per night</span>
                                    <span>₹{currentBookingDraft?.totalPrice}</span>
                                </div>
                                <div className="pt-4">
                                    <div className="flex justify-between items-center text-lg text-white mb-2">
                                        <span>Subtotal</span>
                                        <span>₹{grossTotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    {seasonalDiscount && (
                                        <div className="flex justify-between items-center text-blue-400 mb-2">
                                            <span>Seasonal Offer ({seasonalDiscount.name})</span>
                                            <span>-₹{seasonalDiscountAmount.toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                    {appliedPromo && (
                                        <div className="flex justify-between items-center text-green-400 mb-2">
                                            <span>Promo Code ({appliedPromo.code})</span>
                                            <span>-₹{appliedPromo.discountAmount.toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-xl font-bold text-gold-400 border-t border-stone-700 pt-4 mt-2">
                                        <span>Total Payable</span>
                                        <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    <p className="text-xs text-stone-500 mt-2 text-right">*Excludes taxes and fees</p>
                                </div>
                            </div>
                        </div>

                        {/* Promo Code Input */}
                        <div className="bg-dark-800 p-6 border border-stone-800">
                            <PromoCodeInput
                                bookingAmount={grossTotal - seasonalDiscountAmount}
                                roomType={currentBookingDraft?.roomName || ''}
                                checkInDate={checkIn}
                                onPromoApplied={handlePromoApplied}
                            />
                        </div>
                    </motion.div>

                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-stone-400 text-sm mb-2">Check-in</label>
                                    <div className="relative">
                                        <FaCalendarAlt className="absolute left-3 top-3 text-gold-400" />
                                        <input
                                            type="date"
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full bg-dark-800 border border-stone-700 text-stone-200 py-2 pl-10 pr-4 focus:border-gold-400 focus:outline-none"
                                            value={checkIn}
                                            onChange={(e) => setCheckIn(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-stone-400 text-sm mb-2">Check-out</label>
                                    <div className="relative">
                                        <FaCalendarAlt className="absolute left-3 top-3 text-gold-400" />
                                        <input
                                            type="date"
                                            required
                                            min={checkIn || new Date().toISOString().split('T')[0]}
                                            className="w-full bg-dark-800 border border-stone-700 text-stone-200 py-2 pl-10 pr-4 focus:border-gold-400 focus:outline-none"
                                            value={checkOut}
                                            onChange={(e) => setCheckOut(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-stone-400 text-sm mb-2">Guests</label>
                                <div className="relative">
                                    <FaUser className="absolute left-3 top-3 text-gold-400" />
                                    <select
                                        value={guests}
                                        onChange={(e) => setGuests(Number(e.target.value))}
                                        className="w-full bg-dark-800 border border-stone-700 text-stone-200 py-2 pl-10 pr-4 focus:border-gold-400 focus:outline-none"
                                    >
                                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
                                    </select>
                                </div>
                            </div>

                            {!user && (
                                <div className="bg-stone-900/50 p-4 border border-stone-700 text-sm text-stone-400">
                                    Please <Link to="/login" className="text-gold-400 hover:underline">login</Link> to complete your reservation.
                                </div>
                            )}

                            {paymentError && (
                                <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 text-sm">
                                    {paymentError}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full mt-6"
                                disabled={!checkIn || !checkOut || isProcessing}
                            >
                                {isProcessing ? 'Processing...' : (user ? `Pay ₹${finalTotal.toLocaleString('en-IN')} & Confirm` : 'Login to Book')}
                            </Button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Booking;
