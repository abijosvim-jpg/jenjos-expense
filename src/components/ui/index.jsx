import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Modal ─────────────────────────────────────────────────────────────────── */
export const Modal = ({ isOpen, onClose, title, subtitle, children }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={onClose}
        />
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-md max-h-[90vh] flex flex-col"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px' }}
        >
          <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{title}</p>
              {subtitle && <p className="text-xs mono mt-0.5" style={{ color: 'var(--text-3)' }}>{subtitle}</p>}
            </div>
            <button onClick={onClose} className="p-1.5 rounded transition-colors" style={{ color: 'var(--text-3)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
            >
              <X size={14} />
            </button>
          </div>
          <div className="overflow-y-auto p-5 flex-1">{children}</div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

/* ── Button ────────────────────────────────────────────────────────────────── */
export const Button = ({ children, variant = 'ghost', onClick, disabled, type = 'button', className = '' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`btn ${variant === 'primary' ? 'btn-primary' : 'btn-ghost'} ${className}`}
    style={disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
  >
    {children}
  </button>
);

/* ── Input ─────────────────────────────────────────────────────────────────── */
export const Input = ({ label, type = 'text', value, onChange, placeholder, min, step, required }) => (
  <div>
    {label && (
      <label className="block text-xs font-medium uppercase tracking-widest mb-1.5"
        style={{ color: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace' }}>
        {label}
      </label>
    )}
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      min={min} step={step} required={required}
      className={`field ${type === 'number' ? 'mono' : ''}`}
    />
  </div>
);

/* ── Select ────────────────────────────────────────────────────────────────── */
export const Select = ({ label, value, onChange, options = [] }) => (
  <div>
    {label && (
      <label className="block text-xs font-medium uppercase tracking-widest mb-1.5"
        style={{ color: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace' }}>
        {label}
      </label>
    )}
    <select value={value} onChange={onChange} className="field">
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

/* ── Badge ─────────────────────────────────────────────────────────────────── */
export const Badge = ({ children, variant = 'default' }) => (
  <span
    className="pill"
    style={
      variant === 'up'
        ? { background: 'rgba(255,255,255,0.06)', color: 'var(--text)', border: '1px solid var(--border2)' }
        : { background: 'transparent', color: 'var(--text-3)', border: '1px solid var(--border)' }
    }
  >
    {children}
  </span>
);

/* ── Section Header ────────────────────────────────────────────────────────── */
export const SectionHeader = ({ title, action }) => (
  <div className="flex items-center justify-between mb-3">
    <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace' }}>
      {title}
    </h2>
    {action}
  </div>
);
