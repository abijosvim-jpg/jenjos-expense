import React, { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Navbar } from '../components/layout/Navbar';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { MonthSelector } from '../components/dashboard/MonthSelector';
import { QuickActions } from '../components/dashboard/QuickActions';
import { TransactionList } from '../components/dashboard/TransactionList';
import { CategoryChart } from '../components/dashboard/CategoryChart';
import { ExportModal } from '../components/export/ExportModal';
import { subscribeToTransactions } from '../firebase';
import { Download } from 'lucide-react';
import { SectionHeader } from '../components/ui';

export const Dashboard = () => {
  const { activeProfile, selectedMonth } = useApp();
  const [transactions, setTransactions] = useState([]);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    if (!activeProfile || !selectedMonth) return;
    const unsub = subscribeToTransactions(activeProfile, selectedMonth, setTransactions);
    return unsub;
  }, [activeProfile, selectedMonth]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 pt-5 pb-10">
        <MonthSelector />

        <div className="mt-5 flex flex-col gap-5 fade-up">
          <BalanceCard transactions={transactions} />

          <QuickActions profile={activeProfile} monthKey={selectedMonth} />

          <div className="grid md:grid-cols-5 gap-5">
            <div className="md:col-span-3">
              <SectionHeader
                title="Transactions"
                action={
                  <button
                    onClick={() => setShowExport(true)}
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: 'var(--text-3)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                  >
                    <Download size={11} />
                    Export
                  </button>
                }
              />
              <TransactionList
                transactions={transactions}
                profile={activeProfile}
                monthKey={selectedMonth}
              />
            </div>

            <div className="md:col-span-2">
              <SectionHeader title="By Category" />
              <CategoryChart transactions={transactions} />
            </div>
          </div>
        </div>
      </main>

      <ExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        profile={activeProfile}
        monthKey={selectedMonth}
        transactions={transactions}
      />
    </div>
  );
};
