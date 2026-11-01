import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trash2, Pencil, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { subscribeToMemories, addMemory, updateMemory, deleteMemory, Timestamp } from '../firebase';

const TAGS = [
  { id: 'love',        label: 'Love',        emoji: '💕' },
  { id: 'celebration', label: 'Celebration', emoji: '🎉' },
  { id: 'travel',      label: 'Travel',      emoji: '✈️' },
  { id: 'home',        label: 'Home',        emoji: '🏠' },
  { id: 'birthday',    label: 'Birthday',    emoji: '🎂' },
  { id: 'milestone',   label: 'Milestone',   emoji: '🌟' },
  { id: 'food',        label: 'Food',        emoji: '🍽️' },
  { id: 'gift',        label: 'Gift',        emoji: '🎁' },
  { id: 'other',       label: 'Other',       emoji: '✨' },
];

const PROFILES = {
  jency:  { name: 'Jency',  photo: '/abijos.jpg' },
  abijos: { name: 'Abijos', photo: '/jency.jpg'  },
};

const getTag = (id) => TAGS.find(t => t.id === id) || TAGS[TAGS.length - 1];

// ── Memory Form Modal ─────────────────────────────────────────────────────────
const MemoryForm = ({ isOpen, onClose, editData, activeProfile }) => {
  const [form, setForm] = useState({
    title: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), tag: 'love',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || '',
        description: editData.description || '',
        date: editData.date?.seconds
          ? format(new Date(editData.date.seconds * 1000), 'yyyy-MM-dd')
          : format(new Date(), 'yyyy-MM-dd'),
        tag: editData.tag || 'love',
      });
    } else {
      setForm({ title: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), tag: 'love' });
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Add a title'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        date: Timestamp.fromDate(new Date(form.date)),
        addedBy: activeProfile,
      };
      if (editData) await updateMemory(editData.id, payload);
      else await addMemory(payload);
      toast.success(editData ? 'Memory updated ✨' : 'Memory saved 💕');
      onClose();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.85)' }} onClick={onClose} />
          <motion.div
            initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-sm"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px' }}
          >
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                {editData ? 'Edit Memory' : 'Add a Moment'}
              </p>
              <button onClick={onClose} className="p-1.5 rounded" style={{ color: 'var(--text-3)' }}>
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              {/* Tag picker */}
              <div>
                <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--text-3)', fontFamily: 'monospace' }}>Tag</p>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map(t => (
                    <button key={t.id} type="button" onClick={() => set('tag', t.id)}
                      className="px-2.5 py-1 rounded text-xs transition-all"
                      style={{
                        background: form.tag === t.id ? 'var(--surface2)' : 'transparent',
                        border: `1px solid ${form.tag === t.id ? 'var(--border2)' : 'var(--border)'}`,
                        color: form.tag === t.id ? 'var(--text)' : 'var(--text-3)',
                      }}>
                      {t.emoji} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <p className="text-xs font-medium uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-3)', fontFamily: 'monospace' }}>Title</p>
                <input required value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder="What's the moment?" className="field" autoFocus />
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-medium uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-3)', fontFamily: 'monospace' }}>Description</p>
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="Describe the moment..." rows={3}
                  className="field resize-none" style={{ lineHeight: '1.6' }} />
              </div>

              {/* Date */}
              <div>
                <p className="text-xs font-medium uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-3)', fontFamily: 'monospace' }}>Date</p>
                <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="field mono" />
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={onClose} className="btn btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary flex-1">
                  {saving ? 'Saving…' : editData ? 'Update' : 'Add Memory'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ── Memories Page ─────────────────────────────────────────────────────────────
export const MemoriesPage = ({ onBack, activeProfile }) => {
  const [memories, setMemories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  useEffect(() => {
    const unsub = subscribeToMemories(setMemories);
    return unsub;
  }, []);

  const openAdd  = () => { setEditData(null); setShowForm(true); };
  const openEdit = (m) => { setEditData(m); setShowForm(true); };
  const handleDelete = async (id) => {
    try { await deleteMemory(id); toast.success('Deleted'); setConfirmDel(null); }
    catch { toast.error('Failed'); }
  };

  // Group memories by year
  const byYear = memories.reduce((acc, m) => {
    const yr = m.date?.seconds ? new Date(m.date.seconds * 1000).getFullYear() : 'Unknown';
    if (!acc[yr]) acc[yr] = [];
    acc[yr].push(m);
    return acc;
  }, {});

  const years = Object.keys(byYear).sort((a, b) => b - a);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1.5 rounded transition-colors" style={{ color: 'var(--text-3)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
              <ArrowLeft size={16} strokeWidth={1.8} />
            </button>
            <div>
              <span className="font-bold text-sm tracking-tight" style={{ color: 'var(--text)' }}>Our Moments</span>
              <span className="text-xs ml-2 mono" style={{ color: 'var(--text-3)' }}>{memories.length} memories</span>
            </div>
          </div>
          <button onClick={openAdd} className="btn btn-primary text-xs flex items-center gap-1.5">
            <Plus size={13} strokeWidth={2} /> Add
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 pb-24">
        {memories.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">💕</p>
            <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>No memories yet</p>
            <p className="text-xs mb-6" style={{ color: 'var(--text-3)' }}>Start adding your special moments together</p>
            <button onClick={openAdd} className="btn btn-primary">Add First Memory</button>
          </div>
        ) : (
          <div>
            {years.map(year => (
              <div key={year} className="mb-10">
                {/* Year label */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="mono text-xs font-semibold" style={{ color: 'var(--text-3)' }}>{year}</span>
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                </div>

                {/* Timeline */}
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-3 top-0 bottom-0 w-px" style={{ background: 'var(--border)' }} />

                  <div className="flex flex-col gap-6">
                    {byYear[year].map((mem, i) => {
                      const tag   = getTag(mem.tag);
                      const added = PROFILES[mem.addedBy];
                      const date  = mem.date?.seconds
                        ? format(new Date(mem.date.seconds * 1000), 'dd MMM')
                        : '';

                      return (
                        <motion.div
                          key={mem.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="group relative pl-10"
                        >
                          {/* Dot on line */}
                          <div className="absolute left-0 top-4 w-6 h-6 flex items-center justify-center text-sm"
                            style={{ background: 'var(--bg)', zIndex: 1 }}>
                            {tag.emoji}
                          </div>

                          {/* Card */}
                          <div className="p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px' }}>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm leading-tight" style={{ color: 'var(--text)' }}>
                                  {mem.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="mono text-xs" style={{ color: 'var(--text-3)' }}>{date}</span>
                                  <span style={{ color: 'var(--border2)', fontSize: '10px' }}>·</span>
                                  <span className="text-xs px-1.5 py-0.5" style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '3px', color: 'var(--text-3)' }}>
                                    {tag.emoji} {tag.label}
                                  </span>
                                  {added && (
                                    <>
                                      <span style={{ color: 'var(--border2)', fontSize: '10px' }}>·</span>
                                      <div className="flex items-center gap-1">
                                        <div className="w-3.5 h-3.5 overflow-hidden rounded-sm flex-shrink-0" style={{ border: '1px solid var(--border)' }}>
                                          <img src={added.photo} alt={added.name} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="text-xs" style={{ color: 'var(--text-3)' }}>{added.name}</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <button onClick={() => openEdit(mem)} className="p-1.5 rounded" style={{ color: 'var(--text-3)' }}
                                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                                  <Pencil size={12} />
                                </button>
                                <button onClick={() => setConfirmDel(mem.id)} className="p-1.5 rounded" style={{ color: 'var(--text-3)' }}
                                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>

                            {mem.description && (
                              <p className="text-xs leading-relaxed mt-2" style={{ color: 'var(--text-2)' }}>
                                {mem.description}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <MemoryForm isOpen={showForm} onClose={() => setShowForm(false)} editData={editData} activeProfile={activeProfile} />

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.8)' }} onClick={() => setConfirmDel(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative p-6 w-full max-w-xs"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px' }}>
              <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>Delete memory?</p>
              <p className="text-xs mb-5" style={{ color: 'var(--text-3)' }}>This cannot be undone.</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDel(null)} className="btn btn-ghost flex-1">Cancel</button>
                <button onClick={() => handleDelete(confirmDel)} className="btn btn-primary flex-1">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
