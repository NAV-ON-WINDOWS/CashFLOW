'use client';

import { useState } from 'react';
import api from '../lib/api';

interface EditFundModalProps {
  fund: {
    scheme_code: string;
    scheme_name: string;
    units: number;
    avg_buy_price: number;
    folio_number?: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditFundModal({ fund, onClose, onSuccess }: EditFundModalProps) {
  const [schemeName, setSchemeName] = useState(fund.scheme_name);
  const [units, setUnits] = useState(fund.units.toString());
  const [buyPrice, setBuyPrice] = useState(fund.avg_buy_price.toString());
  const [folioNumber, setFolioNumber] = useState(fund.folio_number || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/portfolio/fund/${fund.scheme_code}`, {
        scheme_name: schemeName.trim(),
        units: parseFloat(units),
        avg_buy_price: parseFloat(buyPrice),
        folio_number: folioNumber.trim() || 'FOLIO-MAIN',
      });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      alert(`Update failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Edit Fund Details</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Fund Name</label>
            <input
              type="text"
              value={schemeName}
              onChange={(e) => setSchemeName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Units Held</label>
              <input
                type="number"
                step="any"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Avg Buy Price (₹)</label>
              <input
                type="number"
                step="any"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Folio Number</label>
            <input
              type="text"
              value={folioNumber}
              onChange={(e) => setFolioNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}