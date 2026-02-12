import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { authAPI } from '../utils/api';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email) {
            setStatus({ type: 'error', message: 'Please enter your email address.' });
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await authAPI.sendResetOtp(email);
            if (response.success) {
                setStep(2);
                setStatus({ type: 'success', message: response.message || 'Reset code sent to your email.' });
            } else {
                setStatus({ type: 'error', message: response.message || 'Failed to send reset code.' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: err.message || 'Failed to send reset code.' });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!otp || !newPassword) {
            setStatus({ type: 'error', message: 'Please enter the code and a new password.' });
            return;
        }
        if (newPassword.length < 6) {
            setStatus({ type: 'error', message: 'Password must be at least 6 characters.' });
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await authAPI.resetPassword(email, otp.trim(), newPassword);
            if (response.success) {
                setStatus({ type: 'success', message: response.message || 'Password reset successfully.' });
                setTimeout(() => navigate('/login'), 800);
            } else {
                setStatus({ type: 'error', message: response.message || 'Failed to reset password.' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: err.message || 'Failed to reset password.' });
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
                <h2 className="text-3xl font-serif text-stone-100 mb-2 text-center">Reset Password</h2>
                <p className="text-stone-400 text-center mb-8">
                    {step === 1 ? 'Enter your email to receive a reset code.' : 'Enter the code and choose a new password.'}
                </p>

                {status.message && (
                    <div className={`${status.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-red-500/10 border-red-500 text-red-400'} border px-4 py-3 rounded mb-6 text-sm`}>
                        {status.message}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-6">
                        <div>
                            <label className="block text-stone-400 text-xs uppercase tracking-widest mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-dark-900 border border-stone-700 text-stone-100 px-4 py-3 focus:border-gold-400 focus:outline-none"
                                placeholder="you@example.com"
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Code'}
                        </Button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label className="block text-stone-400 text-xs uppercase tracking-widest mb-2">
                                Reset Code
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

                        <div>
                            <label className="block text-stone-400 text-xs uppercase tracking-widest mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-dark-900 border border-stone-700 text-stone-100 px-4 py-3 focus:border-gold-400 focus:outline-none"
                                placeholder="********"
                                minLength={6}
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setStep(1)}
                                disabled={loading}
                            >
                                Back
                            </Button>
                            <Button type="submit" className="flex-1" disabled={loading}>
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </div>
                    </form>
                )}

                <div className="mt-8 pt-6 border-t border-stone-800 text-center">
                    <Link to="/login" className="text-stone-500 hover:text-stone-300 text-sm transition-colors">
                        Back to Sign In
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
