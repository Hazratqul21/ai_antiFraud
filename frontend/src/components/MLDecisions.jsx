import React from 'react';

export default function MLDecisions({ transactions }) {
    const timeAgo = (timestamp) => {
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };

    const recentDecisions = transactions.slice(0, 5);

    return (
        <div className="glass-card">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                🧠 Recent ML Decisions
            </h2>

            <div className="space-y-3">
                {recentDecisions.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-2">🤖</div>
                        <p className="text-gray-500">No ML decisions yet</p>
                    </div>
                ) : (
                    recentDecisions.map((tx, index) => {
                        const confidence = tx.risk_score?.confidence || 0;
                        return (
                            <div
                                key={tx.id}
                                className="p-4 rounded-xl bg-white/2 border border-white/5 flex items-center justify-between transition-all duration-300 hover:bg-white/5 hover:translate-x-1"
                            >
                                <div className="flex-1">
                                    <div className="font-semibold text-sm mb-1">
                                        {tx.merchant} - ${tx.amount.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {tx.user_id} • {timeAgo(tx.timestamp)}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-30 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                width: `${confidence * 100}%`,
                                                background: 'var(--gradient-info)'
                                            }}
                                        />
                                    </div>
                                    <div className="mono text-sm font-bold min-w-[45px] text-right">
                                        {(confidence * 100).toFixed(0)}%
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
