'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AllocationChartProps {
  holdings: any[];
  totalValue: number;
}

const COLORS = [
  '#2563eb', // Blue
  '#0d9488', // Teal
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f97316', // Orange
  '#6366f1', // Indigo
  '#14b8a6', // Cyan
  '#64748b', // Slate
];

export default function AllocationChart({ holdings, totalValue }: AllocationChartProps) {
  if (!holdings || holdings.length === 0 || totalValue <= 0) {
    return null;
  }

  // Aggregate holdings with the exact same scheme name into one slice
  const fundMap: { [name: string]: number } = {};
  holdings.forEach((h) => {
    const name = h.scheme_name || 'Unknown Fund';
    fundMap[name] = (fundMap[name] || 0) + (h.current_value || 0);
  });

  const chartData = Object.entries(fundMap).map(([name, value]) => ({
    name,
    value: Math.round(value),
  }));

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Asset Allocation</h3>
        <p className="text-xs text-slate-500">Distribution by current market value</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6">
        <div className="h-60 w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={3}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0];
                    const val = Number(data.value);
                    const pct = ((val / totalValue) * 100).toFixed(1);
                    return (
                      <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-lg">
                        <p className="font-semibold text-slate-200">{data.name}</p>
                        <p className="text-slate-400 mt-1">
                          ₹{val.toLocaleString('en-IN')} ({pct}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Total Net Worth</span>
            <span className="text-sm font-bold text-slate-800 font-mono">
              ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
          {chartData.map((item, index) => {
            const pct = ((item.value / totalValue) * 100).toFixed(1);
            return (
              <div key={`${item.name}-${index}`} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 truncate max-w-[70%]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-slate-700 truncate font-medium" title={item.name}>
                    {item.name}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-slate-900 font-mono font-semibold mr-2">
                    ₹{item.value.toLocaleString('en-IN')}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}