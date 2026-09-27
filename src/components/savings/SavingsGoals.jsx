import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  subscribeToSavings,
  addSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
} from '../../firebase';
import { formatCurrency } from '../../utils/formatters';
import { Modal, Button, Input } from '../ui';

const GOAL_COLORS = [
  '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#f97316', '#14b8a6',
];

const defaultForm = { name: '', targetAmount: '', savedAmount: '0', deadline: '', color: GOAL_COLORS[0] };

export const SavingsGoals = ({ profile }) => {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [addModal, setAddModal] = useState(null); // {id, amount}

  useEffect(() => {
    const unsub = subscribeToSavings(profile, setGoals);
    return unsub;
  }, [profile]);

  const openAdd = () => {
    setForm(defaultForm);
    setEditGoal(null);
    setShowForm(true);
  };

  const openEdit = (goal) => {
    setEditGoal(goal);
    setForm({
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      savedAmount: String(goal.savedAmount),
      deadline: goal.deadline || '',
      color: goal.color || GOAL_COLORS[0],
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.targetAmount) return toast.error('Fill in required fields');
    setLoading(true);
    try {
      const data = {
        profile,
        name: form.name,
        targetAmount: Number(form.targetAmount),
        savedAmount: Number(form.savedAmount) || 0,
        deadline: form.deadline || null,
        color: form.color,
      };
      if (editGoal) {
        await updateSavingsGoal(editGoal.id, data);
        toast.success('Goal updated!');
      } else {
        await addSavingsGoal(data);
        toast.success('Savings goal created!');
      }
      setShowForm(false);
    } catch {
      toast.error('Failed to save goal');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSavingsGoal(id);
      toast.success('Goal deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleAddToSavings = async (goal, amount) => {
    try {
      await updateSavingsGoal(goal.id, { savedAmount: Math.min(goal.savedAmount + Number(amount), goal.targetAmount) });
      toast.success(`Added ${formatCurrency(amount)} to ${goal.name}!`);
      setAddModal(null);
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 dark:text-white">Savings Goals</h3>
        <Button size="sm" icon={<Plus size={14} />} onClick={openAdd}>New Goal</Button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <p className="text-3xl mb-2">🎯</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">No savings goals yet</p>
          <p className="text-xs text-gray-500 mt-1">Set a goal and track your progress!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {goals.map((goal) => {
            const pct = goal.targetAmount > 0 ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100) : 0;
            const completed = pct >= 100;
            return (
              <motion.div
                key={goal.id}
                layout
                className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: goal.color }}
                    >
                      {completed ? '✅' : <Target size={16} />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{goal.name}</p>
                      {goal.deadline && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">Due: {goal.deadline}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(goal)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-indigo-600 transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(goal.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-rose-500 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>{formatCurrency(goal.savedAmount)}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{Math.round(pct)}%</span>
                    <span>{formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: goal.color }}
                    />
                  </div>
                </div>

                {!completed && (
                  <button
                    onClick={() => setAddModal(goal)}
                    className="mt-2 w-full py-1.5 rounded-lg border border-dashed text-xs font-medium transition-colors"
                    style={{ borderColor: goal.color + '80', color: goal.color }}
                  >
                    + Add to savings
                  </button>
                )}
                {completed && (
                  <p className="text-center text-xs text-emerald-500 font-semibold mt-1">🎉 Goal achieved!</p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Goal form modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editGoal ? 'Edit Goal' : '🎯 New Savings Goal'}>
        <div className="flex flex-col gap-4">
          <Input label="Goal Name" placeholder="e.g. Emergency Fund" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Target Amount (₹)" type="number" placeholder="0" value={form.targetAmount} onChange={(e) => setForm((f) => ({ ...f, targetAmount: e.target.value }))} />
          <Input label="Already Saved (₹)" type="number" placeholder="0" value={form.savedAmount} onChange={(e) => setForm((f) => ({ ...f, savedAmount: e.target.value }))} />
          <Input label="Deadline (optional)" type="date" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} />
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Color</label>
            <div className="flex gap-2 flex-wrap">
              {GOAL_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className={`w-8 h-8 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <Button onClick={handleSubmit} loading={loading} className="w-full">{editGoal ? 'Update Goal' : 'Create Goal'}</Button>
        </div>
      </Modal>

      {/* Add to savings modal */}
      {addModal && (
        <Modal isOpen={!!addModal} onClose={() => setAddModal(null)} title={`Add to ${addModal.name}`}>
          <AddToSavingsForm goal={addModal} onAdd={handleAddToSavings} onClose={() => setAddModal(null)} />
        </Modal>
      )}
    </div>
  );
};

const AddToSavingsForm = ({ goal, onAdd, onClose }) => {
  const [amount, setAmount] = useState('');
  const remaining = goal.targetAmount - goal.savedAmount;
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">Remaining to reach goal: <strong>{formatCurrency(remaining)}</strong></p>
      <Input label="Amount to add (₹)" type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        <Button onClick={() => onAdd(goal, amount)} className="flex-1" disabled={!amount}>Add</Button>
      </div>
    </div>
  );
};
