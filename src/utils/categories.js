export const EXPENSE_CATEGORIES = [
  { id: 'food',            label: 'Food' },
  { id: 'travel',          label: 'Travel' },
  { id: 'mobile_recharge', label: 'Mobile Recharge' },
  { id: 'wifi',            label: 'WiFi' },
  { id: 'outing',          label: 'Outing' },
  { id: 'lending',         label: 'Lending' },
  { id: 'medical',         label: 'Medical' },
  { id: 'education',       label: 'Education' },
  { id: 'shopping',        label: 'Shopping' },
  { id: 'cosmetics',       label: 'Cosmetics' },
  { id: 'others',          label: 'Others' },
];

export const INCOME_CATEGORIES = [
  { id: 'salary',     label: 'Salary' },
  { id: 'freelance',  label: 'Freelance' },
  { id: 'business',   label: 'Business' },
  { id: 'investment', label: 'Investment' },
  { id: 'gift',       label: 'Gift' },
  { id: 'refund',     label: 'Refund' },
  { id: 'others',     label: 'Others' },
];

export const getCategoryById = (id, type = 'expense') => {
  const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return list.find(c => c.id === id) || { id, label: id };
};
