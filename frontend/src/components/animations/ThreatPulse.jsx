import React from 'react';

/**
 * ThreatPulse - Animated threat indicator
 * Shows pulsing animation based on threat severity
 */
export default function ThreatPulse({
    level = 'safe', // 'critical', 'high', 'medium', 'low', 'safe'
    size = 'md',
    showLabel = false,
    label = '',
    className = ''
}) {
    const sizeClasses = {
        'sm': 'w-2 h-2',
        'md': 'w-3 h-3',
        'lg': 'w-4 h-4',
        'xl': 'w-6 h-6'
    };

    const levelConfigs = {
        'critical': {
            color: 'bg-red-500',
            animation: 'animate-pulse-critical',
            label: 'CRITICAL'
        },
        'high': {
            color: 'bg-orange-500',
            animation: 'animate-pulse-high',
            label: 'HIGH'
        },
        'medium': {
            color: 'bg-yellow-500',
            animation: 'animate-pulse-high',
            label: 'MEDIUM'
        },
        'low': {
            color: 'bg-blue-500',
            animation: 'animate-pulse-safe',
            label: 'LOW'
        },
        'safe': {
            color: 'bg-green-500',
            animation: 'animate-pulse-safe',
            label: 'SAFE'
        }
    };

    const config = levelConfigs[level] || levelConfigs['safe'];

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div
                className={`${sizeClasses[size]} ${config.color} rounded-full ${config.animation}`}
                aria-label={`Threat level: ${config.label}`}
            />
            {showLabel && (
                <span className="text-xs font-semibold text-gray-400">
                    {label || config.label}
                </span>
            )}
        </div>
    );
}
