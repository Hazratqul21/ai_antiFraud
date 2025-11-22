import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

export default function LiveActivity({ transactions: initialTransactions }) {
    const [transactions, setTransactions] = useState(initialTransactions || []);
    const [isLive, setIsLive] = useState(true);

    // WebSocket connection for real-time updates
    const { isConnected, lastMessage } = useWebSocket('http://localhost:8000/realtime/ws', {
        onMessage: (data) => {
            if (data.type === 'new_transaction' && isLive) {
                // Add new transaction to the top
                setTransactions(prev => [data.data.transaction, ...prev].slice(0, 50));
            } else if (data.type === 'stats_update') {
                // Handle stats update if needed
                console.log('Stats updated:', data.data.stats);
            }
        },
        reconnectInterval: 3000,
        maxReconnectAttempts: 5
    });

    useEffect(() => {
        if (initialTransactions) {
            setTransactions(initialTransactions);
        }
    }, [initialTransactions]);

    const timeAgo = (timestamp) => {
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    const getStatusBadge = (status) => {
        const configs = {
            'ALLOW': { class: 'bg-green-500/15 text-green-400 border-green-500/30', icon: '✓', label: 'APPROVED' },
            'CHALLENGE': { class: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', icon: '⏱', label: 'REVIEW' },
            'BLOCK': { class: 'bg-red-500/15 text-red-400 border-red-500/30', icon: '✕', label: 'BLOCKED' }
        };
        return configs[status] || configs['ALLOW'];
    };

    const recentActivities = transactions.slice(0, 10);

    return (
        <div className="glass-card h-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <span
                        className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}
                        style={{ animation: isConnected ? 'livePulse 2s infinite' : 'none' }}
                    />
                    Live Activity
                </h2>

                <button
                    onClick={() => setIsLive(!isLive)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${isLive
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}
                >
                    {isLive ? '🔴 LIVE' : '⏸ PAUSED'}
                </button>
            </div>

            {!isConnected && (
                <div className="mb-3 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs">
                    ⚠️ Reconnecting to live feed...
                </div>
            )}

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {recentActivities.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-2">⏳</div>
                        <p className="text-gray-500">Waiting for transactions...</p>
                    </div>
                ) : (
                    recentActivities.map((tx, index) => {
                        const statusConfig = getStatusBadge(tx.status);
                        return (
                            <div
                                key={tx.id || `${tx.transaction_id}-${index}`}
                                className="p-3 rounded-xl bg-white/2 border border-white/5 transition-all duration-300 hover:bg-white/5 hover:translate-x-1 cursor-pointer"
                                style={{ animation: `slideInLeft 0.5s ease-out ${index * 0.05}s both` }}
                            >
                                <div className="flex justify-between items-center mb-1.5">
                                    <div className="mono font-bold text-base">
                                        {tx.amount.toLocaleString()} <span className="text-blue-400 text-sm">so'm</span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {timeAgo(tx.timestamp)}
                                    </div>
                                </div>

                                <div className="text-sm text-gray-400 mb-2">
                                    {tx.user_id} → {tx.merchant}
                                </div>

                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${statusConfig.class}`}>
                                    {statusConfig.icon} {statusConfig.label}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

