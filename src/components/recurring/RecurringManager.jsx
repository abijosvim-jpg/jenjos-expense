import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  subscribeToRecurring,
  addRecurring,
  updateRecurring,
  deleteRecurring,
} from '../../firebase';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, getCategoryById } from '../../utils/categories';
import { formatCurrency } from '../../utils/formatters';
import { Modal, Button, Input, Select } from '../ui';
import { Badge } from '../ui';

const defaultForm = {
  type: 'expense',
  amount: '',
  category: '',
  note: '',
  dayOfMonth: '1',
  active: true,
};

export const RecurringManager = ({ profile }) => {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeToRecurring(profile, setItems);
    return unsub;
  }, [profile]);

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const openAdd = () => {
    setForm(defaultForm);
    setEditItem(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      type: item.type,
      amount: String(item.amount),
      category: item.category,
      note: item.note || '',
      dayOfMonth: String(item.dayOfMonth),
      active: item.active,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.amount || !form.category) return toast.error('Fill in required fields');
    setLoading(true);
    try {
      const data = {
        profile,
        type: form.type,
        amount: Number(form.amount),
        category: form.category,
        note: form.note,
        dayOfMonth: Number(form.dayOfMonth),
        active: form.active,
      };
      if (editItem) {
        await updateRecurring(editItem.id, data);
        toast.success('Updated!');
      } else {
        await addRecurring(data);
        toast.success('Recurring transaction added!');
      }
      setShowForm(false);
    } catch {
      toast.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (item) => {
    try {
      await updateRecurring(item.id, { active: !item.active });
      toast.success(item.active ? 'Paused' : 'Activated');
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRecurring(id);
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target ? e.target.value : e }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">Recurring Transactions</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Auto-added every month</p>
        </div>
        <Button size="sm" icon={<Plus size={14} />} onClick={openAdd}>Add</Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <p className="text-3xl mb-2">🔁</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">No recurring transactions</p>
          <p className="text-xs text-gray-500 mt-1">Add rent, subscriptions, salary etc.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const cat = getCategoryById(item.category, item.type);
            return (
              <motion.div
                key={item.id}
                layout
                className={`flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-2xl border transition-all ${
                  item.active
                    ? 'border-gray-100 dark:border-gray-800'
                    : 'border-dashed border-gray-200 dark:border-gray-700 opacity-60'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: cat.color + '20' }}
                >
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{cat.label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Day {item.dayOfMonth} of each month
                    {item.note ? ` · ${item.note}` : ''}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-sm font-bold ${item.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => toggleActive(item)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title={item.active ? 'Pause' : 'Activate'}>
                    {item.active
                      ? <ToggleRight size={16} className="text-emerald-500" />
                      : <ToggleLeft size={16} className="text-gray-400" />}
                  </button>
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-indigo-600 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-rose-500 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Form modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editItem ? 'Edit Recurring' : '🔁 Add Recurring Transaction'}>
        <div className="flex flex-col gap-4">
          {/* Type toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {['expense', 'income'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: t, category: '' }))}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  form.type === t
                    ? t === 'expense' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                    : 'text-gray-500'
                }`}
              >
                {t === 'expense' ? '💸 Expense' : '💰 Income'}
              </button>
            ))}
          </div>
          <Input label="Amount (₹)" type="number" placeholder="0" value={form.amount} onChange={set('amount')} />
          <Select label="Category" value={form.category} onChange={set('category')}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
          </Select>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Day of Month</label>
            <input
              type="number"
              min="1" max="28"
              value={form.dayOfMonth}
              onChange={set('dayOfMonth')}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Input label="Note (optional)" placeholder="e.g. Netflix subscription" value={form.note} onChange={set('note')} />
          <Button onClick={handleSubmit} loading={loading} className="w-full">{editItem ? 'Update' : 'Add Recurring'}</Button>
        </div>
      </Modal>
    </div>
  );
};
