import React from 'react';
import { Home, Activity, BarChart3, Settings, Shield, AlertTriangle, Map, Search, Globe, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ collapsed = false, activeTab = 'dashboard', setActiveTab }) => {
    const menuItems = [
        { icon: Home, label: 'Dashboard', tab: 'dashboard' },
        { icon: Activity, label: 'Transactions', tab: 'transactions' },
        { icon: BarChart3, label: 'Analytics', tab: 'analytics' },
        { icon: TrendingUp, label: 'Event Analysis', tab: 'event-analysis' },
        { icon: Search, label: 'Investigation', tab: 'investigation' },
        { icon: Globe, label: 'Web Traffic', tab: 'web-traffic' },
        { icon: AlertTriangle, label: 'Alerts', tab: 'alerts' },
        { icon: Shield, label: 'Monitoring', tab: 'monitoring' },
        { icon: Settings, label: 'Settings', tab: 'settings' },
    ];

    return (
        <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            className={`h-screen bg-slate-900/90 backdrop-blur-md border-r border-slate-700/50 flex flex-col ${collapsed ? 'w-20' : 'w-64'} transition-all duration-300`}
        >
            {/* Logo */}
            <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    {!collapsed && (
                        <div>
                            <h1 className="text-lg font-bold text-white">FraudGuard</h1>
                            <p className="text-xs text-slate-400">AI Platform</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item, index) => (
                    <motion.button
                        key={item.label}
                        onClick={() => setActiveTab && setActiveTab(item.tab)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.tab
                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                            }`}
                    >
                        <item.icon className="w-5 h-5" />
                        {!collapsed && <span className="font-medium">{item.label}</span>}
                    </motion.button>
                ))}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-slate-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                        AI
                    </div>
                    {!collapsed && (
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-white">Admin User</p>
                            <p className="text-xs text-slate-400">admin@fraudguard.uz</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Sidebar;
