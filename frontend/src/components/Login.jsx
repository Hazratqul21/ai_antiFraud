import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PropTypes from 'prop-types';

export default function Login() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState({ username: false, password: false });
    const navigate = useNavigate();
    const { login } = useAuth();

    // ✅ Validation logic
    const validation = useMemo(() => {
        const errors = {};
        if (touched.username && !formData.username.trim()) {
            errors.username = 'Username is required';
        }
        if (touched.password && !formData.password) {
            errors.password = 'Password is required';
        }
        if (touched.username && formData.username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
        }
        if (touched.password && formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        return errors;
    }, [formData, touched]);

    const isFormValid = useMemo(() => {
        return formData.username.trim().length >= 3 && 
               formData.password.length >= 6 && 
               Object.keys(validation).length === 0;
    }, [formData, validation]);

    // ✅ Optimized handlers
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleBlur = useCallback((e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        
        if (!isFormValid) {
            setTouched({ username: true, password: true });
            return;
        }

        setError('');
        setLoading(true);

        try {
            await login(formData.username.trim(), formData.password);
            navigate('/');
        } catch (err) {
            setError(err?.message || 'Login failed. Please try again.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    }, [formData, isFormValid, login, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 w-full max-w-md p-8">
                <div className="glass-card p-8 rounded-2xl border border-white/10">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="text-4xl mb-2">🛡️</div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                            FraudGuard AI
                        </h1>
                        <p className="text-gray-400 text-sm mt-2">Anti-Fraud Platform</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-pulse">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full px-4 py-3 rounded-lg bg-white/5 border text-white placeholder-gray-500 focus:outline-none focus:bg-white/8 transition-all ${
                                    validation.username && touched.username
                                        ? 'border-red-500/50 focus:border-red-500/50'
                                        : 'border-white/10 focus:border-purple-500/50'
                                }`}
                                placeholder="Enter your username"
                                required
                            />
                            {validation.username && touched.username && (
                                <p className="text-red-400 text-xs mt-1">ℹ️ {validation.username}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full px-4 py-3 rounded-lg bg-white/5 border text-white placeholder-gray-500 focus:outline-none focus:bg-white/8 transition-all ${
                                    validation.password && touched.password
                                        ? 'border-red-500/50 focus:border-red-500/50'
                                        : 'border-white/10 focus:border-purple-500/50'
                                }`}
                                placeholder="Enter your password"
                                required
                            />
                            {validation.password && touched.password && (
                                <p className="text-red-400 text-xs mt-1">ℹ️ {validation.password}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !isFormValid}
                            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin">⏳</span>
                                    Logging in...
                                </span>
                            ) : (
                                '🔐 Login'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-400">
                        Don't have an account?{' '}
                        <button
                            onClick={() => navigate('/register')}
                            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                        >
                            Register
                        </button>
                    </div>
                </div>

                <div className="mt-6 text-center text-xs text-gray-500">
                    AI Foundry powered by School21
                </div>
            </div>
        </div>
    );
}

// ✅ PropTypes validation
Login.propTypes = {};

Login.defaultProps = {};
