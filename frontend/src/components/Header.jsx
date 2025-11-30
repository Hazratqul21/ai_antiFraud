import React from 'react';
import { motion } from 'framer-motion';
import ExchangeRateWidget from './ExchangeRateWidget';
import ThreatPulse from './animations/ThreatPulse';

export default function Header({ lastUpdate, stats, alertsCount = 0 }) {
    return (
        <header className="glass-panel px-6 py-4 sticky top-0 z-50">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                        <ThreatPulse level="safe" size="md" showLabel label="System Healthy" />
                    </div>
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
                            className="glass-card px-4 py-2 pl-10 text-white text-sm w-64 transition-all duration-300 focus:outline-none focus:border-purple-500/50 hover:border-purple-500/30"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative w-10 h-10 rounded-lg glass-card flex items-center justify-center hover-lift"
                    >
                        🔔
                        {(alertsCount || stats?.blocked_transactions) && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center animate-pulse-critical"
                            >
                                {alertsCount || stats.blocked_transactions}
                            </motion.span>
                        )}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 rounded-lg gradient-purple-pink flex items-center justify-center text-white font-bold hover-glow"
                        onClick={() => window.location.href = '/about'}
                    >
                        A
                    </motion.button>
                </div>
            </div>
        </header>
    );
}
