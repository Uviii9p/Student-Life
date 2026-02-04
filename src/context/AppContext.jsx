import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [notes, setNotes] = useState([]);
  const [pomodoroStats, setPomodoroStats] = useState({ daily: 0, total: 0, sessions: 0 });

  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/data`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setUserName(data.userName || '');
          setUserEmail(data.email || '');
          setTimetable(data.timetable || []);
          setAssignments(data.assignments || []);
          setExams(data.exams || []);
          setNotes(data.notes || []);
          setPomodoroStats(data.pomodoroStats || { daily: 0, total: 0, sessions: 0 });
          setTheme(data.theme || 'light');
        } else {
          setToken('');
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    if (isLoading || !token) return;

    const syncData = async () => {
      const dataToSync = { userName, timetable, assignments, exams, notes, pomodoroStats, theme };
      try {
        await fetch(`${API_URL}/data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(dataToSync)
        });
      } catch (err) {
        console.error('Sync error:', err);
      }
    };

    const timeout = setTimeout(syncData, 1000);
    return () => clearTimeout(timeout);
  }, [timetable, assignments, exams, notes, pomodoroStats, theme, userName, isLoading, token]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.token) {
      setToken(data.token);
      localStorage.setItem('token', data.token);
      return { success: true };
    }
    return { success: false, error: data.error };
  };

  const register = async (email, password, userName) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, userName })
    });
    const data = await res.json();
    if (data.token) {
      setToken(data.token);
      localStorage.setItem('token', data.token);
      return { success: true };
    }
    return { success: false, error: data.error };
  };

  const logout = () => {
    setToken('');
    localStorage.removeItem('token');
    setUserName('');
    setUserEmail('');
    setTimetable([]);
    setAssignments([]);
    setExams([]);
    setNotes([]);
    setPomodoroStats({ daily: 0, total: 0, sessions: 0 });
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Helpers (CRUD)
  const addTimetableEntry = (entry) => setTimetable([...timetable, { ...entry, id: Date.now().toString() }]);
  const updateTimetableEntry = (id, updatedEntry) => setTimetable(timetable.map(t => t.id === id ? { ...updatedEntry, id } : t));
  const deleteTimetableEntry = (id) => setTimetable(timetable.filter(t => t.id !== id));

  const addAssignment = (assignment) => setAssignments([...assignments, { ...assignment, id: Date.now().toString(), completed: false }]);
  const updateAssignment = (id, updatedAssignment) => setAssignments(assignments.map(a => a.id === id ? { ...updatedAssignment, id, completed: a.completed } : a));
  const toggleAssignment = (id) => setAssignments(assignments.map(a => a.id === id ? { ...a, completed: !a.completed } : a));
  const deleteAssignment = (id) => setAssignments(assignments.filter(a => a.id !== id));

  const addExam = (exam) => setExams([...exams, { ...exam, id: Date.now().toString() }]);
  const updateExam = (id, updatedExam) => setExams(exams.map(e => e.id === id ? { ...updatedExam, id } : e));
  const deleteExam = (id) => setExams(exams.filter(e => e.id !== id));

  const addNote = (note) => setNotes([...notes, { ...note, id: Date.now().toString(), date: new Date().toISOString() }]);
  const updateNote = (id, updatedNote) => setNotes(notes.map(n => n.id === id ? { ...updatedNote, date: new Date().toISOString() } : n));
  const deleteNote = (id) => setNotes(notes.filter(n => n.id !== id));

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
