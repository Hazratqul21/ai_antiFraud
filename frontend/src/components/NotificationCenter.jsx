import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';

const NotificationCenter = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'critical', title: 'High Risk Transaction', message: 'Suspicious transfer of $50,000 detected from Tashkent.', time: '2 min ago' },
        { id: 2, type: 'warning', title: 'New Device Login', message: 'User "admin" logged in from a new IP address.', time: '15 min ago' },
        { id: 3, type: 'success', title: 'System Update', message: 'Anti-fraud model v2.1 deployed successfully.', time: '1 hour ago' },
        { id: 4, type: 'info', title: 'Weekly Report', message: 'Your weekly fraud analysis report is ready.', time: '3 hours ago' },
    ]);

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getIcon = (type) => {
        switch (type) {
            case 'critical': return <ShieldAlert className="w-5 h-5 text-red-500" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'critical': return 'bg-red-500/10 border-red-500/20';
            case 'warning': return 'bg-amber-500/10 border-amber-500/20';
            case 'success': return 'bg-emerald-500/10 border-emerald-500/20';
            default: return 'bg-blue-500/10 border-blue-500/20';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-700 shadow-2xl z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 backdrop-blur-md">
                            <div className="flex items-center gap-2">
                                <Bell className="w-5 h-5 text-purple-400" />
                                <h2 className="text-lg font-bold text-white">Notifications</h2>
                                <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                                    {notifications.length}
                                </span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            <AnimatePresence mode='popLayout'>
                                {notifications.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center text-slate-500 mt-10"
                                    >
                                        <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>No new notifications</p>
                                    </motion.div>
                                ) : (
                                    notifications.map((notification) => (
                                        <motion.div
                                            key={notification.id}
                                            layout
                                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                                            className={`relative p-4 rounded-xl border ${getBgColor(notification.type)} backdrop-blur-sm group`}
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-1 shrink-0">
                                                    {getIcon(notification.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-semibold text-slate-200 text-sm">{notification.title}</h4>
                                                        <span className="text-xs text-slate-500">{notification.time}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => removeNotification(notification.id)}
                                                    className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-white hover:bg-slate-700/50 rounded"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-700 bg-slate-800/30">
                            <button
                                onClick={() => setNotifications([])}
                                className="w-full py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationCenter;
