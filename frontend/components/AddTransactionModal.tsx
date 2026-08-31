'use client';

import { useState } from 'react';
import axios from 'axios';

interface AddTransactionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTransactionModal({ onClose, onSuccess }: AddTransactionModalProps) {
  const [schemeName, setSchemeName] = useState('');
  const [schemeCode, setSchemeCode] = useState('');
  const [units, setUnits] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [folioNumber, setFolioNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schemeName || !units || !buyPrice) {
      alert('Please provide Fund Name, Units, and Average Buy Price.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:8000/api/portfolio/transaction', {
        scheme_name: schemeName.trim(),
        scheme_code: schemeCode.trim() || undefined,
        units: parseFloat(units),
        avg_buy_price: parseFloat(buyPrice),
        folio_number: folioNumber.trim() || 'FOLIO-MAIN',
        purchase_date: purchaseDate,
      });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      alert(`Failed to register fund: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Add Active Mutual Fund</h3>
            <p className="text-xs text-slate-500">Record a new holding with full folio and purchase details.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Mutual Fund Scheme Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Parag Parikh Flexi Cap Fund - Direct Plan - Growth"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={schemeName}
              onChange={(e) => setSchemeName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                AMFI Scheme Code (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 122639"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                value={schemeCode}
                onChange={(e) => setSchemeCode(e.target.value)}
              />
              <span className="text-[10px] text-slate-400">Used for live AMFI daily NAV sync.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Folio Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 910245678/12"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                value={folioNumber}
                onChange={(e) => setFolioNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Units Held *
              </label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 150.45"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Avg Buy Price (₹) *
              </label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 65.20"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-sans"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>
          </div>

          {units && buyPrice && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Estimated Initial Investment:</span>
              <span className="text-slate-800 font-bold font-mono">
                ₹{(parseFloat(units) * parseFloat(buyPrice)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
          )}

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
              {loading ? 'Saving...' : 'Add Fund to Portfolio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}