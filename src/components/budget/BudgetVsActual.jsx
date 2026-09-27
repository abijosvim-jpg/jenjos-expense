import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { subscribeToBudget } from '../../firebase';
import { getCategoryById, EXPENSE_CATEGORIES } from '../../utils/categories';
import { formatCurrency, getMonthFullLabel } from '../../utils/formatters';

export const BudgetVsActual = ({ profile, monthKey, transactions }) => {
  const [budget, setBudget] = useState(null);

  const [y, m] = monthKey.split('-').map(Number);
  const monthLabel = `${getMonthFullLabel(m - 1)} ${y}`;

  useEffect(() => {
    const unsub = subscribeToBudget(profile, monthKey, setBudget);
    return unsub;
  }, [profile, monthKey]);

  const expenses = transactions.filter((t) => t.type === 'expense');
  const actualByCategory = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const plannedIncome = budget?.plannedIncome || 0;
  const actualIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);

  const categories = budget?.categories
    ? Object.entries(budget.categories)
        .filter(([, v]) => v > 0)
        .map(([id, planned]) => {
          const cat = getCategoryById(id, 'expense');
          const actual = actualByCategory[id] || 0;
          return { id, name: cat.label, icon: cat.icon, color: cat.color, planned, actual };
        })
        .sort((a, b) => b.planned - a.planned)
    : [];

  if (!budget) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 text-center">
        <p className="text-2xl mb-2">📋</p>
        <p className="font-semibold text-gray-900 dark:text-white mb-1">No budget planned</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Use the Budget Planner to set goals for {monthLabel}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Income comparison */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Income — {monthLabel}</h4>
        <div className="flex gap-4">
          <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Planned</p>
            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(plannedIncome)}</p>
          </div>
          <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Actual</p>
            <p className={`text-lg font-bold ${actualIncome >= plannedIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {formatCurrency(actualIncome)}
            </p>
          </div>
        </div>
      </div>

      {/* Category comparison */}
      {categories.length > 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Planned vs Actual Spending</h4>
          <div className="flex flex-col gap-3">
            {categories.map((cat) => {
              const pct = cat.planned > 0 ? Math.min((cat.actual / cat.planned) * 100, 100) : 0;
              const over = cat.actual > cat.planned;
              return (
                <div key={cat.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {cat.icon} {cat.name}
                    </span>
                    <div className="text-right">
                      <span className={`text-xs font-bold ${over ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {formatCurrency(cat.actual, { compact: true })}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500"> / {formatCurrency(cat.planned, { compact: true })}</span>
                    </div>
                  </div>
                  <div className="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min((cat.actual / cat.planned) * 100, 100)}%` }}
                    />
                  </div>
                  {over && (
                    <p className="text-[10px] text-rose-500 mt-0.5">
                      Over by {formatCurrency(cat.actual - cat.planned)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};
