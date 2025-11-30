import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from './MainLayout';
import Dashboard from './Dashboard';

// Mock data for demo purposes (no backend required)
const mockStats = {
    total_transactions: 15847,
    flagged_count: 234,
    blocked_count: 89,
    fraud_rate: 2.04,
    total_amount: 4567890.50,
    avg_risk_score: 0.23,
    active_investigations: 12,
    resolved_today: 45
};

const mockTransactions = [
    {
        id: 'TX001',
        amount: 15000,
        currency: 'UZS',
        timestamp: new Date().toISOString(),
        risk_score: 0.85,
        status: 'FLAGGED',
        user_id: 'user_12345',
        location: 'Tashkent, Uzbekistan',
        device_info: 'Chrome/Windows',
        fraud_indicators: ['Unusual amount', 'New device']
    },
    {
        id: 'TX002',
        amount: 5000,
        currency: 'UZS',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        risk_score: 0.15,
        status: 'APPROVED',
        user_id: 'user_67890',
        location: 'Samarkand, Uzbekistan',
        device_info: 'Safari/iOS',
        fraud_indicators: []
    },
    {
        id: 'TX003',
        amount: 25000,
        currency: 'UZS',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        risk_score: 0.92,
        status: 'BLOCKED',
        user_id: 'user_11111',
        location: 'Unknown',
        device_info: 'Unknown',
        fraud_indicators: ['VPN detected', 'Suspicious pattern', 'High amount']
    },
    {
        id: 'TX004',
        amount: 8500,
        currency: 'UZS',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        risk_score: 0.45,
        status: 'FLAGGED',
        user_id: 'user_22222',
        location: 'Bukhara, Uzbekistan',
        device_info: 'Firefox/Linux',
        fraud_indicators: ['Unusual time']
    },
    {
        id: 'TX005',
        amount: 3200,
        currency: 'UZS',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        risk_score: 0.08,
        status: 'APPROVED',
        user_id: 'user_33333',
        location: 'Tashkent, Uzbekistan',
        device_info: 'Chrome/Android',
        fraud_indicators: []
    }
];

export default function DemoDashboard() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const handleTransactionAction = async (transactionId, action) => {
        // Simulate API call
        setActionLoadingId(transactionId);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setActionLoadingId(null);
        alert(`Demo: Transaction ${transactionId} would be ${action}ed in the real system`);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            {/* Demo Banner */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 text-center">
                <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 flex-wrap">
                    <span className="font-bold">🎯 DEMO MODE</span>
                    <span className="text-sm">This is a demonstration with mock data. No backend required.</span>
                    <Link
                        to="/"
                        className="px-4 py-1 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium transition-all"
                    >
                        ← Back to Competition Submission
                    </Link>
                </div>
            </div>

            <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
                {activeTab === 'dashboard' && (
                    <Dashboard
                        stats={mockStats}
                        transactions={mockTransactions}
                        onAction={handleTransactionAction}
                        actionLoadingId={actionLoadingId}
                    />
                )}
                {activeTab !== 'dashboard' && (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="glass-card p-8 rounded-2xl text-center max-w-md">
                            <div className="text-6xl mb-4">🚧</div>
                            <h2 className="text-2xl font-bold text-white mb-2">Demo Mode</h2>
                            <p className="text-gray-400 mb-4">
                                This section is available in the full version with backend.
                            </p>
                            <p className="text-sm text-purple-300">
                                Currently viewing: <span className="font-bold">{activeTab}</span>
                            </p>
                        </div>
                    </div>
                )}
            </MainLayout>
        </div>
    );
}
