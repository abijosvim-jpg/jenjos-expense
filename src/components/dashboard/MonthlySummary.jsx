import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { getCategoryById } from '../../utils/categories';

export const MonthlySummary = ({ transactions }) => {
  const income  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // Top spending category
  const catMap = transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});
  const topCatEntry = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
  const topCat = topCatEntry ? getCategoryById(topCatEntry[0], 'expense').label : '—';
  const topCatAmt = topCatEntry ? topCatEntry[1] : 0;
  const avgTx = transactions.length > 0 ? expense / transactions.filter(t => t.type === 'expense').length : 0;

  const rows = [
    { label: 'Top Category', value: topCat,                     sub: topCatEntry ? formatCurrency(topCatAmt) : null },
    { label: 'Avg Expense',  value: formatCurrency(avgTx),      sub: `per transaction`, mono: true },
    { label: 'Surplus',      value: formatCurrency(income - expense), sub: income > 0 ? `${Math.max(0, Math.round(((income-expense)/income)*100))}% of income` : null, mono: true },
  ];

  return (
    <div
      className="grid grid-cols-3 gap-px"
      style={{ background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}
    >
      {rows.map(r => (
        <div key={r.label} className="p-3" style={{ background: 'var(--surface)' }}>
          <p className="stat-label mb-1.5">{r.label}</p>
          <p className={`text-sm font-semibold leading-none ${r.mono ? 'mono' : ''}`} style={{ color: 'var(--text)' }}>
            {r.value}
          </p>
          {r.sub && <p className="text-xs mono mt-1" style={{ color: 'var(--text-3)' }}>{r.sub}</p>}
        </div>
      ))}
    </div>
  );
};
