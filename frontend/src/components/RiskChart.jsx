import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = {
    ALLOW: '#10b981',
    CHALLENGE: '#f59e0b',
    BLOCK: '#ef4444'
};

const GRADIENT_COLORS = {
    ALLOW: ['#10b981', '#059669'],
    CHALLENGE: ['#f59e0b', '#d97706'],
    BLOCK: ['#ef4444', '#dc2626']
};

export default function RiskChart({ stats, transactions }) {
    if (!stats || !transactions) return null;

    // Prepare data for bar chart
    const barData = [
        {
            name: 'APPROVED',
            count: stats.total_transactions - stats.blocked_transactions - stats.challenged_transactions,
            color: COLORS.ALLOW
        },
        {
            name: 'UNDER REVIEW',
            count: stats.challenged_transactions,
            color: COLORS.CHALLENGE
        },
        {
            name: 'BLOCKED',
            count: stats.blocked_transactions,
            color: COLORS.BLOCK
        }
    ];

    // Prepare data for pie chart
    const pieData = barData.map(item => ({
        name: item.name,
        value: item.count
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Bar Chart */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-white p-2 rounded-lg">
                            <span className="text-2xl">📊</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">ML Decision Distribution</h3>
                            <p className="text-blue-100 text-sm">Real-time classification results</p>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: '#374151', fontWeight: 'bold' }}
                                axisLine={{ stroke: '#9ca3af' }}
                            />
                            <YAxis
                                tick={{ fill: '#374151', fontWeight: 'bold' }}
                                axisLine={{ stroke: '#9ca3af' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontWeight: 'bold'
                                }}
                            />
                            <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                                {barData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 px-6 py-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-white p-2 rounded-lg">
                            <span className="text-2xl">🎯</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Fraud Detection Rate</h3>
                            <p className="text-purple-100 text-sm">ML model performance metrics</p>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={Object.values(COLORS)[index]}
                                        stroke="#fff"
                                        strokeWidth={2}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontWeight: 'bold'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
