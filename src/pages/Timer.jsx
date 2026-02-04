import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings, X, Save, Clock, Trash2, History, TrendingUp, BarChart3, Flame, ChevronRight, Check, Coffee, Target, Sparkles, BookOpen, Code, PenTool, Brain } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../premium-pages.css';
import { format } from 'date-fns';

const Timer = () => {
  const { updateStudyTime, pomodoroStats, timerHistory, deleteTimerHistory, timetable } = useApp();

  // Settings State with Persistence
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('pomodoroSettings');
    return saved ? JSON.parse(saved) : { study: 0.0833, break: 0.0833 }; // Default 5 seconds for testing
  });

  const [mode, setMode] = useState('study');
  const [timeLeft, setTimeLeft] = useState(Math.round(settings.study * 60));
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
      setTimeLeft(Math.round(mode === 'study' ? settings.study * 60 : settings.break * 60));
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
      // Record at least 1 minute for history visibility during testing
      const durationToRecord = settings.study < 1 ? 1 : Math.round(settings.study);
      updateStudyTime(durationToRecord, sessionName || 'Deep Work Session', 'study');
      setSessionName(''); // Reset after session
      setMode('break');
      setTimeLeft(Math.round(settings.break * 60));
    } else {
      const durationToRecord = settings.break < 1 ? 1 : Math.round(settings.break);
      updateStudyTime(durationToRecord, 'Rest & Recharge', 'break');
      setMode('study');
      setTimeLeft(Math.round(settings.study * 60));
    }
    setIsActive(false);
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(Math.round(mode === 'study' ? settings.study * 60 : settings.break * 60));
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

  // Hourly Activity Data for Graph
  const getHourlyData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i === 0 ? 12 : i > 12 ? i - 12 : i}${i >= 12 ? 'PM' : 'AM'}`,
      study: 0,
      break: 0
    }));

    if (!timerHistory) return hours;

    timerHistory.forEach(entry => {
      const date = new Date(entry.date);
      // Only show today's data or within last 24h
      if (new Date().getTime() - date.getTime() < 24 * 60 * 60 * 1000) {
        const hour = date.getHours();
        if (entry.type === 'break') {
          hours[hour].break += entry.duration;
        } else {
          hours[hour].study += entry.duration;
        }
      }
    });

    return hours;
  };

  const hourlyData = getHourlyData();

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
            onClick={() => {
              if (!isActive) {
                setMode('study');
                setTimeLeft(Math.round(settings.study * 60));
              }
            }}
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
            onClick={() => {
              if (!isActive) {
                setMode('break');
                setTimeLeft(Math.round(settings.break * 60));
              }
            }}
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

        {(isActive || mode === 'study') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="session-naming-container"
            style={{ marginBottom: '2.5rem', width: '100%', maxWidth: '600px', margin: '0 auto 3rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)' }}>
                <Target size={18} />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
                {isActive ? 'Ongoing Focus Mission' : 'Set Your Focus Mission'}
              </span>
            </div>

            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder={mode === 'study' ? "E.g. Quantum Physics, React Development..." : "Resting..."}
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                onFocus={() => mode === 'study' && setShowSubjectPicker(true)}
                disabled={mode === 'break'}
                className="glass"
                style={{
                  width: '100%',
                  padding: '1.5rem 4.5rem 1.5rem 1.75rem',
                  borderRadius: 'var(--radius-2xl)',
                  border: '2px solid var(--border)',
                  background: mode === 'break' ? 'transparent' : 'var(--surface-alt)',
                  color: 'var(--text)',
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  textAlign: 'left',
                  outline: 'none',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: showSubjectPicker ? '0 0 30px rgba(var(--primary-rgb), 0.15), inset 0 0 0 1px rgba(var(--primary-rgb), 0.2)' : 'none',
                  borderColor: showSubjectPicker ? 'var(--primary)' : 'var(--border)',
                  opacity: mode === 'break' ? 0.6 : 1,
                  fontFamily: "'Outfit', sans-serif"
                }}
              />
              <AnimatePresence>
                {(sessionName && mode === 'study') && (
                  <motion.button
                    initial={{ opacity: 0, x: 10, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 10, scale: 0.8 }}
                    onClick={() => setShowSubjectPicker(false)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      padding: '10px 16px',
                      borderRadius: '14px',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: 'var(--shadow-primary)',
                      zIndex: 1001
                    }}
                  >
                    Set <Check size={16} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {!isActive && mode === 'study' && !sessionName && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center' }}
              >
                {[
                  { label: 'Reading', icon: <BookOpen size={14} /> },
                  { label: 'Coding', icon: <Code size={14} /> },
                  { label: 'Writing', icon: <PenTool size={14} /> },
                  { label: 'Research', icon: <Sparkles size={14} /> }
                ].map(cat => (
                  <button
                    key={cat.label}
                    onClick={() => setSessionName(cat.label)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--border)',
                      background: 'rgba(var(--text-rgb), 0.03)',
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </motion.div>
            )}

            <AnimatePresence>
              {showSubjectPicker && suggestedSubjects.length > 0 && mode === 'study' && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ position: 'fixed', inset: 0, zIndex: 998 }}
                    onClick={() => setShowSubjectPicker(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.98 }}
                    className="glass"
                    style={{
                      position: 'absolute',
                      top: '110%',
                      left: '0',
                      right: '0',
                      zIndex: 999,
                      borderRadius: '24px',
                      padding: '1.25rem',
                      maxHeight: '250px',
                      overflowY: 'auto',
                      border: '1px solid var(--border)',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                      background: 'var(--surface)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingLeft: '0.5rem' }}>
                      <Brain size={14} className="text-gradient" />
                      <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Suggested From Schedule
                      </p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                      {suggestedSubjects.map((sub, idx) => (
                        <button
                          key={sub}
                          onClick={() => { setSessionName(sub); setShowSubjectPicker(false); }}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '14px',
                            border: '1px solid var(--border)',
                            background: 'var(--surface-alt)',
                            color: 'var(--text)',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = 'var(--primary)';
                            e.currentTarget.style.background = 'rgba(var(--primary-rgb), 0.05)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.background = 'var(--surface-alt)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</span>
                          <ChevronRight size={14} style={{ opacity: 0.5 }} />
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
            fontWeight: 900,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <AnimatePresence>
              {isActive && sessionName && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                  }}
                >
                  {sessionName}
                </motion.span>
              )}
            </AnimatePresence>
            <div style={{ fontSize: '4.5rem', lineHeight: 1 }}>
              {formatTime(timeLeft)}
            </div>
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
      {
        analytics && (
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
        )
      }

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
                      background: item.type === 'break' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(var(--primary-rgb), 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: item.type === 'break' ? 'var(--secondary)' : 'var(--primary)'
                    }}>
                      {item.type === 'break' ? <Coffee size={20} /> : <Clock size={20} />}
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
    </div >
  );
};

export default Timer;
