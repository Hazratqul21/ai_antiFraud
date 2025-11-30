import React from 'react';
import { motion } from 'framer-motion';

/**
 * RiskScoreMeter - Professional risk visualization
 * Displays risk score as an animated gauge meter
 */
export default function RiskScoreMeter({
    score = 0, // 0-1000 range
    maxScore = 1000,
    showValue = true,
    size = 'md',
    className = ''
}) {
    const percentage = (score / maxScore) * 100;

    // Determine risk level and colors
    const getRiskLevel = (score) => {
        if (score >= 700) return { level: 'critical', color: '#ef4444', label: 'CRITICAL' };
        if (score >= 500) return { level: 'high', color: '#f59e0b', label: 'HIGH' };
        if (score >= 300) return { level: 'medium', color: '#eab308', label: 'MEDIUM' };
        if (score >= 100) return { level: 'low', color: '#3b82f6', label: 'LOW' };
        return { level: 'safe', color: '#10b981', label: 'SAFE' };
    };

    const risk = getRiskLevel(score);

    const sizeConfig = {
        'sm': { diameter: 80, strokeWidth: 6, fontSize: 'text-sm' },
        'md': { diameter: 120, strokeWidth: 8, fontSize: 'text-lg' },
        'lg': { diameter: 160, strokeWidth: 10, fontSize: 'text-2xl' }
    };

    const config = sizeConfig[size];
    const radius = (config.diameter - config.strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className={`flex flex-col items-center gap-2 ${className}`}>
            <div className="relative" style={{ width: config.diameter, height: config.diameter }}>
                <svg
                    width={config.diameter}
                    height={config.diameter}
                    className="transform -rotate-90"
                >
                    {/* Background circle */}
                    <circle
                        cx={config.diameter / 2}
                        cy={config.diameter / 2}
                        r={radius}
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth={config.strokeWidth}
                        fill="none"
                    />

                    {/* Progress circle */}
                    <motion.circle
                        cx={config.diameter / 2}
                        cy={config.diameter / 2}
                        r={radius}
                        stroke={risk.color}
                        strokeWidth={config.strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        style={{
                            strokeDasharray: circumference,
                            filter: `drop-shadow(0 0 8px ${risk.color})`
                        }}
                    />
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {showValue && (
                        <>
                            <motion.div
                                className={`${config.fontSize} font-bold mono text-white`}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                {score}
                            </motion.div>
                            <div className="text-xs text-gray-400 mt-1">
                                {risk.label}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
