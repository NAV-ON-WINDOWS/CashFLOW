'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Holding } from '../lib/api';

interface AllocationChartProps {
  holdings: Holding[];
  totalValue: number;
}

const COLORS = [
  '#2563eb', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#64748b', // Slate
];

export default function AllocationChart({ holdings, totalValue }: AllocationChartProps) {
  if (!holdings || holdings.length === 0 || totalValue <= 0) {
    return null;
  }

  const chartData = holdings.map((h) => ({
    name: h.scheme_name,
    value: h.current_value,
    percentage: ((h.current_value / totalValue) * 100).toFixed(1),
  }));

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
      <div className="w-full md:w-1/2 h-56 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [
                `₹${Number(value).toLocaleString('en-IN')}`,
                'Current Value',
              ]}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total</span>
          <span className="text-sm font-bold text-slate-800">
            ₹{totalValue > 100000 ? `${(totalValue / 100000).toFixed(2)}L` : totalValue.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center space-y-2 max-h-56 overflow-y-auto pr-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
          Asset Weight Distribution
        </span>
        {chartData.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 truncate max-w-[70%]">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="truncate text-slate-700 font-medium">{item.name}</span>
            </div>
            <span className="font-mono font-semibold text-slate-900">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}