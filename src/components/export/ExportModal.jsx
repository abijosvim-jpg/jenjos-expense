import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Table } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal, Button, Select } from '../ui';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';
import { getMonthFullLabel, formatMonthKey } from '../../utils/formatters';

export const ExportModal = ({ isOpen, onClose, transactions, profile, currentMonthKey }) => {
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);
  const [exporting, setExporting] = useState(null);

  const now = new Date();
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = formatMonthKey(d.getFullYear(), d.getMonth());
    return {
      key,
      label: `${getMonthFullLabel(d.getMonth())} ${d.getFullYear()}`,
    };
  });

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const filtered = transactions.filter((t) => t.month === selectedMonth);
      if (filtered.length === 0) {
        toast.error('No transactions for this month');
        return;
      }
      if (format === 'csv') {
        exportToCSV(filtered, profile, selectedMonth);
        toast.success('CSV downloaded!');
      } else {
        exportToPDF(filtered, profile, selectedMonth);
        toast.success('PDF downloaded!');
      }
      onClose();
    } catch (err) {
      toast.error('Export failed');
      console.error(err);
    } finally {
      setExporting(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📥 Export Transactions">
      <div className="flex flex-col gap-5">
        <Select
          label="Select Month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {monthOptions.map((m) => (
            <option key={m.key} value={m.key}>{m.label}</option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleExport('csv')}
            disabled={!!exporting}
            className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-dashed border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all disabled:opacity-50"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <Table size={22} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">CSV</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Spreadsheet format</p>
            </div>
          </button>

          <button
            onClick={() => handleExport('pdf')}
            disabled={!!exporting}
            className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-dashed border-rose-200 dark:border-rose-800 hover:border-rose-400 dark:hover:border-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all disabled:opacity-50"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
              <FileText size={22} className="text-rose-600 dark:text-rose-400" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">PDF</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Formatted report</p>
            </div>
          </button>
        </div>

        {exporting && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 animate-pulse">
            Generating {exporting.toUpperCase()}...
          </p>
        )}
      </div>
    </Modal>
  );
};
