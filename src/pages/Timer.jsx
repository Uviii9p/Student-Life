import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings, X, Save, Clock, Trash2, History, TrendingUp, BarChart3, Flame, ChevronRight } from 'lucide-react';
import '../premium-pages.css';
import { format } from 'date-fns';

const Timer = () => {
  const { updateStudyTime, pomodoroStats, timerHistory, deleteTimerHistory, timetable } = useApp();

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
  const [sessionName, setSessionName] = useState('');
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

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
      updateStudyTime(settings.study, sessionName || 'Deep Work Session');
      setSessionName(''); // Reset after session
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

  // Calculate subject analytics
  const getSubjectAnalytics = () => {
    if (!timerHistory || timerHistory.length === 0) return null;

    const subjectsMap = {};
    timerHistory.forEach(entry => {
      const label = entry.label || 'Other';
      subjectsMap[label] = (subjectsMap[label] || 0) + entry.duration;
    });

    const sorted = Object.entries(subjectsMap)
      .map(([name, duration]) => ({ name, duration }))
      .sort((a, b) => b.duration - a.duration);

    return {
      top: sorted[0],
      bottom: sorted.length > 1 ? sorted[sorted.length - 1] : null,
      all: sorted
    };
  };

  const analytics = getSubjectAnalytics();

  // Get unique subjects from timetable and history for suggestions
  const suggestedSubjects = Array.from(new Set([
    ...timetable.map(t => t.subject),
    ...(timerHistory ? timerHistory.map(h => h.label) : [])
  ])).filter(Boolean).slice(0, 10);

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

        {mode === 'study' && !isActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="session-name-input"
            style={{ marginBottom: '2rem', width: '100%', position: 'relative' }}
          >
            <input
              type="text"
              placeholder="What subject are you focusing on?"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              onFocus={() => setShowSubjectPicker(true)}
              className="glass"
              style={{
                width: '100%',
                padding: '1.25rem 1.5rem',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border)',
                background: 'var(--surface-alt)',
                color: 'var(--text)',
                fontSize: '1rem',
                textAlign: 'center',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxShadow: showSubjectPicker ? '0 0 0 4px rgba(var(--primary-rgb), 0.1)' : 'none'
              }}
            />
            <AnimatePresence>
              {showSubjectPicker && suggestedSubjects.length > 0 && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ position: 'fixed', inset: 0, zIndex: 998 }}
                    onClick={() => setShowSubjectPicker(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="glass"
                    style={{
                      position: 'absolute',
                      top: '110%',
                      left: 0,
                      right: 0,
                      zIndex: 999,
                      borderRadius: 'var(--radius-xl)',
                      padding: '1rem',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      border: '1px solid var(--border)',
                      boxShadow: 'var(--shadow-lg)'
                    }}
                  >
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', textAlign: 'left', paddingLeft: '0.5rem' }}>SUGGESTED FROM YOUR SCHEDULE</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {suggestedSubjects.map(sub => (
                        <button
                          key={sub}
                          onClick={() => { setSessionName(sub); setShowSubjectPicker(false); }}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--border)',
                            background: 'var(--surface)',
                            color: 'var(--text)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'rgba(var(--primary-rgb), 0.05)'; }}
                          onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; }}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        )}

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

      {/* Focus Insights Section */}
      {analytics && (
        <div className="focus-insights-section" style={{ maxWidth: '800px', margin: '4rem auto 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <TrendingUp size={24} className="text-gradient" />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>Focus Insights</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass"
              style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', background: 'var(--surface)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)' }}>
                  <Flame size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Most Focused</h3>
              </div>
              <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', fontFamily: "'Outfit', sans-serif" }}>
                {analytics.top.name}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                Total: {Math.floor(analytics.top.duration / 60)}h {analytics.top.duration % 60}m across sessions
              </p>
            </motion.div>

            {analytics.bottom && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass"
                style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', background: 'var(--surface)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--secondary)' }}>
                    <BarChart3 size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Needs Attention</h3>
                </div>
                <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--secondary)', fontFamily: "'Outfit', sans-serif" }}>
                  {analytics.bottom.name}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                  Only {Math.floor(analytics.bottom.duration / 60)}h {analytics.bottom.duration % 60}m spent so far
                </p>
              </motion.div>
            )}
          </div>

          <div className="glass" style={{ marginTop: '1.5rem', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>Time Distribution</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {analytics.all.map((item, idx) => (
                <div key={item.name} style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.name}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.duration}m</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--surface-alt)', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.duration / analytics.top.duration) * 100}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      style={{ height: '100%', background: idx === 0 ? 'var(--primary)' : 'var(--accent)', opacity: 1 - (idx * 0.15) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timer History */}
      <div className="timer-history-section" style={{ maxWidth: '800px', margin: '4rem auto 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <History size={24} className="text-gradient" />
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>Focus History</h2>
        </div>

        <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AnimatePresence>
            {timerHistory && timerHistory.length > 0 ? (
              timerHistory.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="history-item glass"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem 1.5rem',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: 'rgba(var(--primary-rgb), 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)'
                    }}>
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)' }}>{item.label}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {format(new Date(item.date), 'MMM d, h:mm a')} • {item.duration} minutes
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTimerHistory(item.id)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger)'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Your focus journey begins here. Complete a session to see its history.
              </div>
            )}
          </AnimatePresence>
        </div>
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
