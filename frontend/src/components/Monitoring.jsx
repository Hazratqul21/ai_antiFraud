import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Monitoring() {
    const [performance, setPerformance] = useState(null);
    const [ruleTriggers, setRuleTriggers] = useState([]);
    const [analystDecisions, setAnalystDecisions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [feedbackForm, setFeedbackForm] = useState({
        transaction_id: '',
        feedback_type: 'false_positive',
        comments: ''
    });

    useEffect(() => {
        fetchMonitoringData();
    }, []);

    const fetchMonitoringData = async () => {
        setLoading(true);
        try {
            const perfRes = await fetch('/monitoring/model-performance?days=7');
            const perfData = await perfRes.json();
            setPerformance(perfData);

            const rulesRes = await fetch('/monitoring/rule-triggers?days=7');
            const rulesData = await rulesRes.json();
            setRuleTriggers(rulesData);

            const decisionsRes = await fetch('/monitoring/analyst-decisions?days=30');
            const decisionsData = await decisionsRes.json();
            setAnalystDecisions(decisionsData);
        } catch (error) {
            console.error("Error fetching monitoring data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetch('/monitoring/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedbackForm)
            });
            alert('Feedback submitted successfully!');
            setFeedbackForm({ transaction_id: '', feedback_type: 'false_positive', comments: '' });
        } catch (error) {
            console.error("Error submitting feedback:", error);
        }
    };

    if (loading) return <div className="text-white">Loading Monitoring Dashboard...</div>;

    const COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Monitoring & Feedback Dashboard</h2>

            {/* Model Performance Metrics */}
            {performance && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">
                        🤖 ML Model Performance <span className="text-sm text-gray-400">(Last 7 Days)</span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                            <div className="text-purple-400 text-xs font-medium mb-1">Precision</div>
                            <div className="text-3xl font-bold text-white">{(performance.precision * 100).toFixed(1)}%</div>
                        </div>
                        <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-4">
                            <div className="text-pink-400 text-xs font-medium mb-1">Recall</div>
                            <div className="text-3xl font-bold text-white">{(performance.recall * 100).toFixed(1)}%</div>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                            <div className="text-blue-400 text-xs font-medium mb-1">F1 Score</div>
                            <div className="text-3xl font-bold text-white">{(performance.f1_score * 100).toFixed(1)}%</div>
                        </div>
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                            <div className="text-green-400 text-xs font-medium mb-1">Accuracy</div>
                            <div className="text-3xl font-bold text-white">{(performance.accuracy * 100).toFixed(1)}%</div>
                        </div>
                        <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-4">
                            <div className="text-gray-400 text-xs font-medium mb-1">Total Predictions</div>
                            <div className="text-3xl font-bold text-white">{performance.total_predictions}</div>
                        </div>
                    </div>

                    {/* Confusion Matrix */}
                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                            <div className="text-green-400 text-sm font-medium mb-1">True Positives</div>
                            <div className="text-2xl font-bold text-white">{performance.true_positives}</div>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                            <div className="text-red-400 text-sm font-medium mb-1">False Positives</div>
                            <div className="text-2xl font-bold text-white">{performance.false_positives}</div>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                            <div className="text-blue-400 text-sm font-medium mb-1">True Negatives</div>
                            <div className="text-2xl font-bold text-white">{performance.true_negatives}</div>
                        </div>
                        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                            <div className="text-orange-400 text-sm font-medium mb-1">False Negatives</div>
                            <div className="text-2xl font-bold text-white">{performance.false_negatives}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rule Triggers */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/10">
                    <h3 className="text-xl font-semibold text-white">⚡ Rule Trigger Statistics</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="p-3 text-left text-gray-400 font-medium">Rule Name</th>
                                <th className="p-3 text-center text-gray-400 font-medium">Severity</th>
                                <th className="p-3 text-center text-gray-400 font-medium">Action</th>
                                <th className="p-3 text-center text-gray-400 font-medium">Triggers</th>
                                <th className="p-3 text-center text-gray-400 font-medium">Match Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {ruleTriggers.map((rule, idx) => (
                                <tr key={idx} className="hover:bg-white/5 transition-colors">
                                    <td className="p-3 text-white font-medium">{rule.rule_name}</td>
                                    <td className="p-3 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${rule.severity === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                                                rule.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {rule.severity}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center text-purple-400 font-semibold">{rule.action}</td>
                                    <td className="p-3 text-center text-white font-semibold">{rule.trigger_count}</td>
                                    <td className="p-3 text-center">
                                        <span className="text-green-400 font-semibold">
                                            {(rule.match_rate * 100).toFixed(1)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Analyst Decisions */}
            {analystDecisions && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">👤 Analyst Performance</h3>
                        <div className="space-y-3">
                            {analystDecisions.analyst_performance.slice(0, 5).map((analyst, idx) => (
                                <div key={idx} className="border border-white/10 rounded-lg p-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-white font-medium">{analyst.analyst}</span>
                                        <span className="text-purple-400 font-semibold">
                                            {(analyst.resolution_rate * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <span>{analyst.total_cases} cases</span>
                                        <span>•</span>
                                        <span>{analyst.resolved} resolved</span>
                                        <span>•</span>
                                        <span className="capitalize">{analyst.severity} severity</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">📊 Resolution Distribution</h3>
                        {analystDecisions.resolution_distribution.length > 0 ? (
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={analystDecisions.resolution_distribution}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="count"
                                            label={({ resolution, percent }) => `${resolution} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {analystDecisions.resolution_distribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="text-center text-gray-400 py-12">No resolution data available</div>
                        )}
                    </div>
                </div>
            )}

            {/* Feedback Loop */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">🔄 Feedback Loop - Model Retraining</h3>
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Transaction ID</label>
                            <input
                                type="number"
                                value={feedbackForm.transaction_id}
                                onChange={(e) => setFeedbackForm({ ...feedbackForm, transaction_id: e.target.value })}
                                placeholder="Enter transaction ID"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Feedback Type</label>
                            <select
                                value={feedbackForm.feedback_type}
                                onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback_type: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            >
                                <option value="false_positive">False Positive</option>
                                <option value="false_negative">False Negative</option>
                                <option value="correct_prediction">Correct Prediction</option>
                                <option value="rule_adjustment">Rule Adjustment Needed</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Comments</label>
                        <textarea
                            value={feedbackForm.comments}
                            onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
                            placeholder="Provide feedback details..."
                            rows={3}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                    >
                        Submit Feedback for Retraining
                    </button>
                </form>
            </div>
        </div>
    );
}
