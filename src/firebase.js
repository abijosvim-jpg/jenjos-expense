import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  setDoc,
  getDoc,
  getDocs,
  serverTimestamp as _serverTimestamp,
  Timestamp as _Timestamp,
} from 'firebase/firestore';

// ── Config ────────────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = () =>
  !!(firebaseConfig.apiKey && firebaseConfig.projectId);

let app, db;
if (isFirebaseConfigured()) {
  app = initializeApp(firebaseConfig);
  db  = getFirestore(app);
}

export { db };

// Re-export Timestamp so components don't import from firebase/firestore directly
export const Timestamp       = _Timestamp;
export const serverTimestamp = _serverTimestamp;

// ── Transactions ──────────────────────────────────────────────────────────────

const sortByDate = (docs) =>
  docs.sort((a, b) => {
    const da = a.date?.seconds ?? 0;
    const db_ = b.date?.seconds ?? 0;
    return db_ - da;
  });

export const subscribeToTransactions = (profile, monthKey, callback) => {
  const q = query(
    collection(db, 'transactions'),
    where('profile', '==', profile),
    where('month',   '==', monthKey)
  );
  return onSnapshot(q, snap => callback(sortByDate(snap.docs.map(d => ({ id: d.id, ...d.data() })))));
};

export const subscribeToAllTransactions = (monthKey, callback) => {
  const q = query(
    collection(db, 'transactions'),
    where('month', '==', monthKey)
  );
  return onSnapshot(q, snap => callback(sortByDate(snap.docs.map(d => ({ id: d.id, ...d.data() })))));
};

export const addTransaction = (data) =>
  addDoc(collection(db, 'transactions'), { ...data, createdAt: _serverTimestamp() });

export const updateTransaction = (id, data) =>
  updateDoc(doc(db, 'transactions', id), data);

export const deleteTransaction = (id) =>
  deleteDoc(doc(db, 'transactions', id));

// ── Recurring ─────────────────────────────────────────────────────────────────

export const subscribeToRecurring = (profile, callback) => {
  const q = query(collection(db, 'recurring'), where('profile', '==', profile));
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
};

export const addRecurring    = (data) => addDoc(collection(db, 'recurring'), { ...data, createdAt: _serverTimestamp() });
export const updateRecurring = (id, data) => updateDoc(doc(db, 'recurring', id), data);
export const deleteRecurring = (id)       => deleteDoc(doc(db, 'recurring', id));

export const getRecurringTransactionsForMonth = async (profile, monthKey) => {
  const q = query(
    collection(db, 'transactions'),
    where('profile',     '==', profile),
    where('month',       '==', monthKey),
    where('isRecurring', '==', true)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ── Budget ────────────────────────────────────────────────────────────────────

export const getBudget = async (profile, monthKey) => {
  const snap = await getDoc(doc(db, 'budgets', `${profile}_${monthKey}`));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const setBudget = (profile, monthKey, data) =>
  setDoc(doc(db, 'budgets', `${profile}_${monthKey}`), { profile, month: monthKey, ...data }, { merge: true });

export const subscribeToBudget = (profile, monthKey, callback) => {
  return onSnapshot(doc(db, 'budgets', `${profile}_${monthKey}`), snap =>
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  );
};

// ── Savings ───────────────────────────────────────────────────────────────────

export const subscribeToSavings  = (profile, callback) => {
  const q = query(collection(db, 'savings'), where('profile', '==', profile));
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
};

export const addSavingsGoal    = (data) => addDoc(collection(db, 'savings'), { ...data, createdAt: _serverTimestamp() });
export const updateSavingsGoal = (id, data) => updateDoc(doc(db, 'savings', id), data);
export const deleteSavingsGoal = (id)       => deleteDoc(doc(db, 'savings', id));

// ── JSON backup helpers (kept for convenience) ───────────────────────────────

export const exportAllData = async () => {
  const cols = ['transactions', 'recurring', 'budgets', 'savings'];
  const result = {};
  for (const col of cols) {
    const snap = await getDocs(collection(db, col));
    result[col] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `JENJOS_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
