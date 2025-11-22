import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

export default function FraudPattern3D() {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/analytics/fraud-patterns-3d');
            const patternData = await res.json();

            if (patternData && patternData.data) {
                prepareChartData(patternData.data);
            }
        } catch (error) {
            console.error('Failed to fetch 3D data:', error);
            // Generate mock data for demonstration
            generateMockData();
        }
    };

    const generateMockData = () => {
        const x = [], y = [], z = [], colors = [], text = [];

        for (let i = 0; i < 100; i++) {
            const amount = Math.random() * 100000000;
            const time = Math.random() * 24;
            const risk = Math.random() * 100;

            x.push(amount);
            y.push(time);
            z.push(risk);
            colors.push(risk);
            text.push(`Amount: ${amount.toFixed(0)} so'm<br>Time: ${time.toFixed(1)}h<br>Risk: ${risk.toFixed(1)}%`);
        }

        const trace = {
            x, y, z,
            mode: 'markers',
            marker: {
                size: 5,
                color: colors,
                colorscale: 'RdYlGn',
                reversescale: true,
                opacity: 0.8,
                colorbar: {
                    title: 'Risk Score',
                    thickness: 15
                }
            },
            text,
            hoverinfo: 'text',
            type: 'scatter3d'
        };

        setData([trace]);
    };

    const prepareChartData = (patternData) => {
        const trace = {
            x: patternData.amounts,
            y: patternData.times,
            z: patternData.risks,
            mode: 'markers',
            marker: {
                size: 5,
                color: patternData.risks,
                colorscale: 'RdYlGn',
                reversescale: true,
                opacity: 0.8,
                colorbar: {
                    title: 'Risk Score',
                    thickness: 15
                }
            },
            text: patternData.labels,
            hoverinfo: 'text',
            type: 'scatter3d'
        };

        setData([trace]);
    };

    return (
        <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>📊</span>
                3D Fraud Pattern Analysis
            </h2>
            <p className="text-sm text-gray-400 mb-4">
                Amount vs Time vs Risk Score
            </p>
            {data.length > 0 ? (
                <Plot
                    data={data}
                    layout={{
                        scene: {
                            xaxis: { title: 'Amount (so\'m)', color: 'white' },
                            yaxis: { title: 'Hour of Day', color: 'white' },
                            zaxis: { title: 'Risk Score (%)', color: 'white' },
                            bgcolor: 'rgba(0,0,0,0)'
                        },
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        plot_bgcolor: 'rgba(0,0,0,0)',
                        height: 600,
                        margin: { t: 20, b: 20, l: 20, r: 20 },
                        font: { color: 'white' }
                    }}
                    config={{ displayModeBar: true }}
                    style={{ width: '100%' }}
                />
            ) : (
                <div className="text-center py-12">
                    <div className="text-4xl mb-4">📊</div>
                    <p className="text-gray-400">Loading 3D visualization...</p>
                </div>
            )}
        </div>
    );
}
