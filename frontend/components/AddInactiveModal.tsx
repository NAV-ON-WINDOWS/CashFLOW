'use client';

import { useState } from 'react';
import { addInactiveHolding } from '../lib/api';

interface AddInactiveModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddInactiveModal({ onClose, onSuccess }: AddInactiveModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    scheme_code: '',
    scheme_name: '',
    units: '',
    avg_buy_price: '',
    sell_price: '',
    sell_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addInactiveHolding({
        scheme_code: formData.scheme_code || `SOLD_${Date.now()}`,
        scheme_name: formData.scheme_name,
        units: parseFloat(formData.units),
        avg_buy_price: parseFloat(formData.avg_buy_price),
        sell_price: parseFloat(formData.sell_price),
        sell_date: formData.sell_date || undefined,
      });
      onSuccess();
    } catch (err: any) {
      alert(`Error saving sold fund: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Add Sold / Inactive Fund</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Fund Name *</label>
            <input
              required
              type="text"
              placeholder="e.g., Aditya Birla Sun Life Frontline Equity"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.scheme_name}
              onChange={(e) => setFormData({ ...formData, scheme_name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Units Sold *</label>
              <input
                required
                type="number"
                step="0.001"
                min="0"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.units}
                onChange={(e) => setFormData({ ...formData, units: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Buy Price (Avg) *</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.avg_buy_price}
                onChange={(e) => setFormData({ ...formData, avg_buy_price: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Sell Price *</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.sell_price}
                onChange={(e) => setFormData({ ...formData, sell_price: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Sell Date (Optional)</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.sell_date}
                onChange={(e) => setFormData({ ...formData, sell_date: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}