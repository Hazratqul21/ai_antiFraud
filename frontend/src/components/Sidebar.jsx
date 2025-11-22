import React from 'react';

export default function Sidebar({ activeTab, setActiveTab }) {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'analytics', label: 'Analytics', icon: '📈' },
        { id: 'event-analysis', label: 'Event Analysis', icon: '🔍' },
        { id: 'investigation', label: 'Investigation', icon: '🕵️' },
        { id: 'web-traffic', label: 'Web Traffic', icon: '🌐' },
        { id: 'monitoring', label: 'Monitoring', icon: '⚡' },
        { id: 'transactions', label: 'Transactions', icon: '💳' },
        { id: 'reports', label: 'Reports', icon: '📄' },
        { id: 'alerts', label: 'Alerts', icon: '🚨' }
    ];

    return (
        <div className="w-64 bg-[#1a1f3a] border-r border-white/5 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                        style={{ background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' }}
                    >
                        🛡️
                    </div>
                    <div>
                        <div className="text-white font-bold text-lg">FraudGuard AI</div>
                        <div className="text-gray-400 text-xs">Real-time Transaction Intelligence Platform</div>
                    </div>
                </div>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-4">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all duration-300 ${activeTab === item.id
                            ? 'text-white font-semibold'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        style={activeTab === item.id ? {
                            background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                            boxShadow: '0 4px 20px rgba(236, 72, 153, 0.3)'
                        } : {}}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/5">
                <div className="text-xs text-gray-500 text-center">
                    AI Foundry
                    <br />
                    powered by School21
                </div>
            </div>
        </div>
    );
}
