import React from 'react';

/**
 * ScanLine - Animated scanning line effect
 * Creates a cybersecurity-style scanning animation
 */
export default function ScanLine({
    color = 'purple',
    height = '2px',
    speed = 3,
    className = ''
}) {
    const colorClasses = {
        'purple': 'bg-purple-500',
        'cyan': 'bg-cyan-500',
        'green': 'bg-green-500',
        'red': 'bg-red-500'
    };

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            <div
                className={`absolute left-0 right-0 ${colorClasses[color]} opacity-50 animate-scan-line`}
                style={{
                    height: height,
                    boxShadow: `0 0 10px currentColor`,
                    animationDuration: `${speed}s`
                }}
            />
        </div>
    );
}
