import React, { createContext, useContext, useState, useEffect } from 'react';
import { formatMonthKey } from '../utils/formatters';

const AppContext = createContext(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const AppProvider = ({ children }) => {
  const [activeProfile, setActiveProfile] = useState(() => {
    return localStorage.getItem('jenjos_profile') || null;
  });

  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('jenjos_dark');
    return stored !== null ? stored === 'true' : true; // default dark
  });

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const stored = localStorage.getItem('jenjos_month');
    return stored || formatMonthKey(now.getFullYear(), now.getMonth());
  });

  const [selectedYear, setSelectedYear] = useState(() => {
    const stored = localStorage.getItem('jenjos_year');
    return stored ? parseInt(stored) : now.getFullYear();
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
    localStorage.setItem('jenjos_dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (activeProfile) {
      localStorage.setItem('jenjos_profile', activeProfile);
    } else {
      localStorage.removeItem('jenjos_profile');
    }
  }, [activeProfile]);

  useEffect(() => {
    localStorage.setItem('jenjos_month', selectedMonth);
  }, [selectedMonth]);

  useEffect(() => {
    localStorage.setItem('jenjos_year', selectedYear);
  }, [selectedYear]);

  const toggleDarkMode = () => setDarkMode((d) => !d);

  const selectProfile = (profile) => setActiveProfile(profile);

  const goToProfile = (profile) => setActiveProfile(profile);

  const changeMonth = (monthKey) => {
    setSelectedMonth(monthKey);
    const [y] = monthKey.split('-');
    setSelectedYear(parseInt(y));
  };

  return (
    <AppContext.Provider
      value={{
        activeProfile,
        selectProfile,
        goToProfile,
        darkMode,
        toggleDarkMode,
        selectedMonth,
        selectedYear,
        changeMonth,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
