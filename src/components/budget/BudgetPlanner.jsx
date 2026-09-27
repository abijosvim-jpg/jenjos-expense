import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Save, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { setBudget, subscribeToBudget } from '../../firebase';
import { EXPENSE_CATEGORIES } from '../../utils/categories';
import { formatCurrency, formatMonthKey, getMonthFullLabel } from '../../utils/formatters';
import { Button, Input } from '../ui';

const getNextMonthKey = (monthKey) => {
  const [y, m] = monthKey.split('-').map(Number);
  if (m === 12) return formatMonthKey(y + 1, 0);
  return formatMonthKey(y, m);
};

export const BudgetPlanner = ({ profile, currentMonthKey }) => {
  const nextMonthKey = getNextMonthKey(currentMonthKey);
  const [targetMonth, setTargetMonth] = useState(nextMonthKey);
  const [budget, setBudgetData] = useState(null);
  const [plannedIncome, setPlannedIncome] = useState('');
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [saving, setSaving] = useState(false);

  const [tm_y, tm_m] = targetMonth.split('-').map(Number);
  const monthLabel = `${getMonthFullLabel(tm_m - 1)} ${tm_y}`;

  useEffect(() => {
    const unsub = subscribeToBudget(profile, targetMonth, (data) => {
      setBudgetData(data);
      if (data) {
        setPlannedIncome(String(data.plannedIncome || ''));
        setCategoryBudgets(data.categories || {});
      } else {
        setPlannedIncome('');
        setCategoryBudgets({});
      }
    });
    return unsub;
  }, [profile, targetMonth]);

  const totalPlanned = Object.values(categoryBudgets).reduce((s, v) => s + (Number(v) || 0), 0);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setBudget(profile, targetMonth, {
        plannedIncome: Number(plannedIncome) || 0,
        categories: Object.fromEntries(
          Object.entries(categoryBudgets).map(([k, v]) => [k, Number(v) || 0])
        ),
      });
      toast.success(`Budget saved for ${monthLabel}!`);
    } catch (err) {
      toast.error('Failed to save budget');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Budget Planner</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Planning for {monthLabel}</p>
          </div>
          {/* Month picker */}
          <select
            value={targetMonth}
            onChange={(e) => setTargetMonth(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-none focus:outline-none"
          >
            {Array.from({ length: 12 }, (_, i) => {
              const now = new Date();
              const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
              const key = formatMonthKey(d.getFullYear(), d.getMonth());
              return (
                <option key={key} value={key}>
                  {getMonthFullLabel(d.getMonth())} {d.getFullYear()}
                </option>
              );
            })}
          </select>
        </div>

        {/* Planned income */}
        <div className="mb-4">
          <Input
            label="Expected Income (₹)"
            type="number"
            placeholder="0.00"
            value={plannedIncome}
            onChange={(e) => setPlannedIncome(e.target.value)}
          />
        </div>

        {/* Category budgets */}
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Category Budgets
        </p>
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
          {EXPENSE_CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ backgroundColor: cat.color + '20' }}>
                {cat.icon}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{cat.label}</span>
              <input
                type="number"
                placeholder="0"
                value={categoryBudgets[cat.id] || ''}
                onChange={(e) => setCategoryBudgets((prev) => ({ ...prev, [cat.id]: e.target.value }))}
                className="w-24 px-2 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          ))}
        </div>

        {/* Total + save */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Planned Expenses</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(totalPlanned)}</p>
            {Number(plannedIncome) > 0 && (
              <p className={`text-xs ${totalPlanned > Number(plannedIncome) ? 'text-rose-500' : 'text-emerald-500'}`}>
                {totalPlanned > Number(plannedIncome) ? '⚠️ Exceeds income' : `✓ ${formatCurrency(Number(plannedIncome) - totalPlanned)} remaining`}
              </p>
            )}
          </div>
          <Button onClick={handleSave} loading={saving} icon={<Save size={14} />}>
            Save Budget
          </Button>
        </div>
      </div>
    </div>
  );
};
