import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AuthScreen from './components/AuthScreen';
import Home from './pages/Home';
import Timetable from './pages/Timetable';
import Assignments from './pages/Assignments';
import Exams from './pages/Exams';
import Notes from './pages/Notes';
import Timer from './pages/Timer';
import Profile from './pages/Profile';
import './App.css';

import { useApp } from './context/AppContext';

function App() {
  const { isLoading, token, login, register } = useApp();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.2rem',
        fontWeight: '600'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1rem' }}>🌟</div>
          Connecting to Cloud...
        </div>
      </div>
    );
  }

  if (!token) {
    return <AuthScreen onLogin={login} onRegister={register} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="timetable" element={<Timetable />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="exams" element={<Exams />} />
        <Route path="notes" element={<Notes />} />
        <Route path="timer" element={<Timer />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
