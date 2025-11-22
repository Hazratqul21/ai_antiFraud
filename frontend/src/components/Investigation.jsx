import React, { useState, useEffect } from 'react';

export default function Investigation() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [filterOptions, setFilterOptions] = useState(null);
    const [heatMapData, setHeatMapData] = useState([]);
    const [timeRange, setTimeRange] = useState('24h');
    const [heatMapDimension, setHeatMapDimension] = useState('location');

    // Filter states
    const [selectedStatus, setSelectedStatus] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [selectedMerchants, setSelectedMerchants] = useState([]);
    const [selectedUrgency, setSelectedUrgency] = useState([]);
    const [minRiskScore, setMinRiskScore] = useState('');
    const [maxRiskScore, setMaxRiskScore] = useState('');

    useEffect(() => {
        fetchData();
        fetchFilterOptions();
        fetchHeatMap();
    }, [timeRange, selectedStatus, selectedLocations, selectedMerchants, selectedUrgency, minRiskScore, maxRiskScore, heatMapDimension]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('time_range', timeRange);
            if (selectedStatus.length > 0) selectedStatus.forEach(s => params.append('status', s));
            if (selectedLocations.length > 0) selectedLocations.forEach(l => params.append('location', l));
            if (selectedMerchants.length > 0) selectedMerchants.forEach(m => params.append('merchant', m));
            if (selectedUrgency.length > 0) selectedUrgency.forEach(u => params.append('urgency', u));
            if (minRiskScore) params.append('min_risk_score', minRiskScore);
            if (maxRiskScore) params.append('max_risk_score', maxRiskScore);

            const res = await fetch(`/investigation/overview?${params.toString()}`);
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error("Error fetching investigation data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFilterOptions = async () => {
        try {
            const res = await fetch(`/investigation/filter-options?time_range=${timeRange}`);
            const json = await res.json();
            setFilterOptions(json);
        } catch (error) {
            console.error("Error fetching filter options:", error);
        }
    };

    const fetchHeatMap = async () => {
        try {
            const res = await fetch(`/investigation/heat-map?dimension=${heatMapDimension}&time_range=${timeRange}`);
            const json = await res.json();
            setHeatMapData(json.data || []);
        } catch (error) {
            console.error("Error fetching heat map:", error);
        }
    };

    const clearFilters = () => {
        setSelectedStatus([]);
        setSelectedLocations([]);
        setSelectedMerchants([]);
        setSelectedUrgency([]);
        setMinRiskScore('');
        setMaxRiskScore('');
    };

    const hasActiveFilters = selectedStatus.length > 0 || selectedLocations.length > 0 ||
        selectedMerchants.length > 0 || selectedUrgency.length > 0 || minRiskScore || maxRiskScore;

    if (loading && !data) return <div className="text-white">Loading Investigation Dashboard...</div>;

    const urgencyColors = {
        'critical': 'bg-red-500/20 text-red-400 border-red-500/30',
        'high': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        'medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        'low': 'bg-green-500/20 text-green-400 border-green-500/30',
        'info': 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };

    const statusColors = {
        'BLOCK': 'bg-red-700/50 text-red-200',
        'CHALLENGE': 'bg-yellow-700/50 text-yellow-200',
        'ALLOW': 'bg-green-700/50 text-green-200',
        'PENDING': 'bg-blue-700/50 text-blue-200'
    };

    return (
        <div className="space-y-6">
            {/* Header with Reset Button */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">🔍 Fraud Incident Investigation</h2>
                <div className="flex gap-3">
                    <button
                        onClick={clearFilters}
                        disabled={!hasActiveFilters}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${hasActiveFilters
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Clear Filters
                    </button>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    >
                        <option value="1h">Last Hour</option>
                        <option value="6h">Last 6 Hours</option>
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                    </select>
                </div>
            </div>

            {/* Event Counters */}
            {data && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                    <div className="flex gap-6 items-center">
                        <div className="text-gray-400">
                            <span className="text-sm">Total Events: </span>
                            <span className="text-white text-lg font-semibold">{data.total_events}</span>
                        </div>
                        <div className="text-gray-400">
                            <span className="text-sm">Filtered Events: </span>
                            <span className="text-red-400 text-lg font-semibold">{data.filtered_events}</span>
                        </div>
                        {hasActiveFilters && (
                            <div className="ml-auto">
                                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
                                    {Object.keys({ selectedStatus, selectedLocations, selectedMerchants, selectedUrgency }).filter(k => eval(k).length > 0).length} Active Filters
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Filter Panels */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Status Filter */}
                {filterOptions && (
                    <div className={`bg-white/5 backdrop-blur-xl border rounded-xl p-4 transition-all ${selectedStatus.length > 0 ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-white/10'
                        }`}>
                        <div className="text-gray-400 text-sm mb-2">Status ({filterOptions.statuses.length})</div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {filterOptions.statuses.map(opt => (
                                <label key={opt.value} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1 rounded">
                                    <input
                                        type="checkbox"
                                        checked={selectedStatus.includes(opt.value)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedStatus([...selectedStatus, opt.value]);
                                            } else {
                                                setSelectedStatus(selectedStatus.filter(s => s !== opt.value));
                                            }
                                        }}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-white text-sm flex-1">{opt.value}</span>
                                    <span className="text-gray-500 text-xs">({opt.count})</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Location Filter */}
                {filterOptions && (
                    <div className={`bg-white/5 backdrop-blur-xl border rounded-xl p-4 transition-all ${selectedLocations.length > 0 ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-white/10'
                        }`}>
                        <div className="text-gray-400 text-sm mb-2">Location ({filterOptions.locations.length})</div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {filterOptions.locations.map(opt => (
                                <label key={opt.value} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1 rounded">
                                    <input
                                        type="checkbox"
                                        checked={selectedLocations.includes(opt.value)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedLocations([...selectedLocations, opt.value]);
                                            } else {
                                                setSelectedLocations(selectedLocations.filter(l => l !== opt.value));
                                            }
                                        }}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-white text-sm flex-1">{opt.value}</span>
                                    <span className="text-gray-500 text-xs">({opt.count})</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Merchant Filter */}
                {filterOptions && (
                    <div className={`bg-white/5 backdrop-blur-xl border rounded-xl p-4 transition-all ${selectedMerchants.length > 0 ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-white/10'
                        }`}>
                        <div className="text-gray-400 text-sm mb-2">Merchant ({filterOptions.merchants.length})</div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {filterOptions.merchants.map(opt => (
                                <label key={opt.value} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1 rounded">
                                    <input
                                        type="checkbox"
                                        checked={selectedMerchants.includes(opt.value)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedMerchants([...selectedMerchants, opt.value]);
                                            } else {
                                                setSelectedMerchants(selectedMerchants.filter(m => m !== opt.value));
                                            }
                                        }}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-white text-sm flex-1">{opt.value}</span>
                                    <span className="text-gray-500 text-xs">({opt.count})</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Risk Score Range */}
                <div className={`bg-white/5 backdrop-blur-xl border rounded-xl p-4 transition-all ${(minRiskScore || maxRiskScore) ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-white/10'
                    }`}>
                    <div className="text-gray-400 text-sm mb-2">Risk Score Range</div>
                    <div className="space-y-2">
                        <input
                            type="number"
                            placeholder="Min (0-1000)"
                            value={minRiskScore}
                            onChange={(e) => setMinRiskScore(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-purple-500"
                        />
                        <input
                            type="number"
                            placeholder="Max (0-1000)"
                            value={maxRiskScore}
                            onChange={(e) => setMaxRiskScore(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-purple-500"
                        />
                    </div>
                </div>
            </div>

            {/* Heat Map Visualization */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Risk Heat Map</h3>
                    <select
                        value={heatMapDimension}
                        onChange={(e) => setHeatMapDimension(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-white text-sm focus:outline-none"
                    >
                        <option value="location">By Location</option>
                        <option value="merchant">By Merchant</option>
                        <option value="user_id">By User</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {heatMapData.slice(0, 12).map((item, idx) => (
                        <div
                            key={idx}
                            className="border rounded-lg p-3 transition-all hover:scale-105 cursor-pointer"
                            style={{
                                backgroundColor: `${item.color}20`,
                                borderColor: item.color
                            }}
                        >
                            <div className="text-white font-medium text-sm truncate">{item.value}</div>
                            <div className="text-xs text-gray-400 mt-1">Events: {item.total}</div>
                            <div className="text-xs mt-1" style={{ color: item.color }}>
                                Fraud: {(item.fraud_rate * 100).toFixed(1)}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Transactions Table */}
            {data && data.transactions && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                        <h3 className="text-xl font-semibold text-white">Incident Details</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="p-3 text-left text-gray-400 font-medium">Time</th>
                                    <th className="p-3 text-left text-gray-400 font-medium">Transaction ID</th>
                                    <th className="p-3 text-left text-gray-400 font-medium">User</th>
                                    <th className="p-3 text-left text-gray-400 font-medium">Merchant</th>
                                    <th className="p-3 text-left text-gray-400 font-medium">Location</th>
                                    <th className="p-3 text-center text-gray-400 font-medium">Amount</th>
                                    <th className="p-3 text-center text-gray-400 font-medium">Status</th>
                                    <th className="p-3 text-center text-gray-400 font-medium">Urgency</th>
                                    <th className="p-3 text-center text-gray-400 font-medium">Risk Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data.transactions.map((tx, idx) => (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                                        <td className="p-3 text-gray-300 text-xs">{new Date(tx.timestamp).toLocaleString()}</td>
                                        <td className="p-3 text-white font-mono text-xs">{tx.transaction_id}</td>
                                        <td className="p-3 text-gray-300 text-sm">{tx.user_id}</td>
                                        <td className="p-3 text-gray-300 text-sm">{tx.merchant}</td>
                                        <td className="p-3 text-gray-300 text-sm">{tx.location}</td>
                                        <td className="p-3 text-center text-white font-semibold">${tx.amount.toFixed(2)}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[tx.status] || 'bg-gray-500/20 text-gray-400'}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-1 rounded border text-xs font-semibold ${urgencyColors[tx.urgency] || 'bg-gray-500/20 text-gray-400'}`}>
                                                {tx.urgency.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className={`font-semibold ${tx.risk_score >= 800 ? 'text-red-400' :
                                                    tx.risk_score >= 500 ? 'text-yellow-400' :
                                                        'text-green-400'
                                                }`}>
                                                {tx.risk_score}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
