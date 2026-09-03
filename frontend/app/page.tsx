'use client';

import { useEffect, useState, useRef } from 'react';
import AddWatchlistModal from '../components/AddWatchlistModal';
import AddTransactionModal from '../components/AddTransactionModal';
import AddInactiveModal from '../components/AddInactiveModal';
import EditFundModal from '../components/EditFundModal';
import EditInactiveModal from '../components/EditInactiveModal';
import NavChartModal from '../components/NavChartModal';
import AllocationChart from '../components/AllocationChart';
import AnimatedCounter from '../components/AnimatedCounter';
import api, { 
  fetchPortfolio, 
  fetchWatchlist, 
  getInactiveHoldings, 
  deleteInactiveHolding, 
  PortfolioResponse, 
  WatchlistFund 
} from '../lib/api';
import { exportToExcel, exportToCSV } from '../lib/exportUtils';

export default function Home() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [showAddInactiveModal, setShowAddInactiveModal] = useState(false);
  const [editingFund, setEditingFund] = useState<any | null>(null);
  const [editingInactiveFund, setEditingInactiveFund] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [inactiveHoldings, setInactiveHoldings] = useState<PortfolioResponse | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistFund[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'inactive' | 'watchlist'>('overview');
  const [selectedScheme, setSelectedScheme] = useState<string | null>(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    try {
      const [pData, wData, iData] = await Promise.all([
        fetchPortfolio(),
        fetchWatchlist(),
        getInactiveHoldings()
      ]);
      setPortfolio(pData);
      setWatchlist(wData);
      setInactiveHoldings(iData);
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
    if (!confirm(`Are you sure you want to delete "${fundName}" from your active portfolio?`)) return;
    try {
      await api.delete(`/portfolio/fund/${schemeCode}`);
      await loadData();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleDeleteInactive = async (id: number, fundName: string) => {
    if (!confirm(`Remove "${fundName}" from dormant records?`)) return;
    try {
      await deleteInactiveHolding(id);
      await loadData();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // 1. Active Portfolio Live Metrics
  const activeInvested = portfolio?.summary?.total_invested || 0;
  const activeCurrentValue = portfolio?.summary?.total_current_value || 0;
  const activePnL = portfolio?.summary?.total_profit_loss || 0;
  const activeReturnPct = portfolio?.summary?.overall_return_percentage || 0;

  // 2. Dormant (Inactive) Portfolio Live Metrics
  const dormantInvested = inactiveHoldings?.summary?.total_invested || 0;
  const dormantCurrentValue = inactiveHoldings?.summary?.total_current_value || 0;
  const dormantPnL = inactiveHoldings?.summary?.total_profit_loss || 0;
  const dormantReturnPct = inactiveHoldings?.summary?.overall_return_percentage || 0;

  // 3. Consolidated Master Metrics
  const totalCombinedInvested = activeInvested + dormantInvested;
  const totalCombinedCurrentValue = activeCurrentValue + dormantCurrentValue;
  const totalCombinedPnL = activePnL + dormantPnL;
  const combinedOverallReturn = totalCombinedInvested > 0 
    ? ((totalCombinedPnL / totalCombinedInvested) * 100).toFixed(2) 
    : '0.00';

  if (!mounted || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc] text-slate-700 font-sans">
        <div className="animate-pulse text-lg font-medium flex flex-col items-center">
          <svg className="w-8 h-8 text-blue-500 mb-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Connecting to CashFLOW & AMFI Live feeds...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <header className="border-b border-slate-200 bg-white px-8 py-4 shadow-sm flex items-center justify-between sticky top-0 z-40">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-black tracking-tight text-slate-900">
              Cash<span className="text-blue-600">FLOW</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
              Terminal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidated Wealth Statement • Updated {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
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
              <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white border border-slate-100 shadow-xl py-1 z-50 text-xs text-slate-700">
                <button
                  onClick={() => { setShowExportDropdown(false); window.print(); }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center space-x-2"
                >
                  <span>📄</span><span>Print / PDF Statement</span>
                </button>
                <button
                  onClick={() => { setShowExportDropdown(false); exportToExcel(portfolio.holdings, portfolio.summary); }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center space-x-2"
                >
                  <span>📊</span><span>Excel Workbook (.xlsx)</span>
                </button>
                <button
                  onClick={() => { setShowExportDropdown(false); exportToCSV(portfolio.holdings); }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center space-x-2"
                >
                  <span>📑</span><span>Raw CSV (.csv)</span>
                </button>
              </div>
            )}
          </div>

          <div className="no-print flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'overview' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Master Overview
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'portfolio' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Active Portfolio
            </button>
            <button
              onClick={() => setActiveTab('inactive')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'inactive' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Dormant Portfolio
            </button>
          </div>

          <button
            onClick={() => setActiveTab('watchlist')}
            className={`no-print px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
              activeTab === 'watchlist' ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Tracked Watchlist
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-8">
        {/* TAB 1: MASTER OVERVIEW */}
        {activeTab === 'overview' && portfolio && (
          <div className="space-y-6">
            {/* Top 4 Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Allocated</span>
                    <p className="text-2xl font-extrabold mt-1 text-slate-800 tracking-tight">
                      <AnimatedCounter value={totalCombinedInvested} prefix="₹" decimals={0} isCurrency />
                    </p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-500 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-50 text-[11px] text-slate-400 font-medium">
                  Active (₹{(activeInvested/100000).toFixed(2)}L) + Dormant (₹{(dormantInvested/100000).toFixed(2)}L)
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Combined Net Worth</span>
                    <p className="text-2xl font-extrabold mt-1 text-indigo-600 tracking-tight">
                      <AnimatedCounter value={totalCombinedCurrentValue} prefix="₹" decimals={0} isCurrency />
                    </p>
                  </div>
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-50 text-[11px] text-slate-400 font-medium">
                  Current real-time value if fully redeemed
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className={`absolute top-0 left-0 w-full h-1 ${totalCombinedPnL >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Live P&L</span>
                    <p className={`text-2xl font-extrabold mt-1 tracking-tight ${totalCombinedPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      <AnimatedCounter value={Math.abs(totalCombinedPnL)} prefix={totalCombinedPnL >= 0 ? '+₹' : '-₹'} decimals={0} isCurrency />
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg group-hover:scale-110 transition-transform ${totalCombinedPnL >= 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-50 text-[11px] text-slate-400 font-medium">
                  Active (₹{(activePnL/100000).toFixed(2)}L) + Dormant (₹{(dormantPnL/100000).toFixed(2)}L)
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className={`absolute top-0 left-0 w-full h-1 ${parseFloat(combinedOverallReturn) >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cumulative Return</span>
                    <p className={`text-2xl font-extrabold mt-1 tracking-tight ${parseFloat(combinedOverallReturn) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      <AnimatedCounter value={parseFloat(combinedOverallReturn)} prefix={parseFloat(combinedOverallReturn) >= 0 ? '+' : ''} suffix="%" decimals={2} />
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg group-hover:scale-110 transition-transform ${parseFloat(combinedOverallReturn) >= 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-50 text-[11px] text-slate-400 font-medium">
                  Aggregated across {(portfolio.holdings.length + (inactiveHoldings?.holdings?.length || 0))} total schemes
                </div>
              </div>
            </div>

            {/* Side-by-Side: Active vs Dormant Allocation Dashboards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Portfolio Section */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                <div className="p-6 pb-2">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Active Portfolio</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Currently active contributions</p>
                    </div>
                    <span className="bg-blue-50 text-blue-700 text-[11px] px-2.5 py-1 rounded-md font-bold uppercase">
                      {portfolio.holdings.length} Schemes
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 mb-4 bg-slate-50/50 rounded-xl px-4">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Invested</span>
                      <span className="text-sm font-bold text-slate-800 font-mono">₹{activeInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Current Net</span>
                      <span className="text-sm font-bold text-blue-600 font-mono">₹{activeCurrentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Live P&L</span>
                      <span className={`text-sm font-bold font-mono ${activePnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {activePnL >= 0 ? '+' : '-'}₹{Math.abs(activePnL).toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({activeReturnPct}%)
                      </span>
                    </div>
                  </div>

                  <div className="[&>div]:border-none [&>div]:shadow-none [&>div]:mb-0 [&>div]:p-0">
                    <AllocationChart holdings={portfolio.holdings} totalValue={activeCurrentValue} />
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('portfolio')}
                  className="w-full py-3 bg-slate-50/70 hover:bg-slate-100/70 border-t border-slate-100 text-xs font-bold text-slate-700 transition flex items-center justify-center space-x-1"
                >
                  <span>Manage Active Portfolio</span>
                  <span>→</span>
                </button>
              </div>

              {/* Dormant Portfolio Section */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                <div className="p-6 pb-2">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Dormant Portfolio</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Parked funds tracking AMFI</p>
                    </div>
                    <span className="bg-slate-100 text-slate-600 text-[11px] px-2.5 py-1 rounded-md font-bold uppercase">
                      {inactiveHoldings?.holdings?.length || 0} Schemes
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 mb-4 bg-slate-50/50 rounded-xl px-4">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Invested</span>
                      <span className="text-sm font-bold text-slate-800 font-mono">₹{dormantInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Redeem Value</span>
                      <span className="text-sm font-bold text-indigo-600 font-mono">₹{dormantCurrentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Live P&L</span>
                      <span className={`text-sm font-bold font-mono ${dormantPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {dormantPnL >= 0 ? '+' : '-'}₹{Math.abs(dormantPnL).toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({dormantReturnPct}%)
                      </span>
                    </div>
                  </div>

                  {inactiveHoldings && (
                    <div className="[&>div]:border-none [&>div]:shadow-none [&>div]:mb-0 [&>div]:p-0">
                      <AllocationChart holdings={inactiveHoldings.holdings} totalValue={dormantCurrentValue} />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setActiveTab('inactive')}
                  className="w-full py-3 bg-slate-50/70 hover:bg-slate-100/70 border-t border-slate-100 text-xs font-bold text-slate-700 transition flex items-center justify-center space-x-1"
                >
                  <span>Manage Dormant Portfolio</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE PORTFOLIO */}
        {activeTab === 'portfolio' && portfolio && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Invested Capital</span>
                <p className="text-2xl font-bold mt-1 text-slate-800">
                  <AnimatedCounter value={portfolio.summary.total_invested} prefix="₹" isCurrency />
                </p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Net Worth</span>
                <p className="text-2xl font-bold mt-1 text-blue-600">
                  <AnimatedCounter value={portfolio.summary.total_current_value} prefix="₹" decimals={2} isCurrency />
                </p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Profit / Loss</span>
                <p className={`text-2xl font-bold mt-1 ${portfolio.summary.total_profit_loss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  <AnimatedCounter 
                    value={Math.abs(portfolio.summary.total_profit_loss)} 
                    prefix={portfolio.summary.total_profit_loss >= 0 ? '+₹' : '-₹'} 
                    decimals={2}
                    isCurrency 
                  />
                </p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Return</span>
                <p className={`text-2xl font-bold mt-1 ${portfolio.summary.overall_return_percentage >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  <AnimatedCounter 
                    value={portfolio.summary.overall_return_percentage} 
                    prefix={portfolio.summary.overall_return_percentage >= 0 ? '+' : ''} 
                    suffix="%" 
                    decimals={2} 
                  />
                </p>
              </div>
            </div>

            <AllocationChart holdings={portfolio.holdings} totalValue={portfolio.summary.total_current_value} />

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
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Fund Name</th>
                      <th className="px-6 py-3 text-right">Units Held</th>
                      <th className="px-6 py-3 text-right">Invested Amount</th>
                      <th className="px-6 py-3 text-right">Latest NAV</th>
                      <th className="px-6 py-3 text-right">Current Value</th>
                      <th className="px-6 py-3 text-right">Gain / Loss</th>
                      <th className="px-6 py-3 text-center no-print">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {portfolio.holdings.map((fund) => {
                      const investedAmount = fund.units * fund.avg_buy_price;
                      return (
                        <tr key={fund.scheme_code} onClick={() => setSelectedScheme(fund.scheme_code)} className="hover:bg-blue-50/40 cursor-pointer transition">
                          <td className="px-6 py-4 font-medium text-slate-900">
                            <div>{fund.scheme_name}</div>
                            <span className="text-xs text-slate-400 font-mono">Code: {fund.scheme_code} • {fund.nav_date}</span>
                          </td>
                          <td className="px-6 py-4 text-right font-mono">{fund.units}</td>
                          <td className="px-6 py-4 text-right font-mono">
                            <div className="font-semibold text-slate-900">₹{investedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            <span className="text-xs text-slate-400">@ ₹{fund.avg_buy_price.toFixed(2)}/u</span>
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-medium text-slate-800">₹{fund.current_nav.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right font-mono font-semibold text-slate-900">₹{fund.current_value.toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4 text-right">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${fund.profit_loss >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                              {fund.profit_loss >= 0 ? '+' : ''}₹{fund.profit_loss.toFixed(2)} ({fund.returns_percentage}%)
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center no-print">
                            <div className="flex items-center justify-center space-x-2">
                              <button onClick={(e) => { e.stopPropagation(); setEditingFund(fund); }} className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded transition">Edit</button>
                              <button onClick={(e) => handleDelete(fund.scheme_code, fund.scheme_name, e)} className="px-2.5 py-1 text-xs font-medium text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition">Delete</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DORMANT / INACTIVE */}
        {activeTab === 'inactive' && inactiveHoldings && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Capital Invested</span>
                <p className="text-2xl font-bold mt-1 text-slate-800">
                  <AnimatedCounter value={inactiveHoldings.summary.total_invested} prefix="₹" decimals={2} isCurrency />
                </p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Value if Redeemed Today</span>
                <p className="text-2xl font-bold mt-1 text-blue-600">
                  <AnimatedCounter value={inactiveHoldings.summary.total_current_value} prefix="₹" decimals={2} isCurrency />
                </p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current P&L if Redeemed</span>
                <p className={`text-2xl font-bold mt-1 ${inactiveHoldings.summary.total_profit_loss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  <AnimatedCounter 
                    value={Math.abs(inactiveHoldings.summary.total_profit_loss)} 
                    prefix={inactiveHoldings.summary.total_profit_loss >= 0 ? '+₹' : '-₹'} 
                    decimals={2}
                    isCurrency 
                  />
                </p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Live Return</span>
                <p className={`text-2xl font-bold mt-1 ${inactiveHoldings.summary.overall_return_percentage >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  <AnimatedCounter 
                    value={inactiveHoldings.summary.overall_return_percentage} 
                    prefix={inactiveHoldings.summary.overall_return_percentage >= 0 ? '+' : ''} 
                    suffix="%" 
                    decimals={2} 
                  />
                </p>
              </div>
            </div>

            <AllocationChart holdings={inactiveHoldings.holdings} totalValue={inactiveHoldings.summary.total_current_value} />

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">Dormant Holdings ({inactiveHoldings.holdings.length})</h2>
                  <span className="text-xs text-slate-500 no-print">Click any row to view 1-year NAV performance chart</span>
                </div>
                <button
                  onClick={() => setShowAddInactiveModal(true)}
                  className="no-print bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-slate-700 transition"
                >
                  + Add Dormant Fund
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Fund Details</th>
                      <th className="px-6 py-3 text-right">Units Held</th>
                      <th className="px-6 py-3 text-right">Invested Amount</th>
                      <th className="px-6 py-3 text-right">Live NAV</th>
                      <th className="px-6 py-3 text-right">Value if Redeemed</th>
                      <th className="px-6 py-3 text-right">Live P&L</th>
                      <th className="px-6 py-3 text-center no-print">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inactiveHoldings.holdings?.map((item) => {
                      const investedAmount = item.units * item.avg_buy_price;
                      return (
                        <tr 
                          key={item.id} 
                          onClick={() => {
                            if (item.scheme_code && !item.scheme_code.startsWith('SOLD_') && !item.scheme_code.startsWith('CUSTOM_')) {
                              setSelectedScheme(item.scheme_code);
                            } else {
                              alert("Historical charts require a valid AMFI Scheme Code. Edit this fund to add its AMFI code.");
                            }
                          }}
                          className="hover:bg-blue-50/40 cursor-pointer transition"
                        >
                          <td className="px-6 py-4 font-medium text-slate-900">
                            <div>{item.scheme_name}</div>
                            <span className="text-xs text-slate-400 font-mono">
                              Code: {item.scheme_code} • {item.nav_date}
                              {item.folio_number ? ` • Folio: ${item.folio_number}` : ''}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-mono">{item.units}</td>
                          <td className="px-6 py-4 text-right font-mono">
                            <div className="font-semibold text-slate-900">
                              ₹{investedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <span className="text-xs text-slate-400">@ ₹{item.avg_buy_price.toFixed(2)}/u</span>
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-medium text-slate-800">₹{item.current_nav.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right font-mono font-semibold text-slate-900">
                            ₹{item.current_value.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${item.profit_loss >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                              {item.profit_loss >= 0 ? '+' : ''}₹{item.profit_loss.toFixed(2)} ({item.returns_percentage}%)
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center no-print">
                            <div className="flex items-center justify-center space-x-2">
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setEditingInactiveFund(item); 
                                }} 
                                className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded transition"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  handleDeleteInactive(item.id, item.scheme_name); 
                                }} 
                                className="px-2.5 py-1 text-xs font-medium text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TRACKED WATCHLIST */}
        {activeTab === 'watchlist' && (
          <div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">Tracked Watchlist</h2>
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
                      <tr key={fund.scheme_code} onClick={() => setSelectedScheme(fund.scheme_code)} className="hover:bg-blue-50/40 cursor-pointer transition">
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

        <NavChartModal schemeCode={selectedScheme} onClose={() => setSelectedScheme(null)} />
        {showAddModal && <AddWatchlistModal onClose={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); loadData(); }} />}
        {showTxModal && <AddTransactionModal onClose={() => setShowTxModal(false)} onSuccess={() => { setShowTxModal(false); loadData(); }} />}
        {showAddInactiveModal && <AddInactiveModal onClose={() => setShowAddInactiveModal(false)} onSuccess={() => { setShowAddInactiveModal(false); loadData(); }} />}
        {editingFund && <EditFundModal fund={editingFund} onClose={() => setEditingFund(null)} onSuccess={() => { setEditingFund(null); loadData(); }} />}
        {editingInactiveFund && <EditInactiveModal holding={editingInactiveFund} onClose={() => setEditingInactiveFund(null)} onSuccess={() => { setEditingInactiveFund(null); loadData(); }} />}
      </main>
    </div>
  );
}