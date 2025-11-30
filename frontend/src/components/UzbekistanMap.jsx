import React, { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "react-tooltip";

const geoUrl = "/uzbekistan-regions.json";

// Mock data for regions - in a real app, this would come from the backend
const regionData = {
    "Tashkent City": { fraud: 85, risk: "High", color: "#EF4444" },
    "Tashkent": { fraud: 65, risk: "Medium", color: "#F59E0B" },
    "Samarkand": { fraud: 72, risk: "High", color: "#EF4444" },
    "Bukhara": { fraud: 45, risk: "Medium", color: "#F59E0B" },
    "Fergana": { fraud: 55, risk: "Medium", color: "#F59E0B" },
    "Andijan": { fraud: 60, risk: "Medium", color: "#F59E0B" },
    "Namangan": { fraud: 58, risk: "Medium", color: "#F59E0B" },
    "Jizzakh": { fraud: 30, risk: "Low", color: "#10B981" },
    "Kashkadarya": { fraud: 40, risk: "Low", color: "#10B981" },
    "Surkhandarya": { fraud: 35, risk: "Low", color: "#10B981" },
    "Syrdarya": { fraud: 25, risk: "Low", color: "#10B981" },
    "Navoi": { fraud: 20, risk: "Low", color: "#10B981" },
    "Khorezm": { fraud: 50, risk: "Medium", color: "#F59E0B" },
    "Karakalpakstan": { fraud: 42, risk: "Medium", color: "#F59E0B" },
};

const markers = [
    { markerOffset: -15, name: "Tashkent", coordinates: [69.2401, 41.2995] },
    { markerOffset: -15, name: "Samarkand", coordinates: [66.974973, 39.627012] },
    { markerOffset: 25, name: "Bukhara", coordinates: [64.4157, 39.7681] },
    { markerOffset: 25, name: "Nukus", coordinates: [59.6133, 42.4619] },
];

const UzbekistanMap = () => {
    const [tooltipContent, setTooltipContent] = useState("");
    const [selectedRegion, setSelectedRegion] = useState(null);

    return (
        <div className="relative w-full h-[500px] bg-slate-900/50 rounded-2xl border border-slate-700/50 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="absolute top-4 left-4 z-10">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    Live Fraud Heatmap
                </h3>
                <p className="text-slate-400 text-sm">Real-time regional risk analysis</p>
            </div>

            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 2200,
                    center: [63.5, 41]
                }}
                className="w-full h-full"
            >
                <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                        geographies.map((geo) => {
                            const regionName = geo.properties.NAME_1 || geo.properties.name || geo.properties.region;
                            const data = regionData[regionName] || { fraud: 0, risk: "Unknown", color: "#475569" };

                            return (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    onMouseEnter={() => {
                                        setTooltipContent(`${regionName}: ${data.risk} Risk (${data.fraud} alerts)`);
                                        setSelectedRegion(regionName);
                                    }}
                                    onMouseLeave={() => {
                                        setTooltipContent("");
                                        setSelectedRegion(null);
                                    }}
                                    style={{
                                        default: {
                                            fill: data.color,
                                            fillOpacity: 0.8,
                                            stroke: "#64748b",
                                            strokeWidth: 1.2,
                                            outline: "none",
                                            transition: "all 0.3s ease"
                                        },
                                        hover: {
                                            fill: data.color,
                                            fillOpacity: 1,
                                            stroke: "#e2e8f0",
                                            strokeWidth: 2,
                                            outline: "none",
                                            filter: "drop-shadow(0 0 10px " + data.color + ")",
                                            cursor: "pointer"
                                        },
                                        pressed: {
                                            fill: "#E42",
                                            outline: "none",
                                        },
                                    }}
                                />
                            );
                        })
                    }
                </Geographies>

                {/* Animated Pulsing Markers for Hotspots */}
                {markers.map(({ name, coordinates, markerOffset }) => (
                    <Marker key={name} coordinates={coordinates}>
                        <g
                            fill="none"
                            stroke="#EF4444"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            transform="translate(-12, -24)"
                        >
                            <motion.circle
                                cx="12"
                                cy="10"
                                r="3"
                                initial={{ scale: 1, opacity: 1 }}
                                animate={{ scale: 3, opacity: 0 }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                fill="#EF4444"
                            />
                            <circle cx="12" cy="10" r="3" fill="#EF4444" />
                        </g>
                        <text
                            textAnchor="middle"
                            y={markerOffset}
                            style={{ fontFamily: "system-ui", fill: "#fff", fontSize: "10px", fontWeight: "bold", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
                        >
                            {name}
                        </text>
                    </Marker>
                ))}
            </ComposableMap>

            <Tooltip id="my-tooltip" content={tooltipContent} isOpen={!!tooltipContent} />

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-slate-800/80 p-3 rounded-lg border border-slate-700 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="text-xs text-slate-300">High Risk</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="text-xs text-slate-300">Medium Risk</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span className="text-xs text-slate-300">Low Risk</span>
                </div>
            </div>
        </div>
    );
};

export default UzbekistanMap;
