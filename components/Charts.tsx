import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const marketData = [
  { year: '2024', chatbot: 7.76, support: 12.06, multimodal: 2 },
  { year: '2026', chatbot: 12, support: 18, multimodal: 5 },
  { year: '2028', chatbot: 19, support: 29, multimodal: 12 },
  { year: '2030', chatbot: 27.3, support: 47.82, multimodal: 42.38 },
];

const roiData = [
  { name: 'Small Biz', roi: 2158 },
  { name: 'Med Biz', roi: 10792 },
  { name: 'Large Biz', roi: 43171 },
  { name: 'Enterprise', roi: 215857 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-surfaceHighlight p-3 rounded shadow-xl">
        <p className="text-primary font-bold mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color }} className="text-xs font-medium">
                {p.name}: {p.value.toLocaleString()}
            </p>
        ))}
      </div>
    );
  }
  return null;
};

export const MarketGrowthChart = () => (
  <div className="h-64 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={marketData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorChat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
        <XAxis dataKey="year" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}B`} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="chatbot" stackId="1" stroke="#34d399" fill="url(#colorChat)" strokeWidth={3} />
        <Area type="monotone" dataKey="support" stackId="1" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.1} />
        <Area type="monotone" dataKey="multimodal" stackId="1" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.1} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const RoiChart = () => (
  <div className="h-64 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart layout="vertical" data={roiData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#333" />
        <XAxis type="number" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} hide />
        <YAxis dataKey="name" type="category" stroke="#f4f4f5" fontSize={12} tickLine={false} axisLine={false} width={80} />
        <Tooltip cursor={{fill: '#27272a'}} content={<CustomTooltip />} />
        <Bar dataKey="roi" fill="#34d399" radius={[0, 4, 4, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);
