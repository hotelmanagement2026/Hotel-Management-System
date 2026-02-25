import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTag, FaTimes, FaSpinner } from 'react-icons/fa';
import api from '../../utils/api';

const PromoCodeInput = ({ bookingAmount, roomType, checkInDate, onPromoApplied }) => {
    const [promoCode, setPromoCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);

    // Reset promo if booking details change
    React.useEffect(() => {
        if (appliedPromo) {
            setAppliedPromo(null);
            onPromoApplied(null);
            // Optional: keep the code in input but force re-apply
            setError('Booking details updated. Please re-apply promo code.');
        }
    }, [bookingAmount, roomType]);

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) {
            setError('Please enter a promo code');
            return;
        }

        if (!bookingAmount || bookingAmount <= 0) {
            setError('Please select check-in and check-out dates first');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/promocodes/validate', {
                code: promoCode.toUpperCase(),
                bookingAmount,
                roomType
            });

            if (data.success) {
                setAppliedPromo(data.data);
                setError('');
                onPromoApplied(data.data);
            }
        } catch (err) {
            console.error('Promo code error:', err);
            const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to validate promo code';
            setError(errorMessage);
            setAppliedPromo(null);
            onPromoApplied(null);
        } finally {
            setLoading(false);
        }
    };

    const handleRemovePromo = () => {
        setPromoCode('');
        setAppliedPromo(null);
        setError('');
        onPromoApplied(null);
    };

    const handleInputChange = (e) => {
        const value = e.target.value.toUpperCase();
        setPromoCode(value);
        setError('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleApplyPromo();
        }
    };

    return (
        <div className="space-y-4">
            {/* Input Section */}
            {!appliedPromo && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-stone-300">
                        Have a Promo Code?
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaTag className="text-stone-500" />
                            </div>
                            <input
                                type="text"
                                value={promoCode}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Enter promo code"
                                disabled={loading}
                                className="w-full pl-10 pr-4 py-3 bg-dark-800 border border-stone-700 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-gold-400 transition-colors uppercase"
                            />
                        </div>
                        <button
                            onClick={handleApplyPromo}
                            disabled={loading || !promoCode.trim()}
                            className="px-6 py-3 bg-gold-400 text-dark-900 font-medium hover:bg-gold-500 disabled:bg-stone-700 disabled:text-stone-500 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    <span>Applying...</span>
                                </>
                            ) : (
                                <span>Apply</span>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        key="error-message"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3 bg-red-900/20 border border-red-500/50 text-red-400 text-sm flex items-start gap-2"
                    >
                        <span className="flex-1">{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Banner */}
            <AnimatePresence>
                {appliedPromo && (
                    <motion.div
                        key="success-banner"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-4 bg-green-900/20 border border-green-500/50 space-y-2"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <FaTag className="text-green-400" />
                                    <span className="font-semibold text-green-400 text-lg">
                                        {appliedPromo.code}
                                    </span>
                                </div>
                                <p className="text-stone-300 text-sm mb-2">
                                    {appliedPromo.description}
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-stone-400 text-sm">You saved:</span>
                                    <span className="text-green-400 font-bold text-xl">
                                        ₹{appliedPromo.discountAmount.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={handleRemovePromo}
                                className="text-stone-400 hover:text-red-400 transition-colors p-1"
                                title="Remove promo code"
                            >
                                <FaTimes size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PromoCodeInput;
