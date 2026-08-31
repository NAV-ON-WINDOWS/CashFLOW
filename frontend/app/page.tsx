'use client';

import { useEffect, useState } from 'react';
import AddWatchlistModal from '../components/AddWatchlistModal';
import AddTransactionModal from '../components/AddTransactionModal';
import NavChartModal from '../components/NavChartModal';
import { fetchPortfolio, fetchWatchlist, PortfolioResponse, WatchlistFund } from '../lib/api';

export default function Home() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'watchlist'>('portfolio');
  const [selectedScheme, setSelectedScheme] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let isSubscribed = true;

    async function loadData() {
      try {
        const [pData, wData] = await Promise.all([
          fetchPortfolio(),
          fetchWatchlist()
        ]);
        if (isSubscribed) {
          setPortfolio(pData);
          setWatchlist(wData);
        }
      } catch (err: any) {
        if (isSubscribed) {
          console.error('Error fetching data:', err);
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isSubscribed = false;
    };
  }, [mounted]);

  if (!mounted || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-700 font-sans">
        <div className="animate-pulse text-lg font-medium">Fetching mutual fund data from AMFI...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="border-b border-slate-200 bg-white px-8 py-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">myCAMS Portfolio Monitor</h1>
          <p className="text-xs text-slate-500">Real-time daily valuation & historical tracker</p>
        </div>
        <div className="flex space-x-2 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === 'portfolio' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Portfolio
          </button>
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === 'watchlist' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tracked Watchlist
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8">
        {activeTab === 'portfolio' && portfolio && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Invested Capital</span>
                <p className="text-2xl font-bold mt-1 text-slate-800">
                  ₹{portfolio.summary.total_invested.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Net Worth</span>
                <p className="text-2xl font-bold mt-1 text-blue-600">
                  ₹{portfolio.summary.total_current_value.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Profit / Loss</span>
                <p className={`text-2xl font-bold mt-1 ${portfolio.summary.total_profit_loss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {portfolio.summary.total_profit_loss >= 0 ? '+' : ''}₹{portfolio.summary.total_profit_loss.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Return</span>
                <p className={`text-2xl font-bold mt-1 ${portfolio.summary.overall_return_percentage >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {portfolio.summary.overall_return_percentage}%
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">Active Schemes ({portfolio.holdings.length})</h2>
                  <span className="text-xs text-slate-500">Click any row to plot NAV chart</span>
                </div>
                <button
                  onClick={() => setShowTxModal(true)}
                  className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-blue-700 transition"
                >
                  + Add Investment
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Fund Name</th>
                      <th className="px-6 py-3 text-right">Units Held</th>
                      <th className="px-6 py-3 text-right">Avg Price</th>
                      <th className="px-6 py-3 text-right">Latest NAV</th>
                      <th className="px-6 py-3 text-right">Current Value</th>
                      <th className="px-6 py-3 text-right">Gain / Loss</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {portfolio.holdings.map((fund) => (
                      <tr
                        key={fund.scheme_code}
                        onClick={() => setSelectedScheme(fund.scheme_code)}
                        className="hover:bg-blue-50/40 cursor-pointer transition"
                      >
                        <td className="px-6 py-4 font-medium text-slate-900">
                          <div>{fund.scheme_name}</div>
                          <span className="text-xs text-slate-400 font-mono">Code: {fund.scheme_code} • {fund.nav_date}</span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono">{fund.units}</td>
                        <td className="px-6 py-4 text-right font-mono">₹{fund.avg_buy_price.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-mono font-medium text-slate-800">₹{fund.current_nav.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-mono font-semibold text-slate-900">₹{fund.current_value.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            fund.profit_loss >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {fund.profit_loss >= 0 ? '+' : ''}₹{fund.profit_loss.toFixed(2)} ({fund.returns_percentage}%)
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'watchlist' && (
          <div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">Monitored / Inactive Funds</h2>
                  <p className="text-xs text-slate-500">Historical performance metrics • Click any row to view chart</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-slate-700 transition"
                >
                  + Add Fund
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Fund Details</th>
                      <th className="px-6 py-3 text-right">Latest NAV</th>
                      <th className="px-6 py-3 text-right">1 Month</th>
                      <th className="px-6 py-3 text-right">6 Month</th>
                      <th className="px-6 py-3 text-right">1 Year</th>
                      <th className="px-6 py-3 text-right">All-Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {watchlist.map((fund) => (
                      <tr
                        key={fund.scheme_code}
                        onClick={() => setSelectedScheme(fund.scheme_code)}
                        className="hover:bg-blue-50/40 cursor-pointer transition"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{fund.scheme_name}</div>
                          <span className="text-xs text-slate-400">{fund.category} • Code: {fund.scheme_code}</span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-medium text-slate-800">₹{fund.latest_nav.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-mono">
                          <span className={fund.metrics.return_1m_pct && fund.metrics.return_1m_pct >= 0 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                            {fund.metrics.return_1m_pct !== null ? `${fund.metrics.return_1m_pct}%` : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          <span className={fund.metrics.return_6m_pct && fund.metrics.return_6m_pct >= 0 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                            {fund.metrics.return_6m_pct !== null ? `${fund.metrics.return_6m_pct}%` : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          <span className={fund.metrics.return_1y_pct && fund.metrics.return_1y_pct >= 0 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                            {fund.metrics.return_1y_pct !== null ? `${fund.metrics.return_1y_pct}%` : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          <span className={fund.metrics.all_time_return_pct && fund.metrics.all_time_return_pct >= 0 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                            {fund.metrics.all_time_return_pct !== null ? `${fund.metrics.all_time_return_pct}%` : 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <NavChartModal
          schemeCode={selectedScheme}
          onClose={() => setSelectedScheme(null)}
        />
        
        {showAddModal && (
          <AddWatchlistModal 
            onClose={() => setShowAddModal(false)} 
            onSuccess={() => {
              setShowAddModal(false);
              window.location.reload(); 
            }} 
          />
        )}

        {showTxModal && (
          <AddTransactionModal
            onClose={() => setShowTxModal(false)}
            onSuccess={() => {
              setShowTxModal(false);
              window.location.reload();
            }}
          />
        )}
      </main>
    </div>
  );
}