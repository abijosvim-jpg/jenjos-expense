import { addTransaction, getRecurringTransactionsForMonth, Timestamp } from '../firebase';
import { formatMonthKey } from './formatters';

/**
 * Auto-generates recurring transactions for the current month
 * if they haven't been generated yet.
 */
export const applyRecurringTransactions = async (profile, recurringList, monthKey) => {
  if (!recurringList || recurringList.length === 0) return;

  const [year, month] = monthKey.split('-').map(Number);
  const existing = await getRecurringTransactionsForMonth(profile, monthKey);
  const existingRecurringIds = new Set(existing.map((t) => t.recurringId).filter(Boolean));

  const promises = [];
  for (const rule of recurringList) {
    if (!rule.active) continue;
    if (existingRecurringIds.has(rule.id)) continue;

    const day = Math.min(rule.dayOfMonth || 1, new Date(year, month, 0).getDate());
    const date = new Date(year, month - 1, day);

    promises.push(
      addTransaction({
        profile,
        amount: rule.amount,
        type: rule.type,
        category: rule.category,
        note: rule.note || '',
        date: Timestamp.fromDate(date),
        month: monthKey,
        isRecurring: true,
        recurringId: rule.id,
      })
    );
  }

  await Promise.all(promises);
};

export const getNextMonthKey = (monthKey) => {
  const [year, month] = monthKey.split('-').map(Number);
  if (month === 12) return formatMonthKey(year + 1, 0);
  return formatMonthKey(year, month);
};

export const getPrevMonthKey = (monthKey) => {
  const [year, month] = monthKey.split('-').map(Number);
  if (month === 1) return formatMonthKey(year - 1, 11);
  return formatMonthKey(year, month - 2);
};
