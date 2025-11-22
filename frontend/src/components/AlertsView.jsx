import React from 'react';

export default function AlertsView({ alerts = [], onResolve }) {
    return (
        <div className="bg-[#1a1f3a] rounded-2xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold text-white">Alert Queue</h2>
                    <p className="text-sm text-gray-400">Live investigations & workflows</p>
                </div>
            </div>

            {alerts.length === 0 ? (
                <div className="text-center text-gray-500 py-10">No alerts in queue 🎉</div>
            ) : (
                <div className="space-y-4">
                    {alerts.map(alert => (
                        <div key={alert.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex justify-between">
                                <div>
                                    <div className="text-white font-semibold">#{alert.id}</div>
                                    <div className="text-sm text-gray-400">Txn #{alert.transaction_id}</div>
                                </div>
                                <span className="px-3 py-1 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
                                    {alert.severity}
                                </span>
                            </div>
                            <div className="text-sm text-gray-400 mt-2">{alert.notes || 'Rule triggered'}</div>
                            <div className="flex gap-3 mt-4">
                                <button
                                    className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
                                    onClick={() => onResolve(alert.id, 'false_positive')}
                                >
                                    Mark Safe
                                </button>
                                <button
                                    className="px-3 py-1 rounded-lg bg-pink-600/80 hover:bg-pink-600 text-sm text-white"
                                    onClick={() => onResolve(alert.id, 'confirmed_fraud')}
                                >
                                    Confirm Fraud
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

