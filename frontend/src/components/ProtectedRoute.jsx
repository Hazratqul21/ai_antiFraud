import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole = null }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-pulse">🛡️</div>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check role if specified
    if (requiredRole && user.role !== requiredRole && !['ADMIN'].includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
                <div className="glass-card p-8 rounded-2xl text-center max-w-md">
                    <div className="text-6xl mb-4">🚫</div>
                    <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                    <p className="text-gray-400 mb-4">
                        You don't have permission to access this page.
                    </p>
                    <p className="text-sm text-gray-500">
                        Required role: <span className="text-purple-400">{requiredRole}</span><br />
                        Your role: <span className="text-pink-400">{user.role}</span>
                    </p>
                </div>
            </div>
        );
    }

    return children;
}
