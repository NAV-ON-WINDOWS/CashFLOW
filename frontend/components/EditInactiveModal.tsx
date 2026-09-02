'use client';

import { useState } from 'react';
import { updateInactiveHolding } from '../lib/api';

interface EditInactiveModalProps {
  holding: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditInactiveModal({ holding, onClose, onSuccess }: EditInactiveModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    scheme_name: holding.scheme_name || '',
    folio_number: holding.folio_number || '',
    units: holding.units?.toString() || '',
    total_purchase_price: (holding.units * (holding.avg_buy_price || 0)).toFixed(2),
    total_selling_price: (holding.units * (holding.sell_price || 0)).toFixed(2),
    purchase_date: holding.purchase_date || '',
    sell_date: holding.sell_date || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const units = parseFloat(formData.units);
    const totalPurchasePrice = parseFloat(formData.total_purchase_price);
    const totalSellingPrice = parseFloat(formData.total_selling_price);

    const avgBuyPrice = units > 0 ? totalPurchasePrice / units : 0;
    const sellPricePerUnit = units > 0 ? totalSellingPrice / units : 0;

    try {
      await updateInactiveHolding(holding.id, {
        scheme_name: formData.scheme_name,
        folio_number: formData.folio_number || 'FOLIO-DEFAULT',
        units: units,
        avg_buy_price: avgBuyPrice,
        sell_price: sellPricePerUnit,
        purchase_date: formData.purchase_date || undefined,
        sell_date: formData.sell_date || undefined,
      });
      onSuccess();
    } catch (err: any) {
      alert(`Error updating inactive fund: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Edit Sold / Inactive Fund</h2>
            <p className="text-xs text-slate-500">Update redeemed mutual fund details</p>
          </div>
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
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Fund / Scheme Name *
            </label>
            <input
              required
              type="text"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.scheme_name}
              onChange={(e) => setFormData({ ...formData, scheme_name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Folio Number (Optional)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.folio_number}
              onChange={(e) => setFormData({ ...formData, folio_number: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Units Sold *
              </label>
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
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Total Buy Price (₹) *
              </label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.total_purchase_price}
                onChange={(e) => setFormData({ ...formData, total_purchase_price: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Total Sell Price (₹) *
              </label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.total_selling_price}
                onChange={(e) => setFormData({ ...formData, total_selling_price: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Purchase Date (Optional)
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Sell Date (Optional)
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.sell_date}
                onChange={(e) => setFormData({ ...formData, sell_date: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 flex space-x-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Update Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}