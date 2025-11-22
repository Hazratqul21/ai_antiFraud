import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function EventAnalysis() {
    const [activeView, setActiveView] = useState('timeseries');
    const [timeSeriesData, setTimeSeriesData] = useState([]);
    const [patterns, setPatterns] = useState([]);
    const [rootCause, setRootCause] = useState(null);
    const [loading, setLoading] = useState(true);
    const [granularity, setGranularity] = useState('hourly');

    useEffect(() => {
        fetchAnalyticsData();
    }, [granularity]);

    const fetchAnalyticsData = async () => {
        setLoading(true);
        try {
            // Fetch time-series data
            const tsRes = await fetch(`/event-analysis/time-series?granularity=${granularity}&days=7`);
            const tsData = await tsRes.json();
            setTimeSeriesData(tsData);

            // Fetch patterns
            const patternsRes = await fetch('/event-analysis/patterns?min_support=3');
            const patternsData = await patternsRes.json();
            setPatterns(patternsData);

            // Fetch root cause analysis
            const rcRes = await fetch('/event-analysis/root-cause?time_window_hours=24');
            const rcData = await rcRes.json();
            setRootCause(rcData);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-white">Loading Event Analysis...</div>;

    const views = [
        { id: 'timeseries', label: 'Time Series', icon: '📈' },
        { id: 'patterns', label: 'Pattern Mining', icon: '🔍' },
        { id: 'rootcause', label: 'Root Cause', icon: '🎯' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Event Analysis & Mining</h2>
                {activeView === 'timeseries' && (
                    <div className="flex gap-2">
                        {['hourly', 'daily', 'weekly'].map(g => (
                            <button
                                key={g}
                                onClick={() => setGranularity(g)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${granularity === g
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                {g.charAt(0).toUpperCase() + g.slice(1)}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* View Selector */}
            <div className="flex gap-3">
                {views.map(view => (
                    <button
                        key={view.id}
                        onClick={() => setActiveView(view.id)}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${activeView === view.id
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <div className="text-lg mb-1">{view.icon}</div>
                        <div className="text-sm">{view.label}</div>
                    </button>
                ))}
            </div>

            {/* Time Series View */}
            {activeView === 'timeseries' && (
                <div className="space-y-6">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Transaction Volume Over Time</h3>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={timeSeriesData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                    <XAxis dataKey="period" stroke="#888" />
                                    <YAxis stroke="#888" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="total" stroke="#8b5cf6" name="Total" strokeWidth={2} />
                                    <Line type="monotone" dataKey="blocked" stroke="#ef4444" name="Blocked" strokeWidth={2} />
                                    <Line type="monotone" dataKey="allowed" stroke="#10b981" name="Allowed" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Fraud Rate Trends</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={timeSeriesData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                    <XAxis dataKey="period" stroke="#888" />
                                    <YAxis stroke="#888" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                                    <Line
                                        type="monotone"
                                        dataKey="fraud_rate"
                                        stroke="#f59e0b"
                                        name="Fraud Rate"
                                        strokeWidth={3}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Pattern Mining View */}
            {activeView === 'patterns' && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                        <h3 className="text-xl font-semibold text-white">Discovered Patterns</h3>
                        <p className="text-sm text-gray-400 mt-1">User → Merchant → Device sequences with minimum support of 3+</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="p-3 text-left text-gray-400 font-medium">Pattern</th>
                                    <th className="p-3 text-center text-gray-400 font-medium">Frequency</th>
                                    <th className="p-3 text-center text-gray-400 font-medium">Fraud Count</th>
                                    <th className="p-3 text-center text-gray-400 font-medium">Confidence</th>
                                    <th className="p-3 text-center text-gray-400 font-medium">Risk</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {patterns.map((pattern, idx) => (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                                        <td className="p-3 text-gray-300 font-mono text-xs">{pattern.pattern}</td>
                                        <td className="p-3 text-center text-white font-semibold">{pattern.frequency}</td>
                                        <td className="p-3 text-center text-red-400">{pattern.fraud_count}</td>
                                        <td className="p-3 text-center">
                                            <span className="text-purple-400 font-semibold">
                                                {(pattern.confidence * 100).toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${pattern.is_suspicious
                                                    ? 'bg-red-500/20 text-red-400'
                                                    : 'bg-green-500/20 text-green-400'
                                                }`}>
                                                {pattern.is_suspicious ? 'HIGH' : 'LOW'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Root Cause View */}
            {activeView === 'rootcause' && rootCause && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                            <div className="text-gray-400 text-sm">Total Analyzed</div>
                            <div className="text-3xl font-bold text-white mt-1">{rootCause.total_analyzed}</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                            <div className="text-gray-400 text-sm">Time Window</div>
                            <div className="text-3xl font-bold text-white mt-1">{rootCause.time_window_hours}h</div>
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Contributing Factors</h3>
                        <div className="space-y-4">
                            {rootCause.factors.map((factor, idx) => (
                                <div key={idx} className="border border-white/10 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-purple-400 font-semibold capitalize">{factor.dimension}</span>
                                        <span className="text-white text-lg font-bold">{factor.count}</span>
                                    </div>
                                    <div className="text-gray-300 mb-2">{factor.value}</div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                                                style={{ width: `${factor.percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-400">{factor.percentage.toFixed(1)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
