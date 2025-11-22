import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

export default function NetworkGraph({ data }) {
    const [graphData, setGraphData] = useState(null);

    useEffect(() => {
        if (data && data.nodes && data.edges) {
            prepareGraphData(data);
        }
    }, [data]);

    const prepareGraphData = (rawData) => {
        const { nodes, edges } = rawData;

        // Create edge traces
        const edgeX = [];
        const edgeY = [];

        edges.forEach(edge => {
            const source = nodes.find(n => n.id === edge.source);
            const target = nodes.find(n => n.id === edge.target);
            if (source && target) {
                edgeX.push(source.x, target.x, null);
                edgeY.push(source.y, target.y, null);
            }
        });

        const edgeTrace = {
            x: edgeX,
            y: edgeY,
            mode: 'lines',
            line: {
                width: 1,
                color: 'rgba(125, 125, 125, 0.3)'
            },
            hoverinfo: 'none',
            type: 'scatter'
        };

        // Create node trace
        const nodeX = nodes.map(n => n.x);
        const nodeY = nodes.map(n => n.y);
        const nodeText = nodes.map(n => `${n.label}<br>Risk: ${n.risk}%`);
        const nodeColor = nodes.map(n => n.risk);

        const nodeTrace = {
            x: nodeX,
            y: nodeY,
            mode: 'markers+text',
            marker: {
                size: nodes.map(n => 10 + n.transactionCount / 10),
                color: nodeColor,
                colorscale: 'RdYlGn',
                reversescale: true,
                line: { width: 2, color: 'white' },
                colorbar: {
                    title: 'Risk Score',
                    thickness: 15,
                    len: 0.5
                }
            },
            text: nodes.map(n => n.label),
            textposition: 'top center',
            textfont: { size: 8, color: 'white' },
            hovertext: nodeText,
            hoverinfo: 'text',
            type: 'scatter'
        };

        setGraphData([edgeTrace, nodeTrace]);
    };

    if (!graphData) {
        return (
            <div className="glass-card p-6 rounded-xl">
                <div className="text-center py-12">
                    <div className="text-4xl mb-4">🕸️</div>
                    <p className="text-gray-400">Loading network graph...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🕸️</span>
                Transaction Network Graph
            </h2>
            <Plot
                data={graphData}
                layout={{
                    showlegend: false,
                    hovermode: 'closest',
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    xaxis: {
                        showgrid: false,
                        zeroline: false,
                        showticklabels: false
                    },
                    yaxis: {
                        showgrid: false,
                        zeroline: false,
                        showticklabels: false
                    },
                    height: 600,
                    margin: { t: 20, b: 20, l: 20, r: 20 }
                }}
                config={{ displayModeBar: false }}
                style={{ width: '100%' }}
            />
        </div>
    );
}
