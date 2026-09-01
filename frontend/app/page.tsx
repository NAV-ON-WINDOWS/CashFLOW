'use client';

import { useEffect, useState, useRef } from 'react';
import AddWatchlistModal from '../components/AddWatchlistModal';
import AddTransactionModal from '../components/AddTransactionModal';
import EditFundModal from '../components/EditFundModal';
import NavChartModal from '../components/NavChartModal';
import AllocationChart from '../components/AllocationChart';
import api, { fetchPortfolio, fetchWatchlist, PortfolioResponse, WatchlistFund } from '../lib/api';
import { exportToExcel, exportToCSV } from '../lib/exportUtils';

export default function Home() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [editingFund, setEditingFund] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'watchlist'>('portfolio');
  const [selectedScheme, setSelectedScheme] = useState<string | null>(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    try {
      const [pData, wData] = await Promise.all([
        fetchPortfolio(),
        fetchWatchlist()
      ]);
      setPortfolio(pData);
      setWatchlist(wData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadData();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async (schemeCode: string, fundName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${fundName}" from your portfolio?`)) return;

    try {
      await api.delete(`/portfolio/fund/${schemeCode}`);
      await loadData();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

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
          <p className="text-xs text-slate-500">
            Consolidated Account Statement • Generated on {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative no-print" ref={dropdownRef}>
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="inline-flex items-center space-x-1.5 bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-50 transition shadow-sm"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export</span>
              <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showExportDropdown && portfolio && (
              <div className="absolute right-0 mt-2 w-44 rounded-lg bg-white border border-slate-100 shadow-xl py-1 z-50 text-xs text-slate-700">
                <button
                  onClick={() => {
                    setShowExportDropdown(false);
                    window.print();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center space-x-2"
                >
                  <span>📄</span>
                  <span>Print / PDF Document</span>
                </button>
                <button
                  onClick={() => {
                    setShowExportDropdown(false);
                    exportToExcel(portfolio.holdings, portfolio.summary);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center space-x-2"
                >
                  <span>📊</span>
                  <span>Excel Workbook (.xlsx)</span>
                </button>
                <button
                  onClick={() => {
                    setShowExportDropdown(false);
                    exportToCSV(portfolio.holdings);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center space-x-2"
                >
                  <span>📑</span>
                  <span>Raw CSV (.csv)</span>
                </button>
              </div>
            )}
          </div>

          <div className="no-print flex space-x-2 bg-slate-100 p-1 rounded-lg">
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

            {/* Asset Allocation Donut Chart */}
            <AllocationChart
              holdings={portfolio.holdings}
              totalValue={portfolio.summary.total_current_value}
            />

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">Active Schemes ({portfolio.holdings.length})</h2>
                  <span className="text-xs text-slate-500 no-print">Click row for NAV chart</span>
                </div>
                <button
                  onClick={() => setShowTxModal(true)}
                  className="no-print bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-blue-700 transition"
                >
                  + Add Investment
                </button>
              </div>

              <div className="overflow-x-auto">
                {portfolio.holdings.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3 text-lg">
                      📊
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800">No active schemes in your portfolio</h3>
                    <p className="text-xs text-slate-500 mt-1 mb-4">Start tracking your mutual funds by adding your first holding.</p>
                    <button
                      onClick={() => setShowTxModal(true)}
                      className="no-print bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      + Add Your First Fund
                    </button>
                  </div>
                ) : (
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3">Fund Name</th>
                        <th className="px-6 py-3 text-right">Units Held</th>
                        <th className="px-6 py-3 text-right">Avg Price</th>
                        <th className="px-6 py-3 text-right">Latest NAV</th>
                        <th className="px-6 py-3 text-right">Current Value</th>
                        <th className="px-6 py-3 text-right">Gain / Loss</th>
                        <th className="px-6 py-3 text-center no-print">Actions</th>
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
                          <td className="px-6 py-4 text-center no-print">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingFund(fund);
                                }}
                                className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => handleDelete(fund.scheme_code, fund.scheme_name, e)}
                                className="px-2.5 py-1 text-xs font-medium text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
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
                  className="no-print bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-slate-700 transition"
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
              loadData();
            }} 
          />
        )}

        {showTxModal && (
          <AddTransactionModal
            onClose={() => setShowTxModal(false)}
            onSuccess={() => {
              setShowTxModal(false);
              loadData();
            }}
          />
        )}

        {editingFund && (
          <EditFundModal
            fund={editingFund}
            onClose={() => setEditingFund(null)}
            onSuccess={() => {
              setEditingFund(null);
              loadData();
            }}
          />
        )}
      </main>
    </div>
  );
}