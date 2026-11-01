import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useApp } from './contexts/AppContext';
import { ProfileSelect } from './pages/ProfileSelect';
import { Dashboard } from './pages/Dashboard';
import { MemoriesPage } from './pages/MemoriesPage';
import { isFirebaseConfigured } from './firebase';

const FirebaseSetupBanner = () => (
  <div className="fixed inset-0 flex items-center justify-center p-6" style={{ background: '#0c0c0c' }}>
    <div className="w-full max-w-md" style={{ border: '1px solid #2a2a2a', borderRadius: '6px', background: '#141414' }}>
      <div className="p-6" style={{ borderBottom: '1px solid #2a2a2a' }}>
        <p className="font-semibold text-sm" style={{ color: '#f0f0f0' }}>Firebase Setup Required</p>
        <p className="text-xs mt-1" style={{ color: '#555' }}>Create a .env file with your Firebase credentials</p>
      </div>
      <div className="p-6 flex flex-col gap-4">
        <div className="p-4 rounded text-xs font-mono leading-relaxed" style={{ background: '#0c0c0c', border: '1px solid #222', color: '#888' }}>
          <p>VITE_FIREBASE_API_KEY=your-api-key</p>
          <p>VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com</p>
          <p>VITE_FIREBASE_PROJECT_ID=your-project-id</p>
          <p>VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com</p>
          <p>VITE_FIREBASE_MESSAGING_SENDER_ID=123456789</p>
          <p>VITE_FIREBASE_APP_ID=1:123:web:abc</p>
        </div>
      </div>
    </div>
  </div>
);

const AppContent = () => {
  const { activeProfile } = useApp();
  const [page, setPage] = useState('home'); // 'home' | 'dashboard' | 'memories'

  if (!isFirebaseConfigured()) return <FirebaseSetupBanner />;

  return (
    <AnimatePresence mode="wait">
      {page === 'memories' ? (
        <motion.div key="memories" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
          <MemoriesPage onBack={() => setPage('home')} activeProfile={activeProfile} />
        </motion.div>
      ) : !activeProfile ? (
        <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <ProfileSelect onOpenMemories={() => setPage('memories')} />
        </motion.div>
      ) : (
        <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Dashboard onOpenMemories={() => setPage('memories')} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1c1c1c',
            color: '#f0f0f0',
            border: '1px solid #2a2a2a',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: 600,
          },
        }}
      />
    </AppProvider>
  );
}

export default App;
