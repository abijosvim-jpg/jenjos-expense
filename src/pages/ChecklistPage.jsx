import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Trash2, Check, X } from 'lucide-react';
import { format, addDays, subDays, isToday } from 'date-fns';
import toast from 'react-hot-toast';
import {
  subscribeToHabits, addHabit, deleteHabit,
  subscribeToChecklistRecord, setChecklistRecord,
} from '../firebase';

// ── Default habits seeded on first load ──────────────────────────────────────
const DEFAULT_HABITS = [
  { label: 'Proper Diet',              emoji: '🥗', order: 0 },
  { label: 'No Alkale',                emoji: '🚫', order: 1 },
  { label: 'Daily Scripture Reading',  emoji: '📖', order: 2 },
  { label: 'Daily Prayer',             emoji: '🙏', order: 3 },
  { label: 'No Junk',                  emoji: '🍔', order: 4 },
  { label: 'Exercise',                 emoji: '🏃', order: 5 },
];

const PROFILES = {
  jency:  { name: 'Jency',  photo: '/abijos.jpg' },
  abijos: { name: 'Abijos', photo: '/jency.jpg'  },
};

// ── Streak dots (last 7 days) ─────────────────────────────────────────────────
const StreakDots = ({ profile, habits, selectedDate }) => {
  const [weekChecks, setWeekChecks] = useState({});

  useEffect(() => {
    const unsubs = [];
    for (let i = 6; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const unsub = subscribeToChecklistRecord(d, profile, (rec) => {
        setWeekChecks(prev => ({ ...prev, [d]: rec.checks || {} }));
      });
      unsubs.push(unsub);
    }
    return () => unsubs.forEach(u => u());
  }, [profile]);

  const total = habits.length;

  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: 7 }).map((_, i) => {
        const d    = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
        const done = Object.values(weekChecks[d] || {}).filter(Boolean).length;
        const full = total > 0 && done === total;
        const partial = done > 0 && done < total;
        return (
          <div key={d} title={`${done}/${total} on ${d}`}
            className="w-2 h-2 rounded-full transition-all"
            style={{
              background: full ? 'var(--text)' : partial ? 'var(--text-3)' : 'var(--border)',
            }} />
        );
      })}
    </div>
  );
};

// ── Single profile column ─────────────────────────────────────────────────────
const ProfileColumn = ({ profile, habits, dateStr, isToday: todayFlag }) => {
  const [checks, setChecks]     = useState({});
  const [saving, setSaving]     = useState({});
  const info = PROFILES[profile];

  useEffect(() => {
    const unsub = subscribeToChecklistRecord(dateStr, profile, rec => setChecks(rec.checks || {}));
    return unsub;
  }, [dateStr, profile]);

  const toggle = useCallback(async (habitId) => {
    const next = { ...checks, [habitId]: !checks[habitId] };
    setChecks(next);
    setSaving(s => ({ ...s, [habitId]: true }));
    try {
      await setChecklistRecord(dateStr, profile, next);
    } catch {
      setChecks(checks); // revert
      toast.error('Failed to save');
    }
    setSaving(s => ({ ...s, [habitId]: false }));
  }, [checks, dateStr, profile]);

  const done  = habits.filter(h => checks[h.id]).length;
  const total = habits.length;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex-1 min-w-0">
      {/* Profile header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded overflow-hidden flex-shrink-0" style={{ border: '1px solid var(--border)' }}>
          <img src={info.photo} alt={info.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{info.name}</p>
          <StreakDots profile={profile} habits={habits} />
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-sm mono" style={{ color: done === total && total > 0 ? 'var(--text)' : 'var(--text-3)' }}>
            {done}/{total}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 mb-4 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: 'var(--text)' }}
        />
      </div>

      {/* Habit rows */}
      <div className="flex flex-col gap-2">
        {habits.map(habit => {
          const checked = !!checks[habit.id];
          return (
            <motion.button
              key={habit.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => toggle(habit.id)}
              disabled={!todayFlag}
              className="flex items-center gap-3 p-3 text-left w-full rounded transition-all"
              style={{
                background: checked ? 'var(--surface2)' : 'var(--surface)',
                border: `1px solid ${checked ? 'var(--border2)' : 'var(--border)'}`,
                opacity: !todayFlag ? 0.7 : 1,
                cursor: todayFlag ? 'pointer' : 'default',
              }}
            >
              {/* Checkbox */}
              <div className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-all"
                style={{
                  background: checked ? 'var(--text)' : 'transparent',
                  border: `1.5px solid ${checked ? 'var(--text)' : 'var(--border2)'}`,
                }}>
                {checked && <Check size={11} strokeWidth={3} style={{ color: 'var(--bg)' }} />}
              </div>

              <span className="text-sm leading-tight"
                style={{
                  color: checked ? 'var(--text-2)' : 'var(--text)',
                  textDecoration: checked ? 'line-through' : 'none',
                }}>
                {habit.emoji} {habit.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {done === total && total > 0 && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-xs mt-4"
          style={{ color: 'var(--text-3)' }}
        >
          ✨ All done for today!
        </motion.p>
      )}
    </div>
  );
};

// ── Add Habit Modal ───────────────────────────────────────────────────────────
const AddHabitModal = ({ isOpen, onClose, nextOrder }) => {
  const [label, setLabel] = useState('');
  const [emoji, setEmoji] = useState('✅');
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!label.trim()) return;
    setSaving(true);
    try {
      await addHabit({ label: label.trim(), emoji, order: nextOrder });
      toast.success('Habit added!');
      setLabel(''); setEmoji('✅');
      onClose();
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.85)' }} onClick={onClose} />
          <motion.div
            initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }}
            className="relative w-full max-w-xs p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px' }}
          >
            <div className="flex justify-between items-center mb-4">
              <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Add Habit</p>
              <button onClick={onClose} className="p-1" style={{ color: 'var(--text-3)' }}><X size={14} /></button>
            </div>
            <form onSubmit={handleAdd} className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="😊"
                  className="field text-center" style={{ width: '60px', flexShrink: 0 }} maxLength={2} />
                <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Habit name"
                  className="field flex-1" autoFocus required />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="btn btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary flex-1">
                  {saving ? 'Adding…' : 'Add'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ── Checklist Page ────────────────────────────────────────────────────────────
export const ChecklistPage = ({ onBack }) => {
  const [habits,      setHabits]      = useState([]);
  const [date,        setDate]        = useState(new Date());
  const [seeded,      setSeeded]      = useState(false);
  const [showAdd,     setShowAdd]     = useState(false);
  const [confirmDel,  setConfirmDel]  = useState(null);

  const dateStr   = format(date, 'yyyy-MM-dd');
  const todayFlag = isToday(date);

  // Load habits; seed defaults if empty
  useEffect(() => {
    const unsub = subscribeToHabits(async (docs) => {
      if (docs.length === 0 && !seeded) {
        setSeeded(true);
        for (const h of DEFAULT_HABITS) await addHabit(h);
      } else {
        setHabits(docs);
      }
    });
    return unsub;
  }, [seeded]);

  const handleDelete = async (id) => {
    try { await deleteHabit(id); toast.success('Habit removed'); setConfirmDel(null); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1.5 transition-colors" style={{ color: 'var(--text-3)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
              <ArrowLeft size={16} strokeWidth={1.8} />
            </button>
            <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>Daily Checklist</span>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn btn-primary text-xs flex items-center gap-1.5">
            <Plus size={13} /> Add Habit
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Date navigator */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setDate(d => subDays(d, 1))} className="p-2 rounded transition-colors"
            style={{ color: 'var(--text-3)', border: '1px solid var(--border)' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            <ChevronLeft size={15} />
          </button>

          <div className="text-center">
            <p className="font-bold text-base" style={{ color: 'var(--text)' }}>
              {format(date, 'EEEE')}
            </p>
            <p className="mono text-xs" style={{ color: 'var(--text-3)' }}>
              {format(date, 'dd MMM yyyy')}
              {todayFlag && <span className="ml-2 px-1.5 py-0.5 rounded"
                style={{ background: 'var(--surface2)', border: '1px solid var(--border)', fontSize: '10px' }}>Today</span>}
            </p>
          </div>

          <button onClick={() => setDate(d => addDays(d, 1))} disabled={todayFlag}
            className="p-2 rounded transition-colors"
            style={{
              color: todayFlag ? 'var(--border2)' : 'var(--text-3)',
              border: `1px solid ${todayFlag ? 'var(--border)' : 'var(--border)'}`,
              cursor: todayFlag ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => { if (!todayFlag) e.currentTarget.style.borderColor = 'var(--border2)'; }}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            <ChevronRight size={15} />
          </button>
        </div>

        {!todayFlag && (
          <p className="text-center text-xs mb-5 mono" style={{ color: 'var(--text-3)' }}>
            Viewing past record — read only
          </p>
        )}

        {/* Side-by-side columns */}
        <div className="flex gap-4">
          <ProfileColumn profile="jency"  habits={habits} dateStr={dateStr} isToday={todayFlag} />
          <div className="w-px self-stretch" style={{ background: 'var(--border)' }} />
          <ProfileColumn profile="abijos" habits={habits} dateStr={dateStr} isToday={todayFlag} />
        </div>

        {/* Manage habits */}
        {habits.length > 0 && (
          <div className="mt-10">
            <p className="mono text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>Manage Habits</p>
            <div className="flex flex-col gap-2">
              {habits.map(h => (
                <div key={h.id} className="flex items-center justify-between px-3 py-2.5 rounded"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <span className="text-sm" style={{ color: 'var(--text)' }}>{h.emoji} {h.label}</span>
                  <button onClick={() => setConfirmDel(h.id)} className="p-1 transition-colors" style={{ color: 'var(--text-3)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <AddHabitModal isOpen={showAdd} onClose={() => setShowAdd(false)} nextOrder={habits.length} />

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.8)' }} onClick={() => setConfirmDel(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative p-6 w-full max-w-xs"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px' }}>
              <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>Remove habit?</p>
              <p className="text-xs mb-5" style={{ color: 'var(--text-3)' }}>Past records won't be affected.</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDel(null)} className="btn btn-ghost flex-1">Cancel</button>
                <button onClick={() => handleDelete(confirmDel)} className="btn btn-primary flex-1">Remove</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
