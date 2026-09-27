import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Sun, Moon, LogOut, Download } from 'lucide-react';
import { exportAllData } from '../../firebase';
import toast from 'react-hot-toast';

const PROFILES = {
  jency:  { name: 'Jency',  photo: '/abijos.jpg' },
  abijos: { name: 'Abijos', photo: '/jency.jpg' },
};

export const Navbar = () => {
  const { activeProfile, darkMode, toggleDarkMode, goToProfile } = useApp();
  const profile = PROFILES[activeProfile];

  const handleExportJSON = () => { exportAllData(); toast.success('Backup exported'); };

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
        {/* Left: wordmark + profile */}
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm tracking-tight" style={{ color: 'var(--text)' }}>
            JENJOS
          </span>
          <span style={{ color: 'var(--border2)', fontSize: '12px' }}>/</span>
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 overflow-hidden flex-shrink-0"
              style={{ border: '1px solid var(--border2)', borderRadius: '3px' }}
            >
              <img
                src={profile?.photo}
                alt={profile?.name}
                className="w-full h-full object-cover"
                style={{ filter: 'grayscale(30%)' }}
              />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>
              {profile?.name}
            </span>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleExportJSON}
            title="Export backup"
            className="p-2 rounded transition-colors"
            style={{ color: 'var(--text-3)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
          >
            <Download size={14} strokeWidth={1.8} />
          </button>

          <button
            onClick={toggleDarkMode}
            title="Toggle theme"
            className="p-2 rounded transition-colors"
            style={{ color: 'var(--text-3)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
          >
            {darkMode ? <Sun size={14} strokeWidth={1.8} /> : <Moon size={14} strokeWidth={1.8} />}
          </button>

          <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 4px' }} />

          <button
            onClick={() => goToProfile(null)}
            title="Switch profile"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors"
            style={{ color: 'var(--text-3)', border: '1px solid var(--border)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <LogOut size={12} strokeWidth={1.8} />
            Switch
          </button>
        </div>
      </div>
    </header>
  );
};
