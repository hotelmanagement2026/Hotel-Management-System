import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authAPI, userAPI } from '../utils/api';

const AuthContext = createContext(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const hasCheckedAuthRef = useRef(false);

    // Check if user is authenticated on mount
    useEffect(() => {
        if (hasCheckedAuthRef.current) return;
        hasCheckedAuthRef.current = true;
        checkAuth();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await userAPI.getUserData();
            if (response.success) {
                setUser(response.userData);
                return response.userData;
            }
        } catch (err) {
            // ignore and fall through to clear user
        }
        setUser(null);
        return null;
    };

    const checkAuth = async () => {
        setLoading(true);
        try {
            const response = await authAPI.isAuthenticated();
            if (response.success) {
                if (response.userData) {
                    setUser(response.userData);
                } else {
                    await fetchUserData();
                }
            } else {
                setUser(null);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password) => {
        try {
            setError(null);
            const response = await authAPI.register(name, email, password);
            if (response.success) {
                // Auto-login after registration
                const loginResult = await login(email, password);
                return loginResult.success ? { success: true } : loginResult;
            }
            return { success: false, message: response.message };
        } catch (err) {
            setError(err.message || 'Authentication failed');
            return { success: false, message: err.message };
        }
    };

    const login = async (email, password) => {
        try {
            setError(null);
            const response = await authAPI.login(email, password);
            if (response.success) {
                if (response.userData) {
                    setUser(response.userData);
                } else {
                    await fetchUserData();
                }
                return { success: true };
            }
            return { success: false, message: response.message };
        } catch (err) {
            setError(err.message || 'Login failed');
            return { success: false, message: err.message || 'Login failed' };
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
            setUser(null);
        } catch (err) {
            console.error('Logout error:', err);
            // Clear user anyway
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                register,
                isAuthenticated: !!user,
                loading,
                error,
                checkAuth
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
