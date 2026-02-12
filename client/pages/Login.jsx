import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let result;
            if (isRegister) {
                result = await register(name, email, password);
                if (result.success) {
                    navigate('/email-verify');
                    return;
                }
            } else {
                result = await login(email, password);
                if (result.success) {
                    navigate('/dashboard');
                    return;
                }
            }

            setError(result.message || 'Authentication failed');
        } catch (err) {
            setError(err.message || 'An error occurred');
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
                    {isRegister ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-stone-400 text-center mb-8">
                    {isRegister ? 'Join Lumiere Luxury Hotels' : 'Sign in to your account'}
                </p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {isRegister && (
                        <div>
                            <label className="block text-stone-400 text-xs uppercase tracking-widest mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-dark-900 border border-stone-700 text-stone-100 px-4 py-3 focus:border-gold-400 focus:outline-none"
                                placeholder="Alexander Hamilton"
                            />
                        </div>
                    )}

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

                    <div>
                        <label className="block text-stone-400 text-xs uppercase tracking-widest mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-dark-900 border border-stone-700 text-stone-100 px-4 py-3 focus:border-gold-400 focus:outline-none"
                            placeholder="********"
                            minLength={6}
                        />
                    </div>

                    {!isRegister && (
                        <div className="text-right">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-stone-400 hover:text-gold-400 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full mt-6"
                        disabled={loading}
                    >
                        {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsRegister(!isRegister);
                            setError('');
                            setName('');
                            setEmail('');
                            setPassword('');
                        }}
                        className="text-stone-400 hover:text-gold-400 text-sm transition-colors"
                    >
                        {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-stone-800 text-center">
                    <Link to="/" className="text-stone-500 hover:text-stone-300 text-sm transition-colors">
                        Back to Home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
