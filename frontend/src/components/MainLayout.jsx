import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Bell, Search, Menu } from 'lucide-react';

const MainLayout = ({ children, activeTab, setActiveTab }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-950">
            <Sidebar collapsed={sidebarCollapsed} activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-700/50 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                className="pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 w-64"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Stats Quick View */}
                        <div className="flex items-center gap-4 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                            <div>
                                <p className="text-xs text-slate-400">Live</p>
                                <p className="text-sm font-bold text-emerald-400">Active</p>
                            </div>
                            <div className="w-px h-8 bg-slate-700"></div>
                            <div>
                                <p className="text-xs text-slate-400">Blocked Today</p>
                                <p className="text-sm font-bold text-red-400">127</p>
                            </div>
                        </div>

                        {/* User Avatar */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                            AI
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
