import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';

const PROFILES = [
  { id: 'jency',  name: 'Jency',  photo: '/abijos.jpg' },
  { id: 'abijos', name: 'Abijos', photo: '/jency.jpg' },
];

/* ── Ink bleed / watercolor animation ───────────────────────────────────── */
const InkTitle = () => (
  <div style={{ textAlign: 'center', lineHeight: 1 }}>
    <style>{`
      @keyframes inkBleed {
        0% {
          filter: blur(28px);
          letter-spacing: 0.5em;
          opacity: 0;
          text-shadow:
            0 0 80px rgba(255,255,255,0.6),
            0 0 160px rgba(255,255,255,0.3);
        }
        35% {
          filter: blur(12px);
          letter-spacing: 0.15em;
          opacity: 0.75;
          text-shadow:
            0 0 40px rgba(255,255,255,0.5),
            0 0 80px rgba(255,255,255,0.2);
        }
        70% {
          filter: blur(3px);
          letter-spacing: 0.02em;
          opacity: 0.9;
          text-shadow:
            0 0 20px rgba(255,255,255,0.3),
            0 0 40px rgba(255,255,255,0.1);
        }
        100% {
          filter: blur(0px);
          letter-spacing: -0.01em;
          opacity: 1;
          text-shadow:
            0 0 30px rgba(255,255,255,0.12),
            0 0 60px rgba(255,255,255,0.06);
        }
      }

      @keyframes inkPulse {
        0%, 100% {
          text-shadow:
            0 0 30px rgba(255,255,255,0.12),
            0 0 60px rgba(255,255,255,0.06);
        }
        50% {
          text-shadow:
            0 0 40px rgba(255,255,255,0.2),
            0 0 80px rgba(255,255,255,0.1);
        }
      }

      .jenjos-title {
        font-family: 'Great Vibes', cursive;
        font-size: clamp(72px, 18vw, 100px);
        color: rgba(255, 255, 255, 0.95);
        animation: inkBleed 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards,
                   inkPulse 4s ease-in-out 2.2s infinite;
      }
    `}</style>
    <h1 className="jenjos-title">Jenjos</h1>
  </div>
);


/* ── Profile Select page ─────────────────────────────────────────────────── */
export const ProfileSelect = () => {
  const { selectProfile } = useApp();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const gap = 32;
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      for (let x = gap; x < canvas.width; x += gap)
        for (let y = gap; y < canvas.height; y += gap) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center p-8"
      style={{ background: '#0c0c0c' }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      <div className="relative z-10 w-full max-w-xs">

        {/* Ink draw wordmark */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-2 text-center"
        >
          <p
            className="text-xs font-mono uppercase tracking-[0.2em] mb-1"
            style={{ color: '#444' }}
          >
            Expense Tracker
          </p>
          <InkTitle />
        </motion.div>

        {/* Profile cards */}
        <div className="flex flex-col gap-3 mt-6">
          {PROFILES.map((profile, i) => (
            <motion.button
              key={profile.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 2.6 + i * 0.1, duration: 0.3 }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectProfile(profile.id)}
              className="group flex items-center gap-4 p-5 text-left transition-colors"
              style={{
                background: '#141414',
                border: '1px solid #2a2a2a',
                borderRadius: '6px',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.background = '#1a1a1a'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.background = '#141414'; }}
            >
              <div
                className="w-12 h-12 flex-shrink-0 overflow-hidden"
                style={{ border: '1px solid #383838', borderRadius: '4px' }}
              >
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  style={{ filter: 'grayscale(20%)' }}
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-base" style={{ color: '#f0f0f0' }}>{profile.name}</p>
                <p className="text-xs mt-0.5" style={{ color: '#555' }}>View dashboard</p>
              </div>
              <span style={{ color: '#444', fontSize: '18px' }} className="group-hover:text-[#888] transition-colors">
                →
              </span>
            </motion.button>
          ))}
        </div>

      </div>
    </div>
  );
};
