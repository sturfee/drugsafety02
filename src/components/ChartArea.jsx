import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock chart data - in real app this would come from props/post analysis
const DATA = [
    { time: '0h', positive: 5, negative: 2 },
    { time: '2h', positive: 8, negative: 3 },
    { time: '4h', positive: 15, negative: 8 },
    { time: '6h', positive: 25, negative: 12 },
    { time: '8h', positive: 45, negative: 15 },
    { time: '10h', positive: 50, negative: 16 },
    { time: '12h', positive: 52, negative: 16 },
];

const ChartArea = () => {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={DATA}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                    <XAxis dataKey="time" stroke="var(--color-text-subtle)" />
                    <YAxis stroke="var(--color-text-subtle)" />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="positive" stroke="var(--color-success)" strokeWidth={2} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="negative" stroke="var(--color-danger)" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ChartArea;
