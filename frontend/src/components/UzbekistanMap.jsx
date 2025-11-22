import React, { useState, useEffect } from 'react';

const UzbekistanMap = ({ onLocationClick, heatmapData = [] }) => {
    const [hoveredRegion, setHoveredRegion] = useState(null);

    // Major cities/regions in Uzbekistan with approximate SVG coordinates
    const regions = [
        { id: 'tashkent', name: 'Tashkent', cx: 300, cy: 180, label_x: 320, label_y: 180 },
        { id: 'samarkand', name: 'Samarkand', cx: 250, cy: 220, label_x: 270, label_y: 220 },
        { id: 'bukhara', name: 'Bukhara', cx: 210, cy: 230, label_x: 230, label_y: 230 },
        { id: 'andijan', name: 'Andijan', cx: 380, cy: 200, label_x: 400, label_y: 200 },
        { id: 'namangan', name: 'Namangan', cx: 360, cy: 190, label_x: 380, label_y: 190 },
        { id: 'fergana', name: 'Fergana', cx: 370, cy: 205, label_x: 390, label_y: 205 },
        { id: 'nukus', name: 'Nukus', cx: 120, cy: 160, label_x: 140, label_y: 160 },
        { id: 'urgench', name: 'Urgench', cx: 175, cy: 180, label_x: 195, label_y: 180 },
        { id: 'jizzakh', name: 'Jizzakh', cx: 280, cy: 210, label_x: 300, label_y: 210 },
        { id: 'guliston', name: 'Guliston', cx: 270, cy: 195, label_x: 290, label_y: 195 },
        { id: 'termez', name: 'Termez', cx: 280, cy: 310, label_x: 300, label_y: 310 },
        { id: 'qarshi', name: 'Qarshi', cx: 245, cy: 270, label_x: 265, label_y: 270 }
    ];

    const getLocationData = (locationName) => {
        return heatmapData.find(d =>
            d.location.toLowerCase().includes(locationName.toLowerCase()) ||
            locationName.toLowerCase().includes(d.location.toLowerCase())
        );
    };

    const getIntensityColor = (data) => {
        if (!data || data.total === 0) return '#444';

        const fraudRate = data.fraud_rate || 0;
        if (fraudRate > 0.5) return '#ef4444'; // High fraud - red
        if (fraudRate > 0.3) return '#f59e0b'; // Medium fraud - orange
        if (fraudRate > 0.1) return '#eab308'; // Low fraud - yellow
        return '#10b981'; // Minimal fraud - green
    };

    const getRadius = (data) => {
        if (!data || data.total === 0) return 8;
        // Scale based on transaction volume
        return Math.min(8 + (data.total / 5), 25);
    };

    return (
        <div className="relative w-full h-[500px] bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-white/10 overflow-hidden">
            <svg
                viewBox="0 0 500 400"
                className="w-full h-full"
                style={{ filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.3))' }}
            >
                {/* Background country outline */}
                <path
                    d="M 80 120 Q 100 100, 150 110 L 180 120 Q 200 115, 220 130 L 250 140 Q 280 135, 310 145 L 350 160 Q 380 170, 400 180 L 420 200 Q 415 220, 410 240 L 400 270 Q 380 290, 360 300 L 330 310 Q 300 320, 270 318 L 240 310 Q 210 300, 190 280 L 170 260 Q 150 240, 140 220 L 120 200 Q 100 180, 90 160 L 80 140 Q 75 130, 80 120 Z"
                    fill="rgba(139, 92, 246, 0.1)"
                    stroke="rgba(139, 92, 246, 0.3)"
                    strokeWidth="2"
                />

                {/* Grid lines for visual appeal */}
                {[...Array(5)].map((_, i) => (
                    <line
                        key={`h-${i}`}
                        x1="0"
                        y1={i * 80 + 40}
                        x2="500"
                        y2={i * 80 + 40}
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="1"
                    />
                ))}
                {[...Array(6)].map((_, i) => (
                    <line
                        key={`v-${i}`}
                        x1={i * 83.33}
                        y1="0"
                        x2={i * 83.33}
                        y2="400"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="1"
                    />
                ))}

                {/* City markers */}
                {regions.map(region => {
                    const data = getLocationData(region.name);
                    const radius = getRadius(data);
                    const color = getIntensityColor(data);
                    const isHovered = hoveredRegion === region.id;

                    return (
                        <g key={region.id}>
                            {/* Pulse animation for active locations */}
                            {data && data.total > 0 && (
                                <circle
                                    cx={region.cx}
                                    cy={region.cy}
                                    r={radius + 5}
                                    fill={color}
                                    opacity="0.3"
                                    className="animate-ping"
                                    style={{ animationDuration: '2s' }}
                                />
                            )}

                            {/* Main marker */}
                            <circle
                                cx={region.cx}
                                cy={region.cy}
                                r={radius}
                                fill={color}
                                stroke="white"
                                strokeWidth={isHovered ? 3 : 2}
                                className="cursor-pointer transition-all duration-300"
                                style={{
                                    filter: isHovered ? 'brightness(1.3) drop-shadow(0 0 10px currentColor)' : 'none',
                                    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                                    transformOrigin: `${region.cx}px ${region.cy}px`
                                }}
                                onMouseEnter={() => setHoveredRegion(region.id)}
                                onMouseLeave={() => setHoveredRegion(null)}
                                onClick={() => onLocationClick(region.name)}
                            />

                            {/* City label */}
                            <text
                                x={region.label_x}
                                y={region.label_y}
                                fill="white"
                                fontSize="11"
                                fontWeight={isHovered ? "bold" : "normal"}
                                className="pointer-events-none select-none"
                                style={{ textShadow: '0 0 3px rgba(0,0,0,0.8)' }}
                            >
                                {region.name}
                            </text>

                            {/* Stats on hover */}
                            {isHovered && data && (
                                <g>
                                    <rect
                                        x={region.cx + 15}
                                        y={region.cy - 35}
                                        width="120"
                                        height="60"
                                        rx="5"
                                        fill="rgba(0,0,0,0.9)"
                                        stroke="rgba(139, 92, 246, 0.5)"
                                        strokeWidth="1"
                                    />
                                    <text x={region.cx + 25} y={region.cy - 20} fill="#10b981" fontSize="10" fontWeight="bold">
                                        ✓ {data.approved} Approved
                                    </text>
                                    <text x={region.cx + 25} y={region.cy - 8} fill="#ef4444" fontSize="10" fontWeight="bold">
                                        ✕ {data.blocked} Blocked
                                    </text>
                                    <text x={region.cx + 25} y={region.cy + 4} fill="#eab308" fontSize="10" fontWeight="bold">
                                        ⏱ {data.challenged} Review
                                    </text>
                                    <text x={region.cx + 25} y={region.cy + 16} fill="#9ca3af" fontSize="9">
                                        Total: {data.total}
                                    </text>
                                </g>
                            )}
                        </g>
                    );
                })}
            </svg>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-xs">
                <div className="font-bold text-white mb-2">Transaction Heat</div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-300">Low Fraud (&lt;10%)</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-gray-300">Medium (10-30%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-300">High (&gt;30%)</span>
                </div>
            </div>

            {/* Instructions */}
            <div className="absolute top-4 right-4 bg-purple-600/20 backdrop-blur-sm border border-purple-500/30 rounded-lg px-3 py-2 text-xs text-purple-200">
                💡 Click on any city for detailed stats
            </div>
        </div>
    );
};

export default UzbekistanMap;
