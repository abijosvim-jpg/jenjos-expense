import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { subscribeToAllTransactions } from '../../firebase';
import { getCategoryById } from '../../utils/categories';
import { formatCurrency } from '../../utils/formatters';

const PROFILES = {
  jency: { name: 'Jency', color: '#ec4899', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  abijos: { name: 'Abijos', color: '#6366f1', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
};

export const BothView = ({ monthKey }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAllTransactions(monthKey, (data) => {
      setTransactions(data);
      setLoading(false);
    });
    return unsub;
  }, [monthKey]);

  const getStats = (profile) => {
    const filtered = transactions.filter((t) => t.profile === profile);
    const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  };

  const jencyStats = getStats('jency');
  const abijosStats = getStats('abijos');
  const totalIncome = jencyStats.income + abijosStats.income;
  const totalExpense = jencyStats.expense + abijosStats.expense;
  const totalBalance = totalIncome - totalExpense;

  // Category breakdown for both
  const categoryMap = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      if (!acc[t.category]) acc[t.category] = { jency: 0, abijos: 0 };
      acc[t.category][t.profile] = (acc[t.category][t.profile] || 0) + t.amount;
      return acc;
    }, {});

  const chartData = Object.entries(categoryMap)
    .map(([id, vals]) => {
      const cat = getCategoryById(id, 'expense');
      return { name: cat.icon + ' ' + cat.label, jency: vals.jency || 0, abijos: vals.abijos || 0 };
    })
    .sort((a, b) => (b.jency + b.abijos) - (a.jency + a.abijos))
    .slice(0, 7);

  if (loading) return <div className="flex justify-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="flex flex-col gap-4">
      {/* Household total */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-6 text-white shadow-2xl shadow-orange-200 dark:shadow-orange-900/30">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="opacity-70" />
            <p className="text-sm font-medium opacity-80">Household Balance</p>
          </div>
          <p className="text-4xl font-extrabold tracking-tight mb-4">{formatCurrency(totalBalance)}</p>
          <div className="flex gap-3">
            <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-3">
              <p className="text-xs opacity-80 mb-1">Combined Income</p>
              <p className="text-lg font-bold">{formatCurrency(totalIncome, { compact: true })}</p>
            </div>
            <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-3">
              <p className="text-xs opacity-80 mb-1">Combined Expense</p>
              <p className="text-lg font-bold">{formatCurrency(totalExpense, { compact: true })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Per-profile cards */}
      <div className="grid grid-cols-2 gap-3">
        {[['jency', jencyStats], ['abijos', abijosStats]].map(([profile, stats]) => {
          const p = PROFILES[profile];
          return (
            <div key={profile} className={`${p.bg} rounded-2xl p-4`}>
              <p className="text-sm font-bold text-gray-900 dark:text-white mb-3">{p.name}</p>
              <div className="flex flex-col gap-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Income</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.income, { compact: true })}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Expense</p>
                  <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{formatCurrency(stats.expense, { compact: true })}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
                  <p className={`text-sm font-bold ${stats.balance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {formatCurrency(stats.balance, { compact: true })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category comparison chart */}
      {chartData.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Spending by Category</h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v >= 1000 ? (v/1000).toFixed(0)+'K' : v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="jency" name="Jency" fill="#ec4899" radius={[0, 4, 4, 0]} />
                <Bar dataKey="abijos" name="Abijos" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* All transactions */}
      {transactions.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">All Transactions</h4>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800 max-h-80 overflow-y-auto">
            {transactions.map((tx) => {
              const cat = getCategoryById(tx.category, tx.type);
              const p = PROFILES[tx.profile];
              return (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ backgroundColor: cat.color + '20' }}>
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{cat.label}</p>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: p.color }}>
                      {p.name}
                    </span>
                  </div>
                  <span className={`text-xs font-bold flex-shrink-0 ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
