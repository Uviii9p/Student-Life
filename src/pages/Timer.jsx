import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings, X, Save, Clock } from 'lucide-react';
import '../premium-pages.css';

const Timer = () => {
  const { updateStudyTime, pomodoroStats } = useApp();

  // Settings State with Persistence
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('pomodoroSettings');
    return saved ? JSON.parse(saved) : { study: 25, break: 5 };
  });

  const [mode, setMode] = useState('study');
  const [timeLeft, setTimeLeft] = useState(settings.study * 60);
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);

  const timerRef = useRef(null);

  // Update timer when settings change (if not active)
  useEffect(() => {
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    if (!isActive) {
      setTimeLeft(mode === 'study' ? settings.study * 60 : settings.break * 60);
    }
  }, [settings]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timerRef.current);
      handleSessionEnd();
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const handleSessionEnd = () => {
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
    audio.play().catch(() => { });

    if (mode === 'study') {
      updateStudyTime(settings.study);
      setMode('break');
      setTimeLeft(settings.break * 60);
    } else {
      setMode('study');
      setTimeLeft(settings.study * 60);
    }
    setIsActive(false);
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'study' ? settings.study * 60 : settings.break * 60);
  };

  const saveSettings = () => {
    setSettings(tempSettings);
    setShowSettings(false);
    // Force reset to apply new time immediately
    setIsActive(false);
    setTimeLeft(mode === 'study' ? tempSettings.study * 60 : tempSettings.break * 60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalTime = mode === 'study' ? settings.study * 60 : settings.break * 60;
  // Prevent division by zero
  const safeTotalTime = totalTime > 0 ? totalTime : 1;
  const progress = (timeLeft / safeTotalTime) * 100;
  const strokeDashoffset = 880 - (880 * progress) / 100;

  const stats = pomodoroStats || { daily: 0, total: 0, sessions: 0 };

  return (
    <div className="timer-page">
      <header className="page-header">
        <div>
          <h1 className="page-title text-gradient">⏱️ Focus Engine</h1>
          <p className="page-subtitle">Ignite your concentration and track your progress.</p>
        </div>
      </header>

      <div className="timer-container glass hover-lift">
        <div className="timer-modes" style={{
          display: 'flex',
          gap: '8px',
          padding: '8px',
          background: 'var(--surface-alt)',
          borderRadius: 'var(--radius-full)',
          marginBottom: '3rem'
        }}>
          <button
            className={`mode-btn touch-target ${mode === 'study' ? 'active' : ''}`}
            onClick={() => { setMode('study'); setTimeLeft(settings.study * 60); setIsActive(false); }}
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: '1rem',
              background: mode === 'study' ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : 'transparent',
              color: mode === 'study' ? 'white' : 'var(--text-muted)',
              transition: 'all 0.3s ease',
              border: 'none',
              cursor: 'pointer',
              boxShadow: mode === 'study' ? 'var(--shadow-primary)' : 'none'
            }}
          >
            🎯 Deep Work
          </button>
          <button
            className={`mode-btn touch-target ${mode === 'break' ? 'active' : ''}`}
            onClick={() => { setMode('break'); setTimeLeft(settings.break * 60); setIsActive(false); }}
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: '1rem',
              background: mode === 'break' ? 'linear-gradient(135deg, var(--secondary), #ec4899)' : 'transparent',
              color: mode === 'break' ? 'white' : 'var(--text-muted)',
              transition: 'all 0.3s ease',
              border: 'none',
              cursor: 'pointer',
              boxShadow: mode === 'break' ? '0 10px 25px -5px rgba(244, 63, 94, 0.3)' : 'none'
            }}
          >
            ☕ Short Break
          </button>
        </div>

        <div className="timer-circle-container">
          <svg className="timer-svg" viewBox="0 0 300 300">
            <circle
              cx="150" cy="150" r="140" fill="none"
              stroke="var(--border)" strokeWidth="8"
            />
            <motion.circle
              cx="150" cy="150" r="140" fill="none"
              stroke={mode === 'study' ? 'url(#gradient-study)' : 'url(#gradient-break)'}
              strokeWidth="12"
              strokeDasharray="880"
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "linear" }}
              className="timer-progress-bar"
              style={{ filter: `drop-shadow(0 0 16px ${mode === 'study' ? 'var(--primary)' : 'var(--secondary)'}88)` }}
            />
            <defs>
              <linearGradient id="gradient-study" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--primary)" />
                <stop offset="100%" stopColor="var(--accent)" />
              </linearGradient>
              <linearGradient id="gradient-break" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--secondary)" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          <div className="timer-time-display" style={{
            color: 'var(--text)',
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 900
          }}>
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="timer-controls-v2">
          <button onClick={resetTimer} className="action-btn-sub glass touch-target" title="Reset Timer">
            <RotateCcw size={22} />
          </button>
          <button
            onClick={toggleTimer}
            className="action-btn-main touch-target"
            title={isActive ? "Pause Timer" : "Start Timer"}
            style={{
              background: isActive ? 'linear-gradient(135deg, #f59e0b, #f97316)' : 'linear-gradient(135deg, var(--primary), var(--accent))'
            }}
          >
            {isActive ? <Pause size={36} fill="white" /> : <Play size={36} fill="white" style={{ marginLeft: '4px' }} />}
          </button>
          <button
            onClick={() => { setTempSettings(settings); setShowSettings(true); }}
            className="action-btn-sub glass touch-target"
            title="Settings"
          >
            <Settings size={22} />
          </button>
        </div>
      </div>

      <div className="focus-stats-row" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        maxWidth: '600px',
        margin: '2rem auto 0'
      }}>
        <motion.div
          className="card glass hover-lift"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            padding: '2rem',
            borderRadius: 'var(--radius-xl)',
            textAlign: 'center',
            border: '1px solid rgba(var(--primary-rgb), 0.1)',
            background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.05), transparent)'
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎯</div>
          <h4 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text)', fontFamily: "'Outfit', sans-serif" }}>
            {stats.sessions || 0}
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Deep Sessions
          </p>
        </motion.div>

        <motion.div
          className="card glass hover-lift"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            padding: '2rem',
            borderRadius: 'var(--radius-xl)',
            textAlign: 'center',
            border: '1px solid rgba(244, 63, 94, 0.1)',
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.05), transparent)'
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⏱️</div>
          <h4 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text)', fontFamily: "'Outfit', sans-serif" }}>
            {Math.floor((stats.total || 0) / 60)}h {(stats.total || 0) % 60}m
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Focus Time
          </p>
        </motion.div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <div className="modal-overlay" onClick={() => setShowSettings(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="modal-content"
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Timer Settings</h2>
                <button onClick={() => setShowSettings(false)}><X size={20} /></button>
              </div>

              <div className="settings-body">
                <div className="range-slider-container">
                  <div className="range-header">
                    <span>🎯 Focus Duration</span>
                    <span className="range-value">
                      {tempSettings.study < 60
                        ? `${tempSettings.study} min`
                        : `${Math.floor(tempSettings.study / 60)}h ${tempSettings.study % 60 > 0 ? tempSettings.study % 60 + 'm' : ''}`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="600"
                    step="5"
                    value={tempSettings.study}
                    onChange={(e) => setTempSettings({ ...tempSettings, study: Number(e.target.value) })}
                    className="premium-range"
                    style={{ '--primary': 'var(--primary)' }}
                  />
                  <div className="range-ticks">
                    <span>5m</span><span>5h</span><span>10h</span>
                  </div>
                </div>

                <div className="range-slider-container" style={{ marginTop: '1.5rem' }}>
                  <div className="range-header">
                    <span>☕ Break Duration</span>
                    <span className="range-value" style={{ color: 'var(--secondary)' }}>{tempSettings.break} min</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    step="1"
                    value={tempSettings.break}
                    onChange={(e) => setTempSettings({ ...tempSettings, break: Number(e.target.value) })}
                    className="premium-range"
                    style={{ '--primary': 'var(--secondary)' }}
                  />
                  <div className="range-ticks">
                    <span>1m</span><span>30m</span><span>60m</span>
                  </div>
                </div>

                <button
                  className="submit-btn add-btn"
                  onClick={saveSettings}
                  style={{
                    width: '100%',
                    borderRadius: 'var(--radius-xl)',
                    height: 'auto',
                    marginTop: '2rem',
                    gap: '0.5rem'
                  }}
                >
                  <Save size={20} /> Save Configuration
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Timer;
