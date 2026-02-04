import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // --- State Initialization from LocalStorage ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [token, setToken] = useState(localStorage.getItem('currentUser') || ''); // Using userEmail as token
  const [userEmail, setUserEmail] = useState(localStorage.getItem('currentUser') || '');
  const [userName, setUserName] = useState('');

  const [timetable, setTimetable] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [notes, setNotes] = useState([]);
  const [pomodoroStats, setPomodoroStats] = useState({ daily: 0, total: 0, sessions: 0 });

  const [isLoading, setIsLoading] = useState(true);

  // Load User Data when token/email changes
  useEffect(() => {
    if (userEmail) {
      const allUsers = JSON.parse(localStorage.getItem('users_db') || '{}');
      const userData = allUsers[userEmail];

      if (userData) {
        setUserName(userData.userName || '');
        setTimetable(userData.timetable || []);
        setAssignments(userData.assignments || []);
        setExams(userData.exams || []);
        setNotes(userData.notes || []);
        setPomodoroStats(userData.pomodoroStats || { daily: 0, total: 0, sessions: 0 });
        setTheme(userData.theme || 'light');
      }
    }
    setIsLoading(false);
  }, [userEmail]);

  // Sync Data to LocalStorage whenever it changes
  useEffect(() => {
    if (userEmail && !isLoading) {
      const allUsers = JSON.parse(localStorage.getItem('users_db') || '{}');
      allUsers[userEmail] = {
        ...allUsers[userEmail],
        userName,
        timetable,
        assignments,
        exams,
        notes,
        pomodoroStats,
        theme
      };
      localStorage.setItem('users_db', JSON.stringify(allUsers));
    }
  }, [timetable, assignments, exams, notes, pomodoroStats, theme, userName, userEmail, isLoading]);

  // Handle Theme Change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // --- Auth Actions ---
  const login = async (email, password) => {
    // Artificial delay for feel
    await new Promise(resolve => setTimeout(resolve, 500));

    const allUsers = JSON.parse(localStorage.getItem('users_db') || '{}');
    const user = allUsers[email];

    if (user && user.password === password) {
      setToken(email);
      setUserEmail(email);
      localStorage.setItem('currentUser', email);
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const register = async (email, password, name) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const allUsers = JSON.parse(localStorage.getItem('users_db') || '{}');

    if (allUsers[email]) {
      return { success: false, error: 'User already exists' };
    }

    allUsers[email] = {
      email,
      password,
      userName: name,
      timetable: [],
      assignments: [],
      exams: [],
      notes: [],
      pomodoroStats: { daily: 0, total: 0, sessions: 0 },
      theme: 'light'
    };

    localStorage.setItem('users_db', JSON.stringify(allUsers));
    setToken(email);
    setUserEmail(email);
    localStorage.setItem('currentUser', email);
    return { success: true };
  };

  const logout = () => {
    setToken('');
    setUserEmail('');
    localStorage.removeItem('currentUser');
    setUserName('');
    setTimetable([]);
    setAssignments([]);
    setExams([]);
    setNotes([]);
    setPomodoroStats({ daily: 0, total: 0, sessions: 0 });
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // --- CRUD Helpers ---
  const addTimetableEntry = (entry) => setTimetable(prev => [...prev, { ...entry, id: Date.now().toString() }]);
  const updateTimetableEntry = (id, updatedEntry) => setTimetable(prev => prev.map(t => t.id === id ? { ...updatedEntry, id } : t));
  const deleteTimetableEntry = (id) => setTimetable(prev => prev.filter(t => t.id !== id));

  const addAssignment = (assignment) => setAssignments(prev => [...prev, { ...assignment, id: Date.now().toString(), completed: false }]);
  const updateAssignment = (id, updatedAssignment) => setAssignments(prev => prev.map(a => a.id === id ? { ...updatedAssignment, id, completed: a.completed } : a));
  const toggleAssignment = (id) => setAssignments(prev => prev.map(a => a.id === id ? { ...a, completed: !a.completed } : a));
  const deleteAssignment = (id) => setAssignments(prev => prev.filter(a => a.id !== id));

  const addExam = (exam) => setExams(prev => [...prev, { ...exam, id: Date.now().toString() }]);
  const updateExam = (id, updatedExam) => setExams(prev => prev.map(e => e.id === id ? { ...updatedExam, id } : e));
  const deleteExam = (id) => setExams(prev => prev.filter(e => e.id !== id));

  const addNote = (note) => setNotes(prev => [...prev, { ...note, id: Date.now().toString(), date: new Date().toISOString() }]);
  const updateNote = (id, updatedNote) => setNotes(prev => prev.map(n => n.id === id ? { ...updatedNote, date: new Date().toISOString() } : n));
  const deleteNote = (id) => setNotes(prev => prev.filter(n => n.id !== id));

  const updateStudyTime = (minutes) => setPomodoroStats(prev => ({ ...prev, daily: prev.daily + minutes, total: prev.total + minutes, sessions: prev.sessions + 1 }));

  const value = {
    theme, toggleTheme,
    userName, setUserName,
    userEmail,
    timetable, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry,
    assignments, addAssignment, updateAssignment, toggleAssignment, deleteAssignment,
    exams, addExam, updateExam, deleteExam,
    notes, addNote, updateNote, deleteNote,
    pomodoroStats, updateStudyTime,
    isLoading, token, login, register, logout
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
