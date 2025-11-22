import React, { useState, useEffect } from 'react';

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        min_amount: '',
        merchant: '',
        limit: 20,
        skip: 0
    });

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                limit: filters.limit,
                skip: filters.skip,
                ...(filters.status && { status: filters.status }),
                ...(filters.min_amount && { min_amount: filters.min_amount }),
                ...(filters.merchant && { merchant: filters.merchant }),
            });

            const res = await fetch(`/transactions/?${queryParams}`);
            const data = await res.json();
            setTransactions(data);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [filters.skip, filters.limit]); // Refetch on pagination change

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value, skip: 0 });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchTransactions();
    };

    const getStatusBadge = (status) => {
        const configs = {
            'ALLOW': { class: 'bg-green-500/15 text-green-400 border-green-500/30', icon: '✓', label: 'APPROVED' },
            'CHALLENGE': { class: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', icon: '⏱', label: 'REVIEW' },
            'BLOCK': { class: 'bg-red-500/15 text-red-400 border-red-500/30', icon: '✕', label: 'BLOCKED' },
            'PENDING': { class: 'bg-gray-500/15 text-gray-400 border-gray-500/30', icon: '⋯', label: 'PENDING' }
        };
        const config = configs[status] || configs['ALLOW'];
        return (
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${config.class}`}>
                <span>{config.icon}</span>
                {config.label}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Transactions</h2>
            </div>

            {/* Filters */}
            <form onSubmit={handleSearch} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Status</label>
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="ALLOW">Approved</option>
                        <option value="BLOCK">Blocked</option>
                        <option value="CHALLENGE">Review</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Min Amount</label>
                    <input
                        type="number"
                        name="min_amount"
                        value={filters.min_amount}
                        onChange={handleFilterChange}
                        placeholder="0.00"
                        className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm w-32 focus:outline-none focus:border-purple-500"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Merchant</label>
                    <input
                        type="text"
                        name="merchant"
                        value={filters.merchant}
                        onChange={handleFilterChange}
                        placeholder="Search merchant..."
                        className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm w-48 focus:outline-none focus:border-purple-500"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    Apply Filters
                </button>
            </form>

            {/* Table */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Merchant</th>
                                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Risk Score</th>
                                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-400">Loading transactions...</td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-400">No transactions found</td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-sm text-gray-300 font-mono">{tx.transaction_id}</td>
                                        <td className="p-4 text-sm text-gray-300">{new Date(tx.timestamp).toLocaleString()}</td>
                                        <td className="p-4 text-sm text-white font-medium">{tx.merchant}</td>
                                        <td className="p-4 text-sm text-white font-mono">
                                            {tx.currency} {tx.amount.toFixed(2)}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 w-16 bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${tx.risk_score?.score > 800 ? 'bg-red-500' :
                                                                tx.risk_score?.score > 500 ? 'bg-yellow-500' : 'bg-green-500'
                                                            }`}
                                                        style={{ width: `${(tx.risk_score?.score || 0) / 10}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-400 w-8 text-right">{tx.risk_score?.score || 0}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(tx.status)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-white/10 flex justify-between items-center">
                    <button
                        onClick={() => setFilters(f => ({ ...f, skip: Math.max(0, f.skip - f.limit) }))}
                        disabled={filters.skip === 0}
                        className="px-3 py-1.5 text-sm text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="text-xs text-gray-500">
                        Showing {filters.skip + 1} - {filters.skip + transactions.length}
                    </span>
                    <button
                        onClick={() => setFilters(f => ({ ...f, skip: f.skip + f.limit }))}
                        disabled={transactions.length < filters.limit}
                        className="px-3 py-1.5 text-sm text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
