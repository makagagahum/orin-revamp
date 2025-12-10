import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine } from 'recharts';
import { ExternalLink, ArrowUpRight } from 'lucide-react';

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
    <div className="flex flex-col h-full">
        <div className="h-64 w-full flex-grow">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="year" stroke="#666" style={{ fontSize: '10px', fontFamily: 'monospace' }} tick={{fill: '#666'}} axisLine={false} tickLine={false} dy={10} />
                    <YAxis stroke="#666" style={{ fontSize: '10px', fontFamily: 'monospace' }} tick={{fill: '#666'}} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                        itemStyle={{ color: '#38F8A8', fontFamily: 'monospace' }}
                        formatter={(value: number) => [`$${value} Billion`, 'Market Size']}
                    />
                    <Line type="monotone" dataKey="val" stroke="#38F8A8" strokeWidth={3} dot={{r: 4, fill: '#38F8A8', strokeWidth: 0}} activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
        
        {/* Source Citation */}
        <div className="mt-4 pt-4 border-t border-dashed border-gray-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div className="text-[10px] text-gray-500 font-mono tracking-wide">
                CAGR 37.3% (2024-2030)
            </div>
            <a 
                href="https://www.grandviewresearch.com/industry-analysis/artificial-intelligence-market" 
                target="_blank" 
                rel="noreferrer"
                className="group flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-[#38F8A8] transition-colors font-mono uppercase tracking-wider cursor-pointer border-b border-transparent hover:border-[#38F8A8]"
            >
                Source: Grand View Research (2024)
                <ArrowUpRight className="w-3 h-3 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
        </div>
    </div>
);

export const ROIChart = () => (
    <div className="h-full flex flex-col">
        <div className="h-64 w-full flex-grow">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataROI} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                    <XAxis 
                        type="number" 
                        stroke="#666" 
                        style={{ fontSize: '10px', fontFamily: 'monospace' }} 
                        domain={[0, 250000]} 
                        tickFormatter={(val) => val === 0 ? '0%' : `${val/1000}k%`}
                        tick={{fill: '#666'}}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                    />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        stroke="#999" 
                        width={70} 
                        style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 'bold' }} 
                        tick={{fill: '#888'}}
                        axisLine={false}
                        tickLine={false}
                    />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                    <Bar dataKey="val" radius={[0, 4, 4, 0]} animationDuration={1500} barSize={20}>
                        {dataROI.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
        
        {/* Source Citation */}
        <div className="mt-4 pt-4 border-t border-dashed border-gray-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div className="text-[10px] text-gray-500 font-mono tracking-wide">
                *Vs. Human Capital (₱226k/yr avg)
            </div>
            <a 
                href="https://psa.gov.ph/statistics/occupational-wages-survey" 
                target="_blank" 
                rel="noreferrer"
                className="group flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-[#38F8A8] transition-colors font-mono uppercase tracking-wider cursor-pointer border-b border-transparent hover:border-[#38F8A8]"
            >
                Source: PSA (Occupational Wages)
                <ArrowUpRight className="w-3 h-3 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
        </div>
    </div>
);