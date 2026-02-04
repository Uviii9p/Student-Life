import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Calendar, MapPin, X, Edit2, AlertCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const Exams = () => {
    const { exams, addExam, updateExam, deleteExam } = useApp();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingExam, setEditingExam] = useState(null);

    const [newExam, setNewExam] = useState({
        subject: '',
        name: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: '09:00',
        location: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newExam.subject || !newExam.name) return;
        addExam(newExam);
        setNewExam({
            subject: '',
            name: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            startTime: '09:00',
            location: ''
        });
        setShowAddModal(false);
    };

    const handleEdit = (exam) => {
        setEditingExam({ ...exam });
        setShowEditModal(true);
    };

    const handleUpdateSubmit = (e) => {
        e.preventDefault();
        if (!editingExam.subject || !editingExam.name) return;
        updateExam(editingExam.id, {
            subject: editingExam.subject,
            name: editingExam.name,
            date: editingExam.date,
            startTime: editingExam.startTime,
            location: editingExam.location
        });
        setShowEditModal(false);
        setEditingExam(null);
    };

    const upcomingExams = exams
        .filter(e => new Date(e.date) >= new Date().setHours(0, 0, 0, 0))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const pastExams = exams
        .filter(e => new Date(e.date) < new Date().setHours(0, 0, 0, 0))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="exams-page">
            <header className="page-header flex-header">
                <div>
                    <h1 className="page-title">Exams</h1>
                    <p className="page-subtitle">Track your upcoming assessments.</p>
                </div>
                <button className="add-btn glass" onClick={() => setShowAddModal(true)}>
                    <Plus size={24} />
                </button>
            </header>

            <div className="section-container">
                <h2 className="section-title">Upcoming Exams</h2>
                <div className="exams-list">
                    <AnimatePresence mode="popLayout">
                        {upcomingExams.length > 0 ? (
                            upcomingExams.map((exam) => {
                                const daysLeft = differenceInDays(new Date(exam.date), new Date());
                                return (
                                    <motion.div
                                        key={exam.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="exam-list-card glass hover-lift"
                                    >
                                        <div className="exam-status">
                                            <div className={`status-badge ${daysLeft <= 3 ? 'urgent' : ''}`}>
                                                {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days left`}
                                            </div>
                                        </div>
                                        <div className="exam-info">
                                            <h3>{exam.subject}</h3>
                                            <p className="exam-name">{exam.name}</p>
                                            <div className="exam-meta">
                                                <span><Calendar size={14} /> {format(new Date(exam.date), 'EEE, MMM d')}</span>
                                                {exam.startTime && <span><AlertCircle size={14} /> {exam.startTime}</span>}
                                                {exam.location && <span><MapPin size={14} /> {exam.location}</span>}
                                            </div>
                                        </div>
                                        <div className="card-actions">
                                            <button onClick={() => handleEdit(exam)} className="edit-btn"><Edit2 size={18} /></button>
                                            <button onClick={() => deleteExam(exam.id)} className="delete-btn"><Trash2 size={18} /></button>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <p className="empty-state">No upcoming exams. Stay relaxed!</p>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {pastExams.length > 0 && (
                <div className="section-container past-section">
                    <h2 className="section-title">Past Exams</h2>
                    <div className="exams-list">
                        {pastExams.map((exam) => (
                            <div key={exam.id} className="exam-list-card glass past hover-lift">
                                <div className="exam-info">
                                    <h3>{exam.subject}</h3>
                                    <p>{exam.name}</p>
                                    <span className="exam-date">{format(new Date(exam.date), 'MMM d, yyyy')}</span>
                                </div>
                                <button onClick={() => deleteExam(exam.id)} className="delete-btn"><Trash2 size={16} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="modal-content glass"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>Add Exam</h2>
                            <button onClick={() => setShowAddModal(false)}><X /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Subject</label>
                                <input
                                    type="text"
                                    value={newExam.subject}
                                    onChange={e => setNewExam({ ...newExam, subject: e.target.value })}
                                    placeholder="e.g. Mathematics"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Exam Name</label>
                                <input
                                    type="text"
                                    value={newExam.name}
                                    onChange={e => setNewExam({ ...newExam, name: e.target.value })}
                                    placeholder="e.g. Final Exam"
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        value={newExam.date}
                                        onChange={e => setNewExam({ ...newExam, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Time</label>
                                    <input
                                        type="time"
                                        value={newExam.startTime}
                                        onChange={e => setNewExam({ ...newExam, startTime: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    value={newExam.location}
                                    onChange={e => setNewExam({ ...newExam, location: e.target.value })}
                                    placeholder="e.g. Hall A"
                                />
                            </div>
                            <button type="submit" className="btn btn-primary submit-btn">Save Exam</button>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingExam && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="modal-content glass"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>Edit Exam</h2>
                            <button onClick={() => setShowEditModal(false)}><X /></button>
                        </div>
                        <form onSubmit={handleUpdateSubmit}>
                            <div className="form-group">
                                <label>Subject</label>
                                <input
                                    type="text"
                                    value={editingExam.subject}
                                    onChange={e => setEditingExam({ ...editingExam, subject: e.target.value })}
                                    placeholder="e.g. Mathematics"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Exam Name</label>
                                <input
                                    type="text"
                                    value={editingExam.name}
                                    onChange={e => setEditingExam({ ...editingExam, name: e.target.value })}
                                    placeholder="e.g. Final Exam"
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        value={editingExam.date}
                                        onChange={e => setEditingExam({ ...editingExam, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Time</label>
                                    <input
                                        type="time"
                                        value={editingExam.startTime}
                                        onChange={e => setEditingExam({ ...editingExam, startTime: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    value={editingExam.location}
                                    onChange={e => setEditingExam({ ...editingExam, location: e.target.value })}
                                    placeholder="e.g. Hall A"
                                />
                            </div>
                            <button type="submit" className="btn btn-primary submit-btn">Update Exam</button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Exams;
