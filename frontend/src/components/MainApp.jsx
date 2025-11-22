import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from './Dashboard';
import Analytics from './Analytics';
import Transactions from './Transactions';
import Reports from './Reports';
import AlertsView from './AlertsView';
import EventAnalysis from './EventAnalysis';
import Monitoring from './Monitoring';
import Investigation from './Investigation';
import WebTraffic from './WebTraffic';

export default function MainApp() {
    const [stats, setStats] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [activeTab, setActiveTab] = useState('dashboard');
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [alerts, setAlerts] = useState([]);

    const fetchData = async () => {
        try {
            const statsRes = await fetch('/dashboard/stats');
            const statsData = await statsRes.json();
            setStats(statsData);

            const txRes = await fetch('/dashboard/recent?limit=50');
            const txData = await txRes.json();
            setTransactions(txData);

            const alertsRes = await fetch('/cockpit/alerts?limit=20');
            const alertsData = await alertsRes.json();
            setAlerts(alertsData);

            setLastUpdate(new Date());
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTransactionAction = async (transactionId, action) => {
        if (!transactionId || !action) return;
        setActionLoadingId(transactionId);
        try {
            const response = await fetch(`/transactions/${transactionId}/${action}`, {
                method: 'POST'
            });
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || 'Action failed');
            }
            await fetchData();
        } catch (error) {
            console.error(`Failed to ${action} transaction`, error);
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleResolveAlert = async (alertId, resolution) => {
        await fetch(`/cockpit/alerts/${alertId}/resolve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resolution, conclusion: `Marked as ${resolution}` })
        });
        fetchData();
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !stats) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
                <div className="text-center">
                    <div className="w-20 h-20 border-8 border-purple-500 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-xl font-bold">Loading FraudGuard AI...</p>
                    <p className="text-purple-300 mt-2">Initializing ML models...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-[#0a0f1e]">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="flex-1 flex flex-col">
                <Header lastUpdate={lastUpdate} stats={stats} alertsCount={alerts.length} />

                <main className="flex-1 p-6 overflow-y-auto">
                    {activeTab === 'dashboard' && (
                        <Dashboard
                            stats={stats}
                            transactions={transactions}
                            onAction={handleTransactionAction}
                            actionLoadingId={actionLoadingId}
                        />
                    )}
                    {activeTab === 'analytics' && <Analytics />}
                    {activeTab === 'event-analysis' && <EventAnalysis />}
                    {activeTab === 'investigation' && <Investigation />}
                    {activeTab === 'web-traffic' && <WebTraffic />}
                    {activeTab === 'monitoring' && <Monitoring />}
                    {activeTab === 'transactions' && <Transactions />}
                    {activeTab === 'reports' && <Reports />}
                    {activeTab === 'alerts' && (
                        <AlertsView alerts={alerts} onResolve={handleResolveAlert} />
                    )}
                </main>
            </div>
        </div>
    );
}
