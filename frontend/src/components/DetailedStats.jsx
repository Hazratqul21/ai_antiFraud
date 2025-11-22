import React from 'react';

export default function DetailedStats({ stats, transactions }) {
    if (!stats) return null;

    // Calculate additional statistics
    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const avgAmount = transactions.length > 0 ? totalAmount / transactions.length : 0;
    const blockedAmount = transactions
        .filter(tx => tx.status === 'BLOCK')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const statsData = [
        {
            title: 'Total Volume',
            value: `$${totalAmount.toLocaleString()}`,
            subtitle: 'All transactions',
            gradient: 'from-blue-500 to-cyan-600',
            icon: '💰'
        },
        {
            title: 'Blocked Amount',
            value: `$${blockedAmount.toLocaleString()}`,
            subtitle: 'Prevented fraud',
            gradient: 'from-red-500 to-pink-600',
            icon: '🛡️'
        },
        {
            title: 'Average Transaction',
            value: `$${avgAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            subtitle: 'Per transaction',
            gradient: 'from-purple-500 to-indigo-600',
            icon: '📊'
        },
        {
            title: 'Detection Rate',
            value: `${(stats.fraud_rate * 100).toFixed(1)}%`,
            subtitle: 'ML accuracy',
            gradient: 'from-green-500 to-emerald-600',
            icon: '🎯'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statsData.map((stat, index) => (
                <div
                    key={index}
                    className="bg-white rounded-xl shadow-lg p-5 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className={`bg-gradient-to-br ${stat.gradient} p-3 rounded-lg text-2xl shadow-md`}>
                            {stat.icon}
                        </div>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
                            {stat.title}
                        </p>
                        <p className="text-2xl font-black text-gray-900 mb-1">
                            {stat.value}
                        </p>
                        <p className="text-xs text-gray-400">
                            {stat.subtitle}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
