import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Clock, User, MapPin, Trash2, X, Info, Edit2 } from 'lucide-react';

const Timetable = () => {
    const { timetable, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry } = useApp();
    const [activeDay, setActiveDay] = useState('Mon');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const [newEntry, setNewEntry] = useState({
        subject: '',
        teacher: '',
        room: '',
        startTime: '09:00',
        endTime: '10:00',
        day: 'Mon',
        color: '#6366f1'
    });

    const colors = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6'];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newEntry.subject) return;
        addTimetableEntry(newEntry);
        setNewEntry({ ...newEntry, subject: '', teacher: '', room: '' });
        setShowAddModal(false);
    };

    const handleEdit = (entry) => {
        setEditingEntry({ ...entry });
        setShowEditModal(true);
    };

    const handleUpdateSubmit = (e) => {
        e.preventDefault();
        if (!editingEntry.subject) return;
        updateTimetableEntry(editingEntry.id, {
            subject: editingEntry.subject,
            teacher: editingEntry.teacher,
            room: editingEntry.room,
            startTime: editingEntry.startTime,
            endTime: editingEntry.endTime,
            day: editingEntry.day,
            color: editingEntry.color
        });
        setShowEditModal(false);
        setEditingEntry(null);
    };

    const dayEntries = timetable
        .filter(t => t.day === activeDay)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return (
        <div className="timetable-page">
            <header className="page-header flex-header">
                <div>
                    <h1 className="page-title">Timetable</h1>
                    <p className="page-subtitle">Your weekly schedule.</p>
                </div>
                <button className="add-btn glass" onClick={() => setShowAddModal(true)}>
                    <Plus size={24} />
                </button>
            </header>

            <div className="day-selector glass">
                {days.map(d => (
                    <button
                        key={d}
                        className={`day-btn ${activeDay === d ? 'active' : ''}`}
                        onClick={() => setActiveDay(d)}
                    >
                        {d}
                    </button>
                ))}
            </div>

            <div className="timetable-list">
                <AnimatePresence mode="popLayout">
                    {dayEntries.length > 0 ? (
                        dayEntries.map((entry) => (
                            <motion.div
                                key={entry.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="timetable-card glass hover-lift"
                                style={{ borderLeft: `6px solid ${entry.color}` }}
                            >
                                <div className="time-col">
                                    <span className="start-time">{entry.startTime}</span>
                                    <div className="time-line"></div>
                                    <span className="end-time">{entry.endTime}</span>
                                </div>
                                <div className="entry-main">
                                    <h3>{entry.subject}</h3>
                                    <div className="entry-details">
                                        {entry.teacher && <span className="detail-item"><User size={14} /> {entry.teacher}</span>}
                                        {entry.room && <span className="detail-item"><MapPin size={14} /> {entry.room}</span>}
                                    </div>
                                </div>
                                <div className="card-actions">
                                    <button onClick={() => handleEdit(entry)} className="edit-btn" title="Edit">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => deleteTimetableEntry(entry.id)} className="delete-entry" title="Delete">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
                            <Info size={40} className="empty-icon" />
                            <p>No classes scheduled for {activeDay}.</p>
                            <button className="btn btn-primary" onClick={() => { setNewEntry({ ...newEntry, day: activeDay }); setShowAddModal(true); }}>
                                Add Class
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="modal-content glass"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>New Class</h2>
                            <button onClick={() => setShowAddModal(false)}><X /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Subject</label>
                                <input
                                    type="text"
                                    value={newEntry.subject}
                                    onChange={e => setNewEntry({ ...newEntry, subject: e.target.value })}
                                    placeholder="e.g. Mathematics"
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Teacher</label>
                                    <input
                                        type="text"
                                        value={newEntry.teacher}
                                        onChange={e => setNewEntry({ ...newEntry, teacher: e.target.value })}
                                        placeholder="e.g. Dr. Smith"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Room</label>
                                    <input
                                        type="text"
                                        value={newEntry.room}
                                        onChange={e => setNewEntry({ ...newEntry, room: e.target.value })}
                                        placeholder="e.g. Lab 101"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Time</label>
                                    <input
                                        type="time"
                                        value={newEntry.startTime}
                                        onChange={e => setNewEntry({ ...newEntry, startTime: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>End Time</label>
                                    <input
                                        type="time"
                                        value={newEntry.endTime}
                                        onChange={e => setNewEntry({ ...newEntry, endTime: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Day</label>
                                <select value={newEntry.day} onChange={e => setNewEntry({ ...newEntry, day: e.target.value })}>
                                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Color Tag</label>
                                <div className="color-picker">
                                    {colors.map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            className={`color-dot ${newEntry.color === c ? 'active' : ''}`}
                                            style={{ background: c }}
                                            onClick={() => setNewEntry({ ...newEntry, color: c })}
                                        />
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary submit-btn">Save Entry</button>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingEntry && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="modal-content glass"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>Edit Class</h2>
                            <button onClick={() => setShowEditModal(false)}><X /></button>
                        </div>
                        <form onSubmit={handleUpdateSubmit}>
                            <div className="form-group">
                                <label>Subject</label>
                                <input
                                    type="text"
                                    value={editingEntry.subject}
                                    onChange={e => setEditingEntry({ ...editingEntry, subject: e.target.value })}
                                    placeholder="e.g. Mathematics"
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Teacher</label>
                                    <input
                                        type="text"
                                        value={editingEntry.teacher}
                                        onChange={e => setEditingEntry({ ...editingEntry, teacher: e.target.value })}
                                        placeholder="e.g. Dr. Smith"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Room</label>
                                    <input
                                        type="text"
                                        value={editingEntry.room}
                                        onChange={e => setEditingEntry({ ...editingEntry, room: e.target.value })}
                                        placeholder="e.g. Lab 101"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Time</label>
                                    <input
                                        type="time"
                                        value={editingEntry.startTime}
                                        onChange={e => setEditingEntry({ ...editingEntry, startTime: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>End Time</label>
                                    <input
                                        type="time"
                                        value={editingEntry.endTime}
                                        onChange={e => setEditingEntry({ ...editingEntry, endTime: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Day</label>
                                <select value={editingEntry.day} onChange={e => setEditingEntry({ ...editingEntry, day: e.target.value })}>
                                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Color Tag</label>
                                <div className="color-picker">
                                    {colors.map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            className={`color-dot ${editingEntry.color === c ? 'active' : ''}`}
                                            style={{ background: c }}
                                            onClick={() => setEditingEntry({ ...editingEntry, color: c })}
                                        />
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary submit-btn">Update Entry</button>
                        </form>
                    </motion.div>
                </div>
            )}

        </div>
    );
};

export default Timetable;
