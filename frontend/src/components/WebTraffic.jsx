import React, { useState, useEffect } from 'react';

export default function WebTraffic() {
    const [timeRange, setTimeRange] = useState('24h');
    const [overview, setOverview] = useState(null);
    const [byLocation, setByLocation] = useState([]);
    const [byIP, setByIP] = useState([]);
    const [byUser, setByUser] = useState([]);
    const [byMerchant, setByMerchant] = useState([]);
    const [byDevice, setByDevice] = useState([]);
    const [statusBreakdown, setStatusBreakdown] = useState([]);

    useEffect(() => {
        fetchAllData();
    }, [timeRange]);

    const fetchAllData = async () => {
        try {
            const [overviewRes, locationRes, ipRes, userRes, merchantRes, deviceRes, statusRes] = await Promise.all([
                fetch(`/web-traffic/overview?time_range=${timeRange}`),
                fetch(`/web-traffic/by-location?time_range=${timeRange}&limit=15`),
                fetch(`/web-traffic/by-ip?time_range=${timeRange}&limit=15`),
                fetch(`/web-traffic/by-user?time_range=${timeRange}&limit=15`),
                fetch(`/web-traffic/by-merchant?time_range=${timeRange}&limit=15`),
                fetch(`/web-traffic/by-device?time_range=${timeRange}&limit=15`),
                fetch(`/web-traffic/status-breakdown?time_range=${timeRange}`)
            ]);

            setOverview(await overviewRes.json());
            setByLocation(await locationRes.json());
            setByIP(await ipRes.json());
            setByUser(await userRes.json());
            setByMerchant(await merchantRes.json());
            setByDevice(await deviceRes.json());
            setStatusBreakdown(await statusRes.json());
        } catch (error) {
            console.error("Error fetching web traffic data:", error);
        }
    };

    const Panel = ({ title, data, columns, count }) => (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-white/10 bg-white/5">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <span className="text-green-400 font-semibold">({count || data.length})</span>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-white/5">
                        <tr>
                            <th className="p-2 text-left text-gray-400 font-medium text-xs">#</th>
                            {columns.map((col, idx) => (
                                <th key={idx} className="p-2 text-left text-gray-400 font-medium text-xs">{col.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {data.map((row, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors cursor-pointer">
                                <td className="p-2 text-gray-500 text-xs">{idx + 1}</td>
                                {columns.map((col, colIdx) => (
                                    <td key={colIdx} className={`p-2 text-sm ${col.className || 'text-gray-300'}`}>
                                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">🌐 Web Traffic Analysis</h2>
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

            {/* Overview */}
            {overview && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                    <div className="text-center">
                        <div className="text-gray-400 text-sm">Total Events</div>
                        <div className="text-4xl font-bold text-white mt-1">{overview.total_events.toLocaleString()}</div>
                    </div>
                </div>
            )}


            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* By Location */}
                <Panel
                    title="🌍 Countries / Regions"
                    data={byLocation}
                    count={byLocation.length}
                    columns={[
                        { key: 'location', label: 'Location', className: 'text-white font-medium' },
                        { key: 'events', label: 'Events', className: 'text-purple-400 font-semibold' },
                        { key: 'users', label: 'Users', className: 'text-blue-400' },
                        { key: 'volume', label: 'Volume', render: (val) => `so'm val.toLocaleString()}`, className: 'text-green-400' }
                    ]}
                />

                {/* By IP */}
                <Panel
                    title="🔢 IP Addresses"
                    data={byIP}
                    count={byIP.length}
                    columns={[
                        { key: 'ip_address', label: 'IP', className: 'text-white font-mono text-xs' },
                        { key: 'location', label: 'Location', className: 'text-gray-400 text-xs' },
                        { key: 'events', label: 'Events', className: 'text-purple-400 font-semibold' },
                        { key: 'users', label: 'Users', className: 'text-blue-400' },
                        { key: 'devices', label: 'Devices', className: 'text-yellow-400' }
                    ]}
                />

                {/* By User */}
                <Panel
                    title="👤 Users"
                    data={byUser}
                    count={byUser.length}
                    columns={[
                        { key: 'user_id', label: 'User ID', className: 'text-white font-medium' },
                        { key: 'events', label: 'Events', className: 'text-purple-400 font-semibold' },
                        { key: 'locations', label: 'Locations', className: 'text-blue-400' },
                        { key: 'ips', label: 'IPs', className: 'text-yellow-400' },
                        { key: 'volume', label: 'Volume', render: (val) => `so'm val.toLocaleString()}`, className: 'text-green-400' }
                    ]}
                />

                {/* By Merchant */}
                <Panel
                    title="🏪 Merchants"
                    data={byMerchant}
                    count={byMerchant.length}
                    columns={[
                        { key: 'merchant', label: 'Merchant', className: 'text-white font-medium' },
                        { key: 'events', label: 'Events', className: 'text-purple-400 font-semibold' },
                        { key: 'users', label: 'Users', className: 'text-blue-400' },
                        { key: 'blocked', label: 'Blocked', className: 'text-red-400' },
                        { key: 'block_rate', label: 'Block %', render: (val) => `${(val * 100).toFixed(1)}%`, className: 'text-orange-400 font-semibold' }
                    ]}
                />

                {/* By Device */}
                <Panel
                    title="📱 Devices"
                    data={byDevice}
                    count={byDevice.length}
                    columns={[
                        { key: 'device_id', label: 'Device ID', className: 'text-white font-mono text-xs' },
                        { key: 'events', label: 'Events', className: 'text-purple-400 font-semibold' },
                        { key: 'users', label: 'Users', className: 'text-blue-400' },
                        { key: 'volume', label: 'Volume', render: (val) => `so'm val.toLocaleString()}`, className: 'text-green-400' }
                    ]}
                />

                {/* Status Breakdown */}
                <Panel
                    title="📊 Status Distribution"
                    data={statusBreakdown}
                    count={statusBreakdown.length}
                    columns={[
                        { key: 'status', label: 'Status', className: 'text-white font-medium' },
                        { key: 'events', label: 'Events', className: 'text-purple-400 font-semibold text-lg' }
                    ]}
                />
            </div>
        </div>
    );
}
