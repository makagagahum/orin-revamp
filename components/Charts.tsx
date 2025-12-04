
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const dataGrowth = [ { year: '2024', val: 7.76 }, { year: '2026', val: 12 }, { year: '2028', val: 19 }, { year: '2030', val: 27.3 } ];
const dataROI = [ 
    { name: 'Small Biz', val: 2158, color: '#38F8A8' }, 
    { name: 'Medium', val: 10792, color: '#A855F7' }, 
    { name: 'Large', val: 43171, color: '#FF3366' }, 
    { name: 'Enterprise', val: 215857, color: '#3b82f6' } 
];

// Custom Tooltip for ROI to show percentages
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/90 border border-white/20 p-4 rounded-xl shadow-xl backdrop-blur-md">
                <p className="font-bold text-white mb-1 font-grotesk">{label}</p>
                <p className="text-[#38F8A8] font-mono text-sm">
                    ROI: +{payload[0].value.toLocaleString()}%
                </p>
                <p className="text-xs text-gray-400 mt-1">vs. Human Cost</p>
            </div>
        );
    }
    return null;
};

export const MarketGrowthChart = () => (
    <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="year" stroke="#666" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                <YAxis stroke="#666" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                    itemStyle={{ color: '#38F8A8', fontFamily: 'monospace' }}
                    formatter={(value: number) => [`$${value} Billion`, 'Market Size']}
                />
                <Line type="monotone" dataKey="val" stroke="#38F8A8" strokeWidth={3} dot={{r: 4, fill: '#38F8A8'}} activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
        </ResponsiveContainer>
    </div>
);

export const ROIChart = () => (
    <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataROI} layout="vertical">
                <XAxis type="number" stroke="#666" hide />
                <YAxis dataKey="name" type="category" stroke="#999" width={80} style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar dataKey="val" radius={[0, 4, 4, 0]} animationDuration={1500}>
                    {dataROI.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    </div>
);