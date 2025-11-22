import React, { useState } from 'react';

export default function TransactionTable({ transactions }) {
    const [filter, setFilter] = useState('all');

    const timeAgo = (timestamp) => {
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };

    const getStatusBadge = (status) => {
        const configs = {
            'ALLOW': { class: 'bg-green-500/15 text-green-400 border-green-500/30', icon: '✓', label: 'APPROVED' },
            'CHALLENGE': { class: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', icon: '⏱', label: 'REVIEW' },
            'BLOCK': { class: 'bg-red-500/15 text-red-400 border-red-500/30', icon: '✕', label: 'BLOCKED' }
        };
        return configs[status] || configs['ALLOW'];
    };

    const getRiskClass = (score) => {
        if (score < 300) return 'low';
        if (score < 700) return 'medium';
        return 'high';
    };

    const getRiskGradient = (riskClass) => {
        if (riskClass === 'low') return 'var(--gradient-success)';
        if (riskClass === 'medium') return 'var(--gradient-warning)';
        return 'var(--gradient-danger)';
    };

    const filteredTransactions = filter === 'all'
        ? transactions
        : transactions.filter(tx => {
            if (filter === 'approved') return tx.status === 'ALLOW';
            if (filter === 'blocked') return tx.status === 'BLOCK';
            if (filter === 'review') return tx.status === 'CHALLENGE';
            return true;
        });

    return (
        <div className="glass-card">
            <h2 className="text-lg font-bold mb-4">Recent Transactions</h2>

            <div className="flex gap-2 mb-4 flex-wrap">
                {['all', 'approved', 'blocked', 'review'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${filter === f
                                ? 'text-white border-transparent'
                                : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                            }`}
                        style={filter === f ? { background: 'var(--gradient-primary)' } : {}}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2">
                    <thead>
                        <tr>
                            <th className="text-left px-3 py-3 text-xs text-gray-500 uppercase tracking-wider font-semibold border-b border-white/5">
                                User
                            </th>
                            <th className="text-left px-3 py-3 text-xs text-gray-500 uppercase tracking-wider font-semibold border-b border-white/5">
                                Amount
                            </th>
                            <th className="text-left px-3 py-3 text-xs text-gray-500 uppercase tracking-wider font-semibold border-b border-white/5">
                                Merchant
                            </th>
                            <th className="text-left px-3 py-3 text-xs text-gray-500 uppercase tracking-wider font-semibold border-b border-white/5">
                                Risk
                            </th>
                            <th className="text-left px-3 py-3 text-xs text-gray-500 uppercase tracking-wider font-semibold border-b border-white/5">
                                Status
                            </th>
                            <th className="text-left px-3 py-3 text-xs text-gray-500 uppercase tracking-wider font-semibold border-b border-white/5">
                                Time
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-12">
                                    <div className="text-4xl mb-2">📭</div>
                                    <p className="text-gray-500">No transactions found</p>
                                </td>
                            </tr>
                        ) : (
                            filteredTransactions.slice(0, 10).map((tx) => {
                                const statusConfig = getStatusBadge(tx.status);
                                const riskScore = tx.risk_score?.score || 0;
                                const riskClass = getRiskClass(riskScore);
                                const userInitials = tx.user_id.split('_').map(n => n[0]).join('').toUpperCase().slice(0, 2);

                                return (
                                    <tr
                                        key={tx.id}
                                        className="bg-white/2 transition-all duration-300 hover:bg-white/5 hover:scale-[1.01] cursor-pointer"
                                    >
                                        <td className="px-3 py-4 rounded-l-xl border-t border-b border-l border-white/2">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                                                    style={{ background: 'var(--gradient-primary)' }}
                                                >
                                                    {userInitials}
                                                </div>
                                                <span className="text-sm">{tx.user_id}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 mono font-semibold border-t border-b border-white/2">
                                            ${tx.amount.toLocaleString()}
                                        </td>
                                        <td className="px-3 py-4 text-sm border-t border-b border-white/2">
                                            {tx.merchant}
                                        </td>
                                        <td className="px-3 py-4 border-t border-b border-white/2">
                                            <div className="w-15 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${(riskScore / 1000) * 100}%`,
                                                        background: getRiskGradient(riskClass)
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 border-t border-b border-white/2">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${statusConfig.class}`}>
                                                {statusConfig.icon} {statusConfig.label}
                                            </span>
                                        </td>
                                        <td className="px-3 py-4 rounded-r-xl text-sm text-gray-500 border-t border-b border-r border-white/2">
                                            {timeAgo(tx.timestamp)}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
