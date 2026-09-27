import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timestamp } from '../../firebase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { addTransaction, updateTransaction } from '../../firebase';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../utils/categories';

const Label = ({ children }) => (
  <label className="block text-xs font-medium uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace' }}>
    {children}
  </label>
);

export const TransactionForm = ({ isOpen, onClose, type, profile, monthKey, editData }) => {
  const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const [form, setForm] = useState({
    amount: '',
    category: cats[0]?.id || '',
    note: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: type || 'expense',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        amount: String(editData.amount || ''),
        category: editData.category || cats[0]?.id,
        note: editData.note || '',
        date: editData.date?.toDate ? format(editData.date.toDate(), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        type: editData.type || type,
      });
    }
  }, [editData]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        amount: amt,
        profile,
        month: monthKey,
        date: Timestamp.fromDate(new Date(form.date)),
      };
      if (editData) await updateTransaction(editData.id, payload);
      else await addTransaction(payload);
      toast.success(editData ? 'Updated' : 'Added');
      onClose();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.8)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-sm"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                  {editData ? 'Edit' : 'New'} {type === 'income' ? 'Income' : 'Expense'}
                </p>
                <p className="text-xs mono mt-0.5" style={{ color: 'var(--text-3)' }}>{monthKey}</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded transition-colors" style={{ color: 'var(--text-3)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
              >
                <X size={14} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              {/* Amount */}
              <div>
                <Label>Amount (₹)</Label>
                <input
                  type="number" min="0" step="0.01" required
                  value={form.amount}
                  onChange={e => set('amount', e.target.value)}
                  placeholder="0.00"
                  className="field mono text-lg font-semibold"
                  style={{ fontSize: '18px' }}
                  autoFocus
                />
              </div>

              {/* Category */}
              <div>
                <Label>Category</Label>
                <select value={form.category} onChange={e => set('category', e.target.value)} className="field">
                  {cats.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>

              {/* Note */}
              <div>
                <Label>Note (optional)</Label>
                <input
                  type="text"
                  value={form.note}
                  onChange={e => set('note', e.target.value)}
                  placeholder="Description..."
                  className="field"
                />
              </div>

              {/* Date */}
              <div>
                <Label>Date</Label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => set('date', e.target.value)}
                  className="field mono"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={onClose} className="btn btn-ghost flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary flex-1">
                  {saving ? 'Saving…' : editData ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
