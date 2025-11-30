import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

// ✅ API base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({
        username: 'admin',
        role: 'ADMIN',
        full_name: 'Admin User'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Authentication bypassed
    }, []);

    // ✅ Helper function to make authenticated requests
    const apiCall = useCallback(async (endpoint, options = {}) => {
        const token = localStorage.getItem('access_token');

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
            });

            // Handle empty responses
            const text = await response.text();
            let data = {};

            if (text) {
                try {
                    data = JSON.parse(text);
                } catch (jsonError) {
                    console.error('Invalid JSON response:', text);
                    throw new Error('Invalid server response format');
                }
            }

            if (!response.ok) {
                throw new Error(data.detail || `API Error: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`API call failed (${endpoint}):`, error);
            throw error;
        }
    }, []);

    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            try {
                // ✅ Verify token is still valid
                const data = await apiCall('/auth/me');
                setUser(data);
                setError(null);
            } catch (error) {
                console.error('Auth verification failed:', error);
                logout();
                setError('Session expired. Please login again.');
            }
        }

        setLoading(false);
    }, [apiCall]);

    const login = useCallback(async (username, password) => {
        try {
            setError(null);
            setLoading(true);

            // ✅ Use form data for OAuth2PasswordRequestForm compatibility
            const formBody = new URLSearchParams();
            formBody.append('username', username);
            formBody.append('password', password);

            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formBody
            });

            // ✅ Better response handling
            const text = await response.text();
            if (!text) {
                throw new Error('Empty response from server');
            }

            let data;
            try {
                data = JSON.parse(text);
            } catch (jsonError) {
                console.error('Invalid JSON response:', text);
                throw new Error('Invalid server response');
            }

            if (!response.ok) {
                throw new Error(data.detail || 'Login failed. Please check your credentials.');
            }

            // ✅ Validate response structure
            if (!data.token || !data.token.access_token) {
                throw new Error('Invalid authentication token received');
            }

            // ✅ Store tokens and user data securely
            localStorage.setItem('access_token', data.token.access_token);
            localStorage.setItem('refresh_token', data.token.refresh_token || '');
            localStorage.setItem('user', JSON.stringify(data.user));

            setUser(data.user);
            setError(null);
            return data.user;
        } catch (error) {
            const errorMessage = error?.message || 'Login failed. Please try again.';
            setError(errorMessage);
            console.error('Login error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUser(null);
        setError(null);
    }, []);

    const register = useCallback(async (userData) => {
        try {
            setError(null);
            return await apiCall('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
        } catch (error) {
            const errorMessage = error?.message || 'Registration failed';
            setError(errorMessage);
            throw error;
        }
    }, [apiCall]);

    // ✅ Memoize context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        user,
        loading,
        error,
        login,
        logout,
        register,
        isAuthenticated: !!user,
        apiCall
    }), [user, loading, error, login, logout, register, apiCall]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
