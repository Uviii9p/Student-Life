import React from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Clock, BookOpen, AlertCircle, TrendingUp, Calendar, ArrowRight, CheckCircle, Target, Trophy } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import '../dashboard-premium.css';

const Home = () => {
  const { assignments, exams, pomodoroStats, userName, updateAssignment } = useApp();
  const navigate = useNavigate();

  const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
  const pendingAssignments = assignments
    .filter(a => !a.completed)
    .sort((a, b) => (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4));

  const nextExam = exams.length > 0 ? [...exams].sort((a, b) => new Date(a.date) - new Date(b.date))[0] : null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const handleCompleteTask = (task) => {
    updateAssignment({ ...task, completed: true });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="dashboard-page"
    >
      {/* HERO SECTION */}
      <motion.section variants={itemVariants} className="hero-greeting">
        <div className="hero-bg-pattern"></div>
        <div className="hero-graphic"></div>
        <div className="hero-content">
          <h1>Welcome back, {userName ? userName.split(' ')[0] : 'Scholar'}!</h1>
          <p>
            You have {pendingAssignments.length} pending tasks and {exams.length} exams tracked.
            Let's make today productive! 🚀
          </p>
        </div>
      </motion.section>

      {/* STATS ROW */}
      <motion.section variants={itemVariants} className="stats-overview">
        <div className="stat-card-premium" style={{ '--card-color': '#6366f1' }} onClick={() => navigate('/assignments')}>
          <div className="stat-icon-box"><BookOpen /></div>
          <div className="stat-info">
            <span className="label">Tasks Pending</span>
            <span className="value">{pendingAssignments.length}</span>
          </div>
        </div>

        <div className="stat-card-premium" style={{ '--card-color': '#f43f5e' }} onClick={() => navigate('/timer')}>
          <div className="stat-icon-box"><Clock /></div>
          <div className="stat-info">
            <span className="label">Focus Time</span>
            <span className="value">{Math.floor(pomodoroStats.daily / 60)}h {pomodoroStats.daily % 60}m</span>
          </div>
        </div>

        <div className="stat-card-premium" style={{ '--card-color': '#10b981' }}>
          <div className="stat-icon-box"><Trophy /></div>
          <div className="stat-info">
            <span className="label">Productivity</span>
            <span className="value">High</span>
          </div>
        </div>
      </motion.section>

      {/* NEXT EXAM SECTION */}
      <motion.section variants={itemVariants}>
        <div className="section-header-premium">
          <h2><Calendar className="section-icon" /> Next Major Exam</h2>
          <button className="action-link" onClick={() => navigate('/exams')}>
            See Schedule <ArrowRight size={16} />
          </button>
        </div>

        {nextExam ? (
          <div className="next-exam-card">
            <div className="countdown-circle">
              <span className="count-val">{differenceInDays(new Date(nextExam.date), new Date())}</span>
              <span className="count-label">Days Left</span>
            </div>
            <div className="exam-info">
              <h3>{nextExam.subject}</h3>
              <div className="exam-meta">
                <span><Target size={18} /> {nextExam.name}</span>
                <span><Calendar size={18} /> {format(new Date(nextExam.date), 'EEEE, MMMM do')}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-dashboard-card" onClick={() => navigate('/exams')} style={{ cursor: 'pointer' }}>
            <div className="empty-icon-circle"><AlertCircle size={32} /></div>
            <h3>No Exams Scheduled</h3>
            <p>You're all clear! Add an exam to start tracking your countdown.</p>
          </div>
        )}
      </motion.section>

      {/* TASKS SECTION */}
      <motion.section variants={itemVariants}>
        <div className="section-header-premium">
          <h2><CheckCircle className="section-icon" /> Priority Tasks</h2>
          <button className="action-link" onClick={() => navigate('/assignments')}>
            View Board <ArrowRight size={16} />
          </button>
        </div>

        <div className="tasks-grid">
          {pendingAssignments.length > 0 ? (
            pendingAssignments.slice(0, 3).map(task => (
              <div key={task.id} className="task-card-mini">
                <div className={`priority-indicator priority-${task.priority.toLowerCase()}`} />
                <div className="task-content">
                  <h4>{task.title}</h4>
                  <p>{task.subject}</p>
                  <div className="task-tags">
                    <span className="mini-tag">{task.priority}</span>
                    <span className="mini-tag">{format(new Date(task.dueDate), 'MMM d')}</span>
                  </div>
                </div>
                <button
                  className="check-action-btn"
                  onClick={() => handleCompleteTask(task)}
                  title="Mark as Complete"
                >
                  <CheckCircle size={18} />
                </button>
              </div>
            ))
          ) : (
            <div className="empty-dashboard-card" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-icon-circle" style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)' }}>
                <CheckCircle size={32} />
              </div>
              <h3>All Tasks Completed!</h3>
              <p>Great job! Take a break or add new assignments.</p>
            </div>
          )}
        </div>
      </motion.section>
    </motion.div>
  );
};

export default Home;
