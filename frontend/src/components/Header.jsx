import React from 'react';
import ExchangeRateWidget from './ExchangeRateWidget';

export default function Header({ lastUpdate, stats, alertsCount = 0 }) {
    return (
        <header className="bg-[#1a1f3a] border-b border-white/5 px-6 py-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        Last updated: {lastUpdate.toLocaleTimeString()}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <ExchangeRateWidget />

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 pl-10 text-white text-sm w-64 transition-all duration-300 focus:outline-none focus:border-purple-500/50 focus:bg-white/8"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">🔍</span>
                    </div>

                    <button className="relative w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                        🔔
                        {(alertsCount || stats?.blocked_transactions) && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center">
                                {alertsCount || stats.blocked_transactions}
                            </span>
                        )}
                    </button>

                    <button className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        A
                    </button>
                </div>
            </div>
        </header>
    );
}
