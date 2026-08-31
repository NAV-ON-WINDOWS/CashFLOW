'use client';
import { useState } from 'react';
import axios from 'axios';

interface AddWatchlistModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddWatchlistModal({ onClose, onSuccess }: AddWatchlistModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    
    setLoading(true);
    try {
      await axios.post('http://localhost:8000/api/tracker/watchlist', { scheme_code: code });
      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Failed to add scheme code. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Add Tracked Fund</h3>
        <p className="text-sm text-slate-500 mb-6">Enter the 6-digit AMFI Scheme Code to monitor its historical performance.</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="e.g. 119551"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 font-mono"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
          />
          <div className="flex justify-end space-x-3">
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
              {loading ? 'Adding...' : 'Add to Watchlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}