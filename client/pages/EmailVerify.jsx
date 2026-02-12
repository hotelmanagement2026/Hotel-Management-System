import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const EmailVerify = () => {
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [status, setStatus] = useState({ type: '', message: '' });

    const navigate = useNavigate();
    const { checkAuth } = useAuth();

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [resendCooldown]);

    const handleSendOtp = async () => {
        if (resendCooldown > 0) return;

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await authAPI.sendVerifyOtp();
            if (response.success) {
                setOtpSent(true);
                setResendCooldown(60);
                setStatus({ type: 'success', message: response.message || 'Verification code sent.' });
            } else {
                setStatus({ type: 'error', message: response.message || 'Failed to send verification code.' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: err.message || 'Failed to send verification code.' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const trimmedOtp = otp.trim();
        if (trimmedOtp.length !== 6) {
            setStatus({ type: 'error', message: 'Enter the 6-digit verification code.' });
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await authAPI.verifyEmail(trimmedOtp);
            if (response.success) {
                setStatus({ type: 'success', message: response.message || 'Email verified successfully.' });
                await checkAuth();
                setTimeout(() => navigate('/dashboard'), 800);
            } else {
                setStatus({ type: 'error', message: response.message || 'Verification failed.' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: err.message || 'Verification failed.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6 pt-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dark-800 p-10 border border-stone-800 max-w-md w-full"
            >
                <h2 className="text-3xl font-serif text-stone-100 mb-2 text-center">
                    Verify Your Email
                </h2>
                <p className="text-stone-400 text-center mb-8">
                    {otpSent
                        ? 'Enter the 6-digit code sent to your email.'
                        : 'Send a verification code to secure your account.'}
                </p>

                {status.message && (
                    <div className={`${status.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-red-500/10 border-red-500 text-red-400'} border px-4 py-3 rounded mb-6 text-sm`}>
                        {status.message}
                    </div>
                )}

                <div className="space-y-6">
                    {otpSent && (
                        <form onSubmit={handleVerify} className="space-y-6">
                            <div>
                                <label className="block text-stone-400 text-xs uppercase tracking-widest mb-2">
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full bg-dark-900 border border-stone-700 text-stone-100 px-4 py-3 focus:border-gold-400 focus:outline-none"
                                    placeholder="Enter 6-digit code"
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify Email'}
                            </Button>
                        </form>
                    )}

                    {!otpSent && (
                        <Button type="button" className="w-full" onClick={handleSendOtp} disabled={loading}>
                            {loading ? 'Sending...' : 'Send Verification Code'}
                        </Button>
                    )}

                    {otpSent && (
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={handleSendOtp}
                            disabled={loading || resendCooldown > 0}
                        >
                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                        </Button>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-stone-800 text-center">
                    <Link to="/dashboard" className="text-stone-500 hover:text-stone-300 text-sm transition-colors">
                        Back to Dashboard
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default EmailVerify;
