import { useState, useEffect } from 'react';

export default function CurrencyDisplay({ uzsAmount, className = "" }) {
    const [showUSD, setShowUSD] = useState(false);
    const [exchangeRate, setExchangeRate] = useState(12500);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        fetchExchangeRate();
        // Update rate every hour
        const interval = setInterval(fetchExchangeRate, 3600000);
        return () => clearInterval(interval);
    }, []);

    const fetchExchangeRate = async () => {
        try {
            const res = await fetch('/currency/exchange-rate');
            const data = await res.json();
            if (data.success) {
                setExchangeRate(data.data.rate);
                setLastUpdated(data.data.last_updated);
            }
        } catch (error) {
            console.error('Failed to fetch exchange rate:', error);
        }
    };

    const usdAmount = (uzsAmount / exchangeRate).toFixed(2);

    return (
        <span
            className={`cursor-pointer transition-all duration-300 ${className}`}
            onClick={() => setShowUSD(!showUSD)}
            title={showUSD ? `${uzsAmount.toLocaleString()} so'm` : `$${usdAmount}`}
        >
            {showUSD ? (
                <>
                    <span className="text-green-400">$</span>
                    <span>{usdAmount}</span>
                </>
            ) : (
                <>
                    <span>{uzsAmount.toLocaleString()}</span>
                    <span className="text-blue-400 ml-1">so'm</span>
                </>
            )}
        </span>
    );
}
