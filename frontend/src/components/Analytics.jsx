import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import UzbekistanMap from './UzbekistanMap';
import LocationDetailModal from './LocationDetailModal';

export default function Analytics() {
    const [trends, setTrends] = useState([]);
    const [distribution, setDistribution] = useState({ by_location: [], by_merchant: [] });
    const [heatmapData, setHeatmapData] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const trendsRes = await fetch('/analytics/trends?days=7');
                const trendsData = await trendsRes.json();
                setTrends(trendsData);

                const distRes = await fetch('/analytics/fraud-distribution');
                const distData = await distRes.json();
                setDistribution(distData);

                const heatmapRes = await fetch('/analytics/location-heatmap');
                const heatmapData = await heatmapRes.json();
                setHeatmapData(heatmapData);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) return <div className="text-white">Loading Analytics...</div>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>

            {/* Trends Chart */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Transaction Trends (Last 7 Days)</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                            <XAxis dataKey="date" stroke="#888" />
                            <YAxis stroke="#888" />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                            <Legend />
                            <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total Txns" />
                            <Line type="monotone" dataKey="fraud_count" stroke="#ff4d4d" name="Fraud Txns" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Interactive Uzbekistan Map */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                        🗺️ Geographic Heat Map - Uzbekistan
                        <span className="text-sm font-normal text-purple-400 ml-2">AI-Powered Fraud Detection</span>
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Live Monitoring
                    </div>
                </div>
                <UzbekistanMap
                    heatmapData={heatmapData}
                    onLocationClick={(location) => setSelectedLocation(location)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Location Distribution */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Fraud by Location</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distribution.by_location}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {distribution.by_location.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Merchant Distribution */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Fraud by Merchant</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distribution.by_merchant}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#82ca9d"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {distribution.by_merchant.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Location Detail Modal */}
            {selectedLocation && (
                <LocationDetailModal
                    location={selectedLocation}
                    onClose={() => setSelectedLocation(null)}
                />
            )}
        </div>
    );
}
