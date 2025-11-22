import React, { useState, useEffect } from 'react';

export default function Reports() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await fetch('/reports/summary');
                const data = await res.json();
                setSummary(data);
            } catch (error) {
                console.error("Error fetching report summary:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, []);

    const handleExport = () => {
        window.open('http://localhost:8000/reports/export?format=csv', '_blank');
    };

    if (loading) return <div className="text-white">Loading Reports...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Reports Center</h2>
                <button
                    onClick={handleExport}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                    <span>📥</span> Export CSV
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                    <h3 className="text-gray-400 text-sm font-medium mb-2">Total Transactions</h3>
                    <p className="text-3xl font-bold text-white">{summary?.total_transactions}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                    <h3 className="text-gray-400 text-sm font-medium mb-2">Blocked Transactions</h3>
                    <p className="text-3xl font-bold text-red-400">{summary?.blocked_transactions}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                    <h3 className="text-gray-400 text-sm font-medium mb-2">Total Volume</h3>
                    <p className="text-3xl font-bold text-green-400">${summary?.total_volume?.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                    <h3 className="text-gray-400 text-sm font-medium mb-2">Fraud Rate</h3>
                    <p className="text-3xl font-bold text-purple-400">{(summary?.fraud_rate * 100).toFixed(2)}%</p>
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📄</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Monthly Report Available</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    The automated monthly report for November 2025 is ready for download. It includes detailed breakdown of all transaction activities and risk assessments.
                </p>
                <button className="border border-white/20 hover:bg-white/5 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    View PDF Report (Mock)
                </button>
            </div>
        </div>
    );
}
