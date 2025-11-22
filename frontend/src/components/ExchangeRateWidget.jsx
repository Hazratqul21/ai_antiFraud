import { useState, useEffect } from 'react';

export default function ExchangeRateWidget() {
    const [rate, setRate] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRate();
        const interval = setInterval(fetchRate, 3600000); // Update every hour
        return () => clearInterval(interval);
    }, []);

    const fetchRate = async () => {
        try {
            const res = await fetch('/currency/exchange-rate');
            const data = await res.json();
            if (data.success) {
                setRate(data.data.rate);
                setLastUpdated(data.data.last_updated);
                setLoading(false);
            }
        } catch (error) {
            console.error('Failed to fetch rate:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="glass-card p-3 rounded-lg">
                <div className="animate-pulse flex items-center gap-2">
                    <div className="h-4 bg-gray-700 rounded w-20"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-3 rounded-lg hover:scale-105 transition-transform duration-300">
            <div className="flex items-center gap-3">
                <div className="text-2xl">💵</div>
                <div>
                    <div className="text-xs text-gray-400 mb-0.5">USD/UZS</div>
                    <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                        {rate ? rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'Loading...'}
                    </div>
                    {lastUpdated && (
                        <div className="text-[10px] text-gray-500 mt-0.5">
                            Updated: {new Date(lastUpdated).toLocaleTimeString()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
