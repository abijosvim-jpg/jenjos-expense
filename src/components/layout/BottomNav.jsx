import React from 'react';
import { LayoutDashboard } from 'lucide-react';

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
];

export const BottomNav = ({ activeTab, onTabChange }) => {
  return null; // Single tab — no nav bar needed
};
