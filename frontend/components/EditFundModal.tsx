'use client';

import { useState } from 'react';
import api from '../lib/api';

export default function EditFundModal({ fund, onClose, onSuccess }: { fund: any; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    scheme_name: fund.scheme_name || '',
    scheme_code: fund.scheme_code || '',
    folio_number: fund.folio_number || '',
    units: fund.units || '',
    avg_buy_price: fund.avg_buy_price || '',
    purchase_date: fund.purchase_date || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/portfolio/fund/${fund.scheme_code}`, {
        scheme_name: formData.scheme_name,
        scheme_code: formData.scheme_code.trim(),
        units: parseFloat(formData.units as string),
        avg_buy_price: parseFloat(formData.avg_buy_price as string),
        folio_number: formData.folio_number,
        purchase_date: formData.purchase_date,
      });
      onSuccess();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message;
      alert(`Failed to update active fund: ${errorMsg}`);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Edit Active Portfolio Fund</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-medium">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Scheme Name</label>
            <input 
              type="text" 
              required 
              value={formData.scheme_name} 
              onChange={e => setFormData({...formData, scheme_name: e.target.value})} 
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">AMFI Code</label>
              <input 
                type="text" 
                value={formData.scheme_code} 
                onChange={e => setFormData({...formData, scheme_code: e.target.value})} 
                placeholder="e.g. 104908" 
                className="w-full border border-slate-200 font-mono rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Folio Number</label>
              <input 
                type="text" 
                value={formData.folio_number} 
                onChange={e => setFormData({...formData, folio_number: e.target.value})} 
                placeholder="Optional" 
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" 
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Units Held</label>
              <input 
                type="number" 
                step="any" 
                required 
                value={formData.units} 
                onChange={e => setFormData({...formData, units: e.target.value})} 
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Avg Buy Price (₹)</label>
              <input 
                type="number" 
                step="any" 
                required 
                value={formData.avg_buy_price} 
                onChange={e => setFormData({...formData, avg_buy_price: e.target.value})} 
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" 
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Purchase Date</label>
              <input 
                type="date" 
                value={formData.purchase_date} 
                onChange={e => setFormData({...formData, purchase_date: e.target.value})} 
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" 
              />
            </div>
          </div>

          <div className="pt-4 flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-200 transition">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}