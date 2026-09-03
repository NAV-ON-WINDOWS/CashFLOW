'use client';

import { useState } from 'react';
import api from '../lib/api';

export default function EditInactiveModal({
  holding,
  onClose,
  onSuccess,
}: {
  holding: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const initialUnits = holding.units || '';
  const initialBuyTotal =
    holding.units && holding.avg_buy_price
      ? (holding.units * holding.avg_buy_price).toFixed(2)
      : '';
  const initialSellTotal =
    holding.units && holding.sell_price
      ? (holding.units * holding.sell_price).toFixed(2)
      : '';

  const [formData, setFormData] = useState({
    scheme_name: holding.scheme_name || '',
    scheme_code: holding.scheme_code || '',
    folio_number: holding.folio_number || '',
    units: initialUnits,
    total_buy_price: initialBuyTotal,
    total_sell_price: initialSellTotal,
    purchase_date: holding.purchase_date || '',
    sell_date: holding.sell_date || '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const units = parseFloat(formData.units as string);
      const totalBuy = parseFloat(formData.total_buy_price as string);
      const totalSell = parseFloat(formData.total_sell_price as string);

      const avg_buy_price = units > 0 ? totalBuy / units : 0;
      const sell_price = units > 0 ? totalSell / units : 0;

      await api.put(`/inactive-portfolio/${holding.id}`, {
        scheme_name: formData.scheme_name.trim(),
        scheme_code: formData.scheme_code.trim() || null,
        units: units,
        avg_buy_price: avg_buy_price,
        sell_price: sell_price,
        folio_number: formData.folio_number.trim() || 'FOLIO-DEFAULT',
        purchase_date: formData.purchase_date || null,
        sell_date: formData.sell_date || null,
      });

      onSuccess();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message;
      alert(`Failed to update sold/inactive fund: ${errorMsg}`);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white p-7 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-start justify-between pb-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Edit Sold / Inactive Fund
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Update details or recorded realized P&amp;L
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fund / Scheme Name */}
          <div>
            <label className="block text-[11px] font-bold tracking-wider text-slate-600 uppercase">
              Fund / Scheme Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Aditya Birla Sun Life Frontline Equity"
              value={formData.scheme_name}
              onChange={(e) => setFormData({ ...formData, scheme_name: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
            />
          </div>

          {/* AMFI Scheme Code & Folio Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-600 uppercase">
                AMFI Scheme Code (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., 119551"
                value={formData.scheme_code}
                onChange={(e) => setFormData({ ...formData, scheme_code: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-mono text-slate-800 placeholder-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-600 uppercase">
                Folio Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., 101928374/0"
                value={formData.folio_number}
                onChange={(e) => setFormData({ ...formData, folio_number: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
              />
            </div>
          </div>

          {/* Units, Total Buy Price, Total Sell Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-600 uppercase">
                Units Sold *
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g. 100.5"
                value={formData.units}
                onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-mono text-slate-800 placeholder-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-600 uppercase">
                Total Buy Price (₹) *
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g. 40000"
                value={formData.total_buy_price}
                onChange={(e) => setFormData({ ...formData, total_buy_price: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-mono text-slate-800 placeholder-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-600 uppercase">
                Total Sell Price (₹) *
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g. 50000"
                value={formData.total_sell_price}
                onChange={(e) => setFormData({ ...formData, total_sell_price: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-mono text-slate-800 placeholder-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-600 uppercase">
                Purchase Date (Optional)
              </label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-700 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-600 uppercase">
                Sell Date (Optional)
              </label>
              <input
                type="date"
                value={formData.sell_date}
                onChange={(e) => setFormData({ ...formData, sell_date: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-700 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#0f172a] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1e293b] transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}