
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const dataGrowth = [ { year: '2024', val: 7.76 }, { year: '2026', val: 12 }, { year: '2028', val: 19 }, { year: '2030', val: 27.3 } ];
const dataROI = [ 
    { name: 'Small Biz', val: 2158, color: '#38F8A8' }, 
    { name: 'Medium', val: 10792, color: '#A855F7' }, 
    { name: 'Large', val: 43171, color: '#FF3366' }, 
    { name: 'Enterprise', val: 215857, color: '#3b82f6' } 
];

export const MarketGrowthChart = () => (
    <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="year" stroke="#666" />
                <YAxis stroke="#666" />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1A2035', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="val" stroke="#38F8A8" strokeWidth={3} dot={{r: 4, fill: '#38F8A8'}} />
            </LineChart>
        </ResponsiveContainer>
    </div>
);

export const ROIChart = () => (
    <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataROI} layout="vertical">
                <XAxis type="number" stroke="#666" hide />
                <YAxis dataKey="name" type="category" stroke="#999" width={80} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1A2035', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} cursor={{fill: 'transparent'}} />
                <Bar dataKey="val" radius={[0, 4, 4, 0]}>
                    {dataROI.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    </div>
);