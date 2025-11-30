import React from 'react';
import { motion } from 'framer-motion';

/**
 * CounterAnimation - Animated number counter for stats
 * Smoothly counts from 0 to target value
 */
export default function CounterAnimation({
    value,
    duration = 1.5,
    prefix = '',
    suffix = '',
    decimals = 0,
    className = ''
}) {
    const [displayValue, setDisplayValue] = React.useState(0);

    React.useEffect(() => {
        let startTime;
        let animationFrame;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = easeOutQuart * value;

            setDisplayValue(current);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setDisplayValue(value);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [value, duration]);

    const formattedValue = displayValue.toFixed(decimals);

    return (
        <motion.span
            className={className}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            {prefix}{formattedValue.toLocaleString()}{suffix}
        </motion.span>
    );
}
