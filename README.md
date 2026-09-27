# JENJOS 💜 — Shared Monthly Expense Tracker

> A beautiful expense tracker for **Jency & Abijos** — built with React + Tailwind CSS.  
> **No backend, no signup, no internet required.** All data stored locally in your browser.

---

## ✨ Features

| Feature | Description |
|---|---|
| 👤 Profile Switcher | Select Jency or Abijos — no login/password needed |
| 💰 Balance Dashboard | Auto-calculated income − expenses per month |
| 📅 Month Selector | Jan–Dec tabs with year navigation |
| 💸 Add Transactions | Expense & income with category, note, date |
| 📊 Category Charts | Recharts pie chart showing spending breakdown |
| 📋 Budget Planner | Plan income + category budgets for any future month |
| 📈 Budget vs Actual | Planned vs actual with color-coded progress bars |
| 🎯 Savings Goals | Set goals, track progress with animated bars |
| 🔁 Recurring Transactions | Auto-add rent, subscriptions, salary each month |
| 👫 Combined "Both" View | Household totals + side-by-side comparison chart |
| 📥 Export CSV / PDF | Download monthly reports |
| 💾 JSON Backup | Export / import all data as a `.json` file |
| 🔍 Search & Filter | Filter by type, category, keyword |
| 🌙 Dark / Light Mode | Preference saved across sessions |
| 📴 Works Offline | No internet required — all data in localStorage |

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Start the app

```bash
npm run dev
# Opens at http://localhost:5173
```

That's it! No Firebase, no `.env` file, no accounts. Just open and use. 🎉

---

## 💾 Your Data

All data is stored in your **browser's localStorage** as JSON — it persists across sessions automatically.

### Backup & Restore
- **⬇ Download icon** in the navbar → exports all data as `JENJOS_backup_YYYY-MM-DD.json`  
- **⬆ Upload icon** in the navbar → restores from a backup JSON file

> **Tip:** Do a backup before clearing your browser data, or to move data between devices.

---

## 📦 Project Structure

```
src/
├── firebase.js              # localStorage engine (same API, zero Firebase)
├── contexts/AppContext.jsx  # Profile, month, dark mode state
├── pages/
│   ├── ProfileSelect.jsx    # Animated profile switcher
│   └── Dashboard.jsx        # Main dashboard with all tabs
├── components/
│   ├── layout/              # Navbar (with backup), BottomNav
│   ├── dashboard/           # BalanceCard, MonthSelector, TransactionForm,
│   │                        # TransactionList, CategoryChart, MonthlySummary
│   ├── budget/              # BudgetPlanner, BudgetVsActual
│   ├── savings/             # SavingsGoals
│   ├── recurring/           # RecurringManager
│   ├── combined/            # BothView
│   └── export/              # ExportModal (CSV + PDF)
└── utils/
    ├── categories.js        # Category icons + colors
    ├── formatters.js        # ₹ currency + date utils
    ├── exportUtils.js       # CSV + jsPDF export
    └── recurringUtils.js    # Auto-apply recurring transactions
```

---

## 🏗️ Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Tailwind CSS 3 | Styling + dark mode |
| Vite 8 | Build tool |
| Recharts | Charts |
| Framer Motion | Animations |
| jsPDF | PDF export |
| date-fns | Date utilities |
| Lucide React | Icons |
| react-hot-toast | Notifications |
| **localStorage** | **All data storage — no backend** |

---

## 🌐 Deploy to Vercel

```bash
git init && git add . && git commit -m "JENJOS initial"
# Push to GitHub, import on vercel.com → deploy!
```

> No environment variables needed. Zero config. Just deploy.

---

## 🛠️ Dev Commands

```bash
npm run dev      # Start dev server → http://localhost:5173
npm run build    # Production build → dist/
npm run preview  # Preview production build
```

---

## 💜 Made with love for Jency & Abijos
