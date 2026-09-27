import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const BalanceCard = ({ transactions }) => {
  const income  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
  const balance = income - expense;
  const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
  const txCount = transactions.length;

  const stats = [
    { label: 'Balance',       value: formatCurrency(balance),  sub: `${savingsRate}% saved`, highlight: true },
    { label: 'Income',        value: formatCurrency(income),   sub: `${transactions.filter(t=>t.type==='income').length} entries`,  up: true },
    { label: 'Expenses',      value: formatCurrency(expense),  sub: `${transactions.filter(t=>t.type==='expense').length} entries`, up: false },
    { label: 'Transactions',  value: String(txCount),          sub: 'this month', mono: false },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-px"
      style={{ background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}
    >
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="p-4 fade-up"
          style={{ background: 'var(--surface)', animationDelay: `${i * 0.04}s` }}
        >
          <p className="stat-label mb-2">{s.label}</p>
          <p
            className={`mono text-xl font-semibold tracking-tight leading-none mb-1 ${s.highlight ? '' : ''}`}
            style={{ color: s.highlight ? 'var(--text)' : 'var(--text)' }}
          >
            {s.value}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-3)', fontFamily: 'monospace' }}>
            {s.sub}
          </p>
        </div>
      ))}
    </div>
  );
};
