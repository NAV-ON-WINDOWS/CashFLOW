'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';

interface RealizedChartProps {
  holdings: any[];
}

export default function RealizedChart({ holdings }: RealizedChartProps) {
  if (!holdings || holdings.length === 0) return null;

  const data = holdings.map((item) => ({
    name: item.scheme_name.length > 20 ? `${item.scheme_name.slice(0, 18)}...` : item.scheme_name,
    fullName: item.scheme_name,
    profit: item.realized_profit || 0,
    invested: item.units * (item.avg_buy_price || 0),
    redeemed: item.units * (item.sell_price || 0),
  }));

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Realized Return Breakdown</h3>
        <p className="text-xs text-slate-500">Net profit or loss realized per redeemed holding</p>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              interval={0}
              angle={-15}
              textAnchor="end"
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(val) => `₹${val.toLocaleString('en-IN')}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-lg space-y-1">
                      <p className="font-semibold text-slate-200">{d.fullName}</p>
                      <p className="text-slate-400">Total Invested: ₹{d.invested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                      <p className="text-slate-400">Total Redeemed: ₹{d.redeemed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                      <p className={`font-bold ${d.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        Realized P&L: {d.profit >= 0 ? '+' : ''}₹{d.profit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={1} />
            <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.profit >= 0 ? '#10b981' : '#f43f5e'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}