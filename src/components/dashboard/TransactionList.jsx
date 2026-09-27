import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteTransaction } from '../../firebase';
import { getCategoryById } from '../../utils/categories';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { TransactionForm } from './TransactionForm';

export const TransactionList = ({ transactions, profile, monthKey }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editTx, setEditTx] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = transactions.filter(t => {
    const cat = getCategoryById(t.category, t.type);
    const matchSearch = !search ||
      (t.note || '').toLowerCase().includes(search.toLowerCase()) ||
      cat.label.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || t.type === filterType;
    const matchCat = filterCategory === 'all' || t.category === filterCategory;
    return matchSearch && matchType && matchCat;
  });

  const uniqueCategories = [...new Set(transactions.map(t => t.category))];

  const handleDelete = async (id) => {
    try { await deleteTransaction(id); toast.success('Deleted'); setConfirmDelete(null); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <div className="relative flex-1 min-w-40">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="field pl-8 text-xs h-8"
          />
        </div>

        {/* Type filter */}
        <div className="flex" style={{ border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
          {['all', 'income', 'expense'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className="px-3 h-8 text-xs font-medium transition-colors capitalize"
              style={{
                background: filterType === t ? 'var(--surface2)' : 'var(--surface)',
                color: filterType === t ? 'var(--text)' : 'var(--text-3)',
                borderRight: t !== 'expense' ? '1px solid var(--border)' : 'none',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {uniqueCategories.length > 0 && (
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="field h-8 text-xs"
            style={{ width: 'auto', minWidth: 120 }}
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map(c => (
              <option key={c} value={c}>{getCategoryById(c).label}</option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="mono text-xs" style={{ color: 'var(--text-3)' }}>
            {transactions.length === 0 ? 'No transactions this month' : 'No results'}
          </p>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
          {/* Header */}
          <div
            className="grid text-xs font-medium px-4 py-2"
            style={{
              gridTemplateColumns: '1fr 100px 90px 80px 36px',
              color: 'var(--text-3)',
              background: 'var(--surface2)',
              borderBottom: '1px solid var(--border)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            <span>Description</span>
            <span>Category</span>
            <span>Date</span>
            <span className="text-right">Amount</span>
            <span />
          </div>

          <AnimatePresence>
            {filtered.map((tx, i) => {
              const cat = getCategoryById(tx.category, tx.type);
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="group tx-row grid text-xs"
                  style={{ gridTemplateColumns: '1fr 100px 90px 80px 36px' }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
                      style={{ background: tx.type === 'income' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)' }}
                    />
                    <span className="truncate" style={{ color: 'var(--text)' }}>
                      {tx.note || cat.label}
                    </span>
                    {tx.isRecurring && (
                      <span className="text-[10px] px-1 py-0.5 mono" style={{ border: '1px solid var(--border)', color: 'var(--text-3)', borderRadius: '3px' }}>
                        recurring
                      </span>
                    )}
                  </div>
                  <span className="truncate" style={{ color: 'var(--text-3)' }}>{cat.label}</span>
                  <span className="mono" style={{ color: 'var(--text-3)' }}>{formatDate(tx.date)}</span>
                  <span
                    className="mono text-right font-medium"
                    style={{ color: tx.type === 'income' ? 'var(--text)' : 'var(--text-2)' }}
                  >
                    {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount)}
                  </span>
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditTx(tx)}
                      className="p-1 rounded transition-colors"
                      style={{ color: 'var(--text-3)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                    >
                      <Pencil size={11} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(tx.id)}
                      className="p-1 rounded transition-colors"
                      style={{ color: 'var(--text-3)' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Summary row */}
      {filtered.length > 0 && (
        <div className="flex justify-between mt-2 px-1">
          <span className="text-xs mono" style={{ color: 'var(--text-3)' }}>{filtered.length} transactions</span>
          <span className="text-xs mono" style={{ color: 'var(--text-2)' }}>
            Net: {formatCurrency(
              filtered.filter(t => t.type === 'income').reduce((s,t) => s+t.amount, 0) -
              filtered.filter(t => t.type === 'expense').reduce((s,t) => s+t.amount, 0)
            )}
          </span>
        </div>
      )}

      {/* Edit */}
      {editTx && (
        <TransactionForm isOpen={!!editTx} onClose={() => setEditTx(null)} type={editTx.type} profile={profile} monthKey={monthKey} editData={editTx} />
      )}

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)' }}
              onClick={() => setConfirmDelete(null)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative p-6 w-full max-w-xs"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px' }}
            >
              <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>Delete transaction?</p>
              <p className="text-xs mb-5" style={{ color: 'var(--text-3)' }}>This cannot be undone.</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(null)} className="btn btn-ghost flex-1">Cancel</button>
                <button onClick={() => handleDelete(confirmDelete)} className="btn btn-primary flex-1">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
