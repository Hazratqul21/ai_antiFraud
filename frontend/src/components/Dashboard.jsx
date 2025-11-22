import React, { useState } from 'react';

export default function Dashboard({ stats, transactions = [], onAction, actionLoadingId }) {
    const [filter, setFilter] = useState('all');

    if (!stats) return null;

    const totalTransactions = stats.total_transactions || 0;
    const approvedShare = totalTransactions ? stats.approved_transactions / totalTransactions : 0;
    const blockedShare = totalTransactions ? stats.blocked_transactions / totalTransactions : 0;
    const reviewShare = totalTransactions ? stats.challenged_transactions / totalTransactions : 0;
    const pendingShare = totalTransactions ? stats.pending_transactions / totalTransactions : 0;

    const approvalRate = (approvedShare * 100).toFixed(1);
    const blockedRate = (blockedShare * 100).toFixed(1);
    const reviewRate = (reviewShare * 100).toFixed(1);

    const statCards = [
        {
            label: 'TOTAL TRANSACTIONS',
            value: stats.total_transactions.toLocaleString(),
            trend: '↗ 12.5% from yesterday',
            trendUp: true,
            icon: '📊',
            gradient: 'from-blue-500 to-cyan-500'
        },
        {
            label: 'BLOCKED TRANSACTIONS',
            value: stats.blocked_transactions.toLocaleString(),
            trend: '↘ 3.2% from yesterday',
            trendUp: false,
            icon: '🚫',
            gradient: 'from-red-500 to-pink-500'
        },
        {
            label: 'UNDER REVIEW',
            value: stats.challenged_transactions.toLocaleString(),
            trend: '↗ 5.8% from yesterday',
            trendUp: true,
            icon: '⏱️',
            gradient: 'from-orange-500 to-yellow-500'
        },
        {
            label: 'FRAUD RATE',
            value: `${blockedRate}%`,
            trend: '↘ 0.15% from yesterday',
            trendUp: blockedShare < 0.05,
            icon: '📈',
            gradient: 'from-purple-500 to-pink-500'
        },
        {
            label: 'APPROVAL RATE',
            value: `${approvalRate}%`,
            trend: '↗ Dynamic from live data',
            trendUp: true,
            icon: '🛡️',
            gradient: 'from-emerald-500 to-green-500'
        },
    ];

    const timeAgo = (timestamp) => {
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };

    const getStatusBadge = (status) => {
        const configs = {
            'ALLOW': { class: 'bg-green-500/20 text-green-400 border-green-500/50', icon: '✓', label: 'APPROVED' },
            'CHALLENGE': { class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', icon: '⏱', label: 'REVIEW' },
            'BLOCK': { class: 'bg-red-500/20 text-red-400 border-red-500/50', icon: '✕', label: 'BLOCKED' }
        };
        return configs[status] || configs['ALLOW'];
    };

    const filteredTransactions = filter === 'all'
        ? transactions
        : transactions.filter(tx => {
            if (filter === 'approved') return tx.status === 'ALLOW';
            if (filter === 'blocked') return tx.status === 'BLOCK';
            if (filter === 'review') return tx.status === 'CHALLENGE';
            return true;
        });

    const donutSegments = [
        { label: 'Approved', value: approvedShare, color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
        { label: 'Review', value: reviewShare, color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #ea580c)' },
        { label: 'Blocked', value: blockedShare, color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
        { label: 'Pending', value: pendingShare, color: '#6b7280', gradient: 'linear-gradient(135deg, #6b7280, #4b5563)' }
    ];

    const approvedDeg = approvedShare * 360;
    const reviewDeg = reviewShare * 360;
    const blockedDeg = blockedShare * 360;
    const donutStyle = {
        background: `conic-gradient(
            #10b981 0deg ${approvedDeg}deg,
            #f59e0b ${approvedDeg}deg ${approvedDeg + reviewDeg}deg,
            #ef4444 ${approvedDeg + reviewDeg}deg ${approvedDeg + reviewDeg + blockedDeg}deg,
            #6b7280 ${approvedDeg + reviewDeg + blockedDeg}deg 360deg
        )`
    };

    const renderActions = (tx) => {
        if (typeof onAction !== 'function') return null;
        const isLoading = actionLoadingId === tx.id;
        const buttons = [];

        if (tx.status !== 'ALLOW') {
            buttons.push(
                <button
                    key="approve"
                    onClick={() => onAction(tx.id, 'approve')}
                    disabled={isLoading}
                    className="px-3 py-1 text-xs rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 disabled:opacity-50"
                >
                    {isLoading ? '...' : 'Approve'}
                </button>
            );
        }

        if (tx.status === 'BLOCK') {
            buttons.push(
                <button
                    key="unblock"
                    onClick={() => onAction(tx.id, 'unblock')}
                    disabled={isLoading}
                    className="px-3 py-1 text-xs rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 disabled:opacity-50"
                >
                    {isLoading ? '...' : 'Unblock'}
                </button>
            );
        }

        if (!buttons.length) {
            return <span className="text-xs text-gray-500">—</span>;
        }

        return <div className="flex flex-wrap gap-2">{buttons}</div>;
    };

    return (
        <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {statCards.map((card, index) => (
                    <div
                        key={index}
                        className="bg-[#1a1f3a] rounded-2xl p-6 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all duration-300"
                    >
                        <div
                            className="absolute top-0 left-0 right-0 h-1"
                            style={{ background: `linear-gradient(to right, ${card.gradient.replace('from-', '').replace(' to-', ', ')})` }}
                        />

                        <div className="flex justify-between items-start mb-4">
                            <div className="text-xs text-gray-400 font-semibold tracking-wider">
                                {card.label}
                            </div>
                            <div className="text-2xl">{card.icon}</div>
                        </div>

                        <div className="text-3xl font-bold text-white mono mb-2">
                            {card.value}
                        </div>

                        <div className={`text-xs font-medium ${card.trendUp ? 'text-green-400' : 'text-red-400'}`}>
                            {card.trend}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Activity */}
                <div className="bg-[#1a1f3a] rounded-2xl p-6 border border-white/5">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Live Activity
                    </h2>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {transactions.slice(0, 5).map((tx, index) => {
                            const statusConfig = getStatusBadge(tx.status);
                            return (
                                <div
                                    key={tx.id}
                                    className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="mono font-bold text-white">${tx.amount.toLocaleString()}</div>
                                        <div className="text-xs text-gray-500">{timeAgo(tx.timestamp)}</div>
                                    </div>
                                    <div className="text-sm text-gray-400 mb-2">
                                        {tx.user_id} → {tx.merchant}
                                    </div>
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${statusConfig.class}`}>
                                        {statusConfig.icon} {statusConfig.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="lg:col-span-2 bg-[#1a1f3a] rounded-2xl p-6 border border-white/5">
                    <h2 className="text-lg font-bold text-white mb-4">Recent Transactions</h2>

                    <div className="flex gap-2 mb-4">
                        {['all', 'approved', 'blocked', 'review'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left py-3 px-2 text-xs text-gray-500 uppercase font-semibold">User</th>
                                    <th className="text-left py-3 px-2 text-xs text-gray-500 uppercase font-semibold">Amount</th>
                                    <th className="text-left py-3 px-2 text-xs text-gray-500 uppercase font-semibold">Merchant</th>
                                    <th className="text-left py-3 px-2 text-xs text-gray-500 uppercase font-semibold">Risk</th>
                                    <th className="text-left py-3 px-2 text-xs text-gray-500 uppercase font-semibold">Status</th>
                                    <th className="text-left py-3 px-2 text-xs text-gray-500 uppercase font-semibold">Time</th>
                                    <th className="text-left py-3 px-2 text-xs text-gray-500 uppercase font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.slice(0, 6).map((tx) => {
                                    const statusConfig = getStatusBadge(tx.status);
                                    const userInitials = tx.user_id.split('_').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                                    const riskScore = tx.risk_score?.score || 0;

                                    return (
                                        <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                                            <td className="py-3 px-2">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                                        style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}
                                                    >
                                                        {userInitials}
                                                    </div>
                                                    <span className="text-sm text-white">{tx.user_id}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 mono font-semibold text-white">${tx.amount.toLocaleString()}</td>
                                            <td className="py-3 px-2 text-sm text-gray-400">{tx.merchant}</td>
                                            <td className="py-3 px-2">
                                                <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${(riskScore / 1000) * 100}%`,
                                                            background: riskScore > 700 ? 'linear-gradient(to right, #ef4444, #dc2626)' :
                                                                riskScore > 300 ? 'linear-gradient(to right, #f59e0b, #ea580c)' :
                                                                    'linear-gradient(to right, #10b981, #059669)'
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="py-3 px-2">
                                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${statusConfig.class}`}>
                                                    {statusConfig.icon} {statusConfig.label}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 text-xs text-gray-500">{timeAgo(tx.timestamp)}</td>
                                            <td className="py-3 px-2">
                                                {renderActions(tx)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Quick Stats with Donut Chart */}
            <div className="bg-[#1a1f3a] rounded-2xl p-6 border border-white/5">
                <h2 className="text-lg font-bold text-white mb-6">Quick Stats</h2>

                <div className="flex items-center justify-center">
                    <div className="relative w-64 h-64">
                        <div className="w-full h-full rounded-full border-[18px] border-white/5" />
                        <div className="absolute inset-0 m-4 rounded-full" style={donutStyle} />
                        <div className="absolute inset-0 m-12 rounded-full bg-[#0f132b]" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <div className="text-4xl font-bold text-white mono">{approvalRate}%</div>
                            <div className="text-sm text-gray-400 mt-1">Approved share</div>
                        </div>
                    </div>

                    <div className="ml-12 space-y-4">
                        {donutSegments.filter(segment => segment.value > 0).map((segment) => (
                            <div className="flex items-center gap-3" key={segment.label}>
                                <div className="w-4 h-4 rounded" style={{ background: segment.gradient }} />
                                <div>
                                    <div className="text-sm text-gray-400">{segment.label}</div>
                                    <div className="text-xl font-bold text-white mono">{(segment.value * 100).toFixed(1)}%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
