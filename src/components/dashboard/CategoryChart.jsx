import React from 'react';
import { getCategoryById } from '../../utils/categories';
import { formatCurrency } from '../../utils/formatters';

export const CategoryChart = ({ transactions }) => {
  const expenses = transactions.filter(t => t.type === 'expense');
  const categoryMap = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const total = Object.values(categoryMap).reduce((s, v) => s + v, 0);
  const data = Object.entries(categoryMap)
    .map(([id, value]) => ({ id, label: getCategoryById(id, 'expense').label, value, pct: total > 0 ? (value / total) * 100 : 0 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  if (data.length === 0) {
    return (
      <div className="py-10 text-center" style={{ color: 'var(--text-3)' }}>
        <p className="mono text-xs">No expense data</p>
      </div>
    );
  }

  const maxVal = data[0].value;

  return (
    <div className="flex flex-col gap-3">
      {data.map((item, i) => {
        // Monochrome intensity: first bar = 100% white, last = 30%
        const opacity = 1 - (i / data.length) * 0.7;
        return (
          <div key={item.id} className="flex items-center gap-3">
            <div className="w-28 flex-shrink-0">
              <p className="text-xs truncate" style={{ color: 'var(--text-2)', fontFamily: 'Inter, sans-serif' }}>
                {item.label}
              </p>
            </div>
            <div className="flex-1 relative h-4 flex items-center">
              <div
                className="absolute left-0 h-full rounded-sm transition-all duration-700"
                style={{
                  width: `${(item.value / maxVal) * 100}%`,
                  background: `rgba(255,255,255,${opacity * 0.15})`,
                  border: `1px solid rgba(255,255,255,${opacity * 0.2})`,
                }}
              />
            </div>
            <div className="text-right flex-shrink-0 w-24">
              <span className="mono text-xs font-medium" style={{ color: 'var(--text)' }}>
                {formatCurrency(item.value)}
              </span>
              <span className="text-xs ml-2 mono" style={{ color: 'var(--text-3)' }}>
                {Math.round(item.pct)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
