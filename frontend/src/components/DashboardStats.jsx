import React from 'react';

export default function DashboardStats({ stats }) {
  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Transactions',
      value: stats.total_transactions,
      gradient: 'from-cyan-400 via-blue-500 to-purple-600',
      icon: '💳',
      iconBg: 'bg-cyan-500',
      pulse: true
    },
    {
      title: 'Blocked (Fraud)',
      value: stats.blocked_transactions,
      gradient: 'from-red-500 via-pink-500 to-rose-600',
      icon: '🚫',
      iconBg: 'bg-red-500',
      pulse: stats.blocked_transactions > 0
    },
    {
      title: 'Under Review',
      value: stats.challenged_transactions,
      gradient: 'from-amber-400 via-orange-500 to-yellow-600',
      icon: '⚠️',
      iconBg: 'bg-orange-500',
      pulse: stats.challenged_transactions > 0
    },
    {
      title: 'Fraud Detection Rate',
      value: `${(stats.fraud_rate * 100).toFixed(1)}%`,
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-600',
      icon: '🎯',
      iconBg: 'bg-purple-500',
      pulse: false
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((card, index) => (
        <div
          key={index}
          className="relative bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-3xl group"
          style={{
            animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
          }}
        >
          {/* Animated gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-300`}></div>

          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:translate-x-full transition-all duration-1000"></div>

          {/* Content */}
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.iconBg} ${card.pulse ? 'animate-pulse' : ''} p-3 rounded-xl shadow-lg`}>
                <span className="text-3xl">{card.icon}</span>
              </div>
              {card.pulse && (
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              )}
            </div>

            <div>
              <p className="text-white text-sm font-semibold uppercase tracking-wider opacity-90 mb-2">
                {card.title}
              </p>
              <p className="text-white text-4xl font-black tracking-tight">
                {card.value}
              </p>
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-30"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
