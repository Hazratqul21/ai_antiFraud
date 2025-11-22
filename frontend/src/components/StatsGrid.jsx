import React from 'react';

export default function StatsGrid({ stats }) {
    if (!stats) return null;

    const statCards = [
        {
            label: 'Total Transactions',
            value: stats.total_transactions.toLocaleString(),
            trend: '+12.5%',
            trendUp: true,
            icon: '📊',
            color: 'info'
        },
        {
            label: 'Blocked Transactions',
            value: stats.blocked_transactions.toLocaleString(),
            trend: '-3.2%',
            trendUp: false,
            icon: '🚫',
            color: 'danger'
        },
        {
            label: 'Under Review',
            value: stats.challenged_transactions.toLocaleString(),
            trend: '+5.8%',
            trendUp: true,
            icon: '⏱️',
            color: 'warning'
        },
        {
            label: 'Fraud Rate',
            value: `${(stats.fraud_rate * 100).toFixed(2)}%`,
            trend: '-0.15%',
            trendUp: false,
            icon: '📈',
            color: 'success'
        }
    ];

    const colorMap = {
        info: 'var(--gradient-info)',
        danger: 'var(--gradient-danger)',
        warning: 'var(--gradient-warning)',
        success: 'var(--gradient-success)'
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card, index) => (
                <div
                    key={index}
                    className="glass-card transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                    style={{
                        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                    }}
                >
                    <div
                        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                        style={{ background: colorMap[card.color] }}
                    />

                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-2">
                                {card.label}
                            </div>
                            <div
                                className="text-4xl font-bold mono mb-2"
                                style={{
                                    background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}
                            >
                                {card.value}
                            </div>
                            <div className={`flex items-center gap-1.5 text-sm font-medium ${card.trendUp ? 'text-green-400' : 'text-red-400'}`}>
                                <span>{card.trendUp ? '↗' : '↘'}</span>
                                <span>{card.trend} from yesterday</span>
                            </div>
                        </div>

                        <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-xl">
                            {card.icon}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
