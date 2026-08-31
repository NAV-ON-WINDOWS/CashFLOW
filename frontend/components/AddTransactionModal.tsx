'use client';

import { useState } from 'react';
import axios from 'axios';

interface AddTransactionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTransactionModal({ onClose, onSuccess }: AddTransactionModalProps) {
  const [schemeCode, setSchemeCode] = useState('');
  const [units, setUnits] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schemeCode || !units || !buyPrice) return;

    setLoading(true);
    try {
      await axios.post('http://localhost:8000/api/portfolio/transaction', {
        scheme_code: schemeCode,
        units: parseFloat(units),
        buy_price: parseFloat(buyPrice),
      });
      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Failed to record transaction. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-1">Add Portfolio Investment</h3>
        <p className="text-xs text-slate-500 mb-5">Record a buy order to update your active valuation.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Scheme Code</label>
            <input
              type="text"
              placeholder="e.g. 120503"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              value={schemeCode}
              onChange={(e) => setSchemeCode(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Units</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 50.5"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Buy Price (₹)</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 110.25"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Add Investment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}