import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { formatMonthKey } from '../../utils/formatters';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const MonthSelector = () => {
  const { selectedMonth, selectedYear, changeMonth } = useApp();
  const [y, m] = selectedMonth.split('-').map(Number);
  const now = new Date();

  const changeYear = (delta) => changeMonth(formatMonthKey(selectedYear + delta, m - 1));
  const selectMonth = (idx) => changeMonth(formatMonthKey(selectedYear, idx));

  return (
    <div
      className="flex items-center gap-1"
      style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0' }}
    >
      {/* Year */}
      <div className="flex items-center gap-1 pr-3 mr-1" style={{ borderRight: '1px solid var(--border)' }}>
        <button
          onClick={() => changeYear(-1)}
          className="p-1 rounded transition-colors"
          style={{ color: 'var(--text-3)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
        >
          <ChevronLeft size={12} />
        </button>
        <span className="mono text-xs font-medium px-1" style={{ color: 'var(--text-2)' }}>
          {selectedYear}
        </span>
        <button
          onClick={() => changeYear(1)}
          className="p-1 rounded transition-colors"
          style={{ color: 'var(--text-3)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
        >
          <ChevronRight size={12} />
        </button>
      </div>

      {/* Month tabs */}
      <div className="flex gap-0 overflow-x-auto scrollbar-hide">
        {MONTHS.map((mon, idx) => {
          const active = selectedYear === y && idx === m - 1;
          const current = now.getFullYear() === selectedYear && now.getMonth() === idx;
          return (
            <button
              key={mon}
              onClick={() => selectMonth(idx)}
              className="relative flex-shrink-0 px-3 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors"
              style={{
                color: active ? 'var(--text)' : current ? 'var(--text-2)' : 'var(--text-3)',
                borderBottom: active ? '2px solid var(--text)' : '2px solid transparent',
                marginBottom: '-1px',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {mon}
              {current && !active && (
                <span
                  className="absolute top-2 right-1"
                  style={{ width: 4, height: 4, background: 'var(--text-2)', borderRadius: '50%', display: 'inline-block' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
