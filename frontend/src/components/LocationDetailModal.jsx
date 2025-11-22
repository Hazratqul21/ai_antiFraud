import React, { useState, useEffect } from 'react';

const LocationDetailModal = ({ location, onClose }) => {
    const [timeRange, setTimeRange] = useState('1h');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!location) return;

        const fetchLocationDetail = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/analytics/location/${encodeURIComponent(location)}/detail?time_range=${timeRange}`);
                const result = await res.json();
                setData(result);
            } catch (error) {
                console.error('Error fetching location detail:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLocationDetail();
    }, [location, timeRange]);

    if (!location) return null;

    const timeRanges = [
        { value: '1h', label: 'Last Hour', icon: '⏱️' },
        { value: '6h', label: 'Last 6 Hours', icon: '🕐' },
        { value: '24h', label: 'Last 24 Hours', icon: '📅' }
    ];

    const getStatusColor = (status) => {
        const colors = {
            'ALLOW': 'text-green-400',
            'BLOCK': 'text-red-400',
            'CHALLENGE': 'text-yellow-400',
            'PENDING': 'text-gray-400'
        };
        return colors[status] || 'text-gray-400';
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            📍 {location}
                            <span className="text-sm font-normal text-purple-400">Live Analytics</span>
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">Real-time transaction monitoring and fraud detection</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Time Range Selector */}
                <div className="p-6 border-b border-white/10 bg-white/5">
                    <div className="flex gap-3">
                        {timeRanges.map(range => (
                            <button
                                key={range.value}
                                onClick={() => setTimeRange(range.value)}
                                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${timeRange === range.value
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <div className="text-lg mb-1">{range.icon}</div>
                                <div className="text-sm">{range.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-240px)]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="ml-3 text-gray-400">Loading statistics...</span>
                        </div>
                    ) : data ? (
                        <div className="space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                                    <div className="text-gray-400 text-xs font-medium mb-1">Total Transactions</div>
                                    <div className="text-2xl font-bold text-white">{data.stats.total}</div>
                                </div>
                                <div className="bg-green-500/10 backdrop-blur-xl border border-green-500/30 rounded-xl p-4">
                                    <div className="text-green-400 text-xs font-medium mb-1">✓ Approved</div>
                                    <div className="text-2xl font-bold text-green-400">{data.stats.approved}</div>
                                </div>
                                <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-xl p-4">
                                    <div className="text-red-400 text-xs font-medium mb-1">✕ Blocked</div>
                                    <div className="text-2xl font-bold text-red-400">{data.stats.blocked}</div>
                                </div>
                                <div className="bg-yellow-500/10 backdrop-blur-xl border border-yellow-500/30 rounded-xl p-4">
                                    <div className="text-yellow-400 text-xs font-medium mb-1">⏱ Under Review</div>
                                    <div className="text-2xl font-bold text-yellow-400">{data.stats.challenged}</div>
                                </div>
                            </div>

                            {/* Fraud Rate Indicator */}
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-white">Fraud Rate</h3>
                                    <span className={`text-2xl font-bold ${data.stats.fraud_rate > 0.3 ? 'text-red-400' :
                                            data.stats.fraud_rate > 0.1 ? 'text-yellow-400' : 'text-green-400'
                                        }`}>
                                        {(data.stats.fraud_rate * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${data.stats.fraud_rate > 0.3 ? 'bg-gradient-to-r from-red-600 to-red-400' :
                                                data.stats.fraud_rate > 0.1 ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' :
                                                    'bg-gradient-to-r from-green-600 to-green-400'
                                            }`}
                                        style={{ width: `${Math.min(data.stats.fraud_rate * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Total Volume */}
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                                <div className="text-gray-400 text-sm font-medium mb-1">Total Transaction Volume</div>
                                <div className="text-2xl font-bold text-purple-400">
                                    ${data.stats.total_volume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>

                            {/* Recent Transactions */}
                            {data.recent_transactions && data.recent_transactions.length > 0 && (
                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                                    <div className="p-4 border-b border-white/10">
                                        <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-white/5">
                                                <tr>
                                                    <th className="p-3 text-left text-gray-400 font-medium">ID</th>
                                                    <th className="p-3 text-left text-gray-400 font-medium">Time</th>
                                                    <th className="p-3 text-left text-gray-400 font-medium">Merchant</th>
                                                    <th className="p-3 text-right text-gray-400 font-medium">Amount</th>
                                                    <th className="p-3 text-center text-gray-400 font-medium">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {data.recent_transactions.map((tx, idx) => (
                                                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                        <td className="p-3 text-gray-300 font-mono text-xs">{tx.id}</td>
                                                        <td className="p-3 text-gray-400 text-xs">
                                                            {new Date(tx.timestamp).toLocaleTimeString()}
                                                        </td>
                                                        <td className="p-3 text-white">{tx.merchant}</td>
                                                        <td className="p-3 text-right text-white font-mono">
                                                            ${tx.amount.toFixed(2)}
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <span className={`${getStatusColor(tx.status)} font-semibold text-xs`}>
                                                                {tx.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            No data available for this location
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LocationDetailModal;
