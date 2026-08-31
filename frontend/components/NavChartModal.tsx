'use client';

import { useEffect, useState } from 'react';
import { fetchFundDetail } from '../lib/api';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface NavChartModalProps {
  schemeCode: string | null;
  onClose: () => void;
}

export default function NavChartModal({ schemeCode, onClose }: NavChartModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!schemeCode) return;
    setLoading(true);
    fetchFundDetail(schemeCode)
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [schemeCode]);

  if (!schemeCode) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {data ? data.scheme_name : 'Loading scheme details...'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Code: {schemeCode} • Category: {data?.category || 'N/A'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex h-72 items-center justify-center text-slate-500 font-medium animate-pulse">
            Fetching 1-year historical NAV timeseries...
          </div>
        ) : data ? (
          <div className="mt-6">
            {/* Quick Metrics Header */}
            <div className="grid grid-cols-4 gap-3 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Latest NAV</span>
                <p className="text-base font-bold text-slate-800">₹{data.latest_nav?.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">1 Month</span>
                <p className={`text-base font-bold ${data.metrics.return_1m_pct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {data.metrics.return_1m_pct !== null ? `${data.metrics.return_1m_pct}%` : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">6 Month</span>
                <p className={`text-base font-bold ${data.metrics.return_6m_pct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {data.metrics.return_6m_pct !== null ? `${data.metrics.return_6m_pct}%` : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">1 Year</span>
                <p className={`text-base font-bold ${data.metrics.return_1y_pct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {data.metrics.return_1y_pct !== null ? `${data.metrics.return_1y_pct}%` : 'N/A'}
                </p>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chart_data_1y}>
                  <defs>
                    <linearGradient id="navGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={40}
                  />
                  <YAxis
                    domain={['dataMin - 2', 'dataMax + 2']}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${v.toFixed(0)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                    formatter={(val: any) => [`₹${parseFloat(val).toFixed(2)}`, 'NAV']}
                  />
                  <Area
                    type="monotone"
                    dataKey="nav"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#navGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-sm">Failed to load chart points.</div>
        )}
      </div>
    </div>
  );
}