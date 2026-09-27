import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { TransactionForm } from './TransactionForm';

export const QuickActions = ({ profile, monthKey }) => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(null);

  const start = (t) => { setType(t); setOpen(true); };
  const close = () => { setOpen(false); setType(null); };

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => start('expense')}
          className="btn btn-ghost text-xs flex-1"
        >
          <Plus size={13} strokeWidth={2} />
          Add Expense
        </button>
        <button
          onClick={() => start('income')}
          className="btn btn-primary text-xs flex-1"
        >
          <Plus size={13} strokeWidth={2} />
          Add Income
        </button>
      </div>

      {open && type && (
        <TransactionForm
          isOpen={open}
          onClose={close}
          type={type}
          profile={profile}
          monthKey={monthKey}
        />
      )}
    </>
  );
};
