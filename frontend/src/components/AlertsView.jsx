import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThreatPulse from './animations/ThreatPulse';

export default function AlertsView({ alerts = [], onResolve }) {
    return (
        <div className="glass-card-elevated rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-white">Alert Queue</h2>
                        <ThreatPulse
                            level={alerts.length > 5 ? 'high' : alerts.length > 0 ? 'medium' : 'safe'}
                            size="md"
                            showLabel
                            label={`${alerts.length} Active`}
                        />
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Live investigations & workflows</p>
                </div>
            </div>

            {alerts.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center text-gray-500 py-10"
                >
                    ✅ No alerts in queue - All clear!
                </motion.div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {alerts.map((alert, index) => {
                            const getSeverityConfig = (severity) => {
                                const configs = {
                                    'CRITICAL': { level: 'critical', class: 'glass-danger', pulse: 'animate-pulse-critical' },
                                    'HIGH': { level: 'high', class: 'glass-warning', pulse: 'animate-pulse-high' },
                                    'MEDIUM': { level: 'medium', class: 'glass-warning', pulse: 'animate-pulse-safe' },
                                    'LOW': { level: 'low', class: 'glass-card', pulse: '' }
                                };
                                return configs[severity] || configs['LOW'];
                            };

                            const config = getSeverityConfig(alert.severity);

                            return (
                                <motion.div
                                    key={alert.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`p-4 rounded-xl ${config.class} ${config.pulse} hover-lift`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-white font-bold">Alert #{alert.id}</div>
                                                <ThreatPulse level={config.level} size="sm" />
                                            </div>
                                            <div className="text-sm text-gray-400 mt-1">Transaction #{alert.transaction_id}</div>
                                        </div>
                                        <span className={`badge-${config.level} text-xs uppercase`}>
                                            {alert.severity}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-300 mt-3 p-2 rounded bg-black/20">
                                        {alert.notes || 'Automated rule triggered - requires review'}
                                    </div>
                                    <div className="flex gap-3 mt-4">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex-1 px-4 py-2 rounded-lg glass-success text-sm font-semibold text-green-300 hover-lift"
                                            onClick={() => onResolve(alert.id, 'false_positive')}
                                        >
                                            ✓ Mark Safe
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex-1 px-4 py-2 rounded-lg gradient-red-orange text-sm font-semibold text-white hover-glow"
                                            onClick={() => onResolve(alert.id, 'confirmed_fraud')}
                                        >
                                            ⚠ Confirm Fraud
                                        </motion.button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}




