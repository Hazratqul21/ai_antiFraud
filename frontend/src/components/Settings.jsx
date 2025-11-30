import React, { useState } from 'react';
import { User, Bell, Shield, Palette, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings() {
    const [settings, setSettings] = useState({
        fullName: 'Admin User',
        email: 'admin@fraudguard.uz',
        notifications: {
            email: true,
            telegram: true,
            threshold: 80
        },
        theme: 'dark',
        language: 'en'
    });

    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        // Save settings logic here
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                    <p className="text-slate-400">Manage your account and preferences</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                    <Save className="w-5 h-5" />
                    Save Changes
                </motion.button>
            </div>

            {saved && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-400"
                >
                    ✓ Settings saved successfully!
                </motion.div>
            )}

            {/* Profile Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Profile Settings</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                        <input
                            type="text"
                            value={settings.fullName}
                            onChange={(e) => setSettings({ ...settings, fullName: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                        <input
                            type="email"
                            value={settings.email}
                            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Notification Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                        <Bell className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Notifications</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white font-medium">Email Notifications</p>
                            <p className="text-sm text-slate-400">Receive fraud alerts via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.notifications.email}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    notifications: { ...settings.notifications, email: e.target.checked }
                                })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white font-medium">Telegram Notifications</p>
                            <p className="text-sm text-slate-400">Receive fraud alerts via Telegram</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.notifications.telegram}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    notifications: { ...settings.notifications, telegram: e.target.checked }
                                })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">
                            Alert Threshold: {settings.notifications.threshold}%
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={settings.notifications.threshold}
                            onChange={(e) => setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, threshold: parseInt(e.target.value) }
                            })}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                            Send alerts when risk score exceeds this threshold
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Security Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Security</h2>
                </div>

                <div className="space-y-4">
                    <button className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white hover:bg-slate-800 transition-colors text-left">
                        Change Password
                    </button>
                    <button className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white hover:bg-slate-800 transition-colors text-left">
                        Enable Two-Factor Authentication
                    </button>
                    <button className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white hover:bg-slate-800 transition-colors text-left">
                        View Login History
                    </button>
                </div>
            </motion.div>

            {/* Appearance Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                        <Palette className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Appearance</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Theme</label>
                        <select
                            value={settings.theme}
                            onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                        >
                            <option value="dark">Dark</option>
                            <option value="light">Light</option>
                            <option value="auto">Auto</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Language</label>
                        <select
                            value={settings.language}
                            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                        >
                            <option value="en">English</option>
                            <option value="uz">O'zbek</option>
                            <option value="ru">Русский</option>
                        </select>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
