import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle, Calendar, Tag, Filter, X, Edit2 } from 'lucide-react';
import { format } from 'date-fns';

const Assignments = () => {
  const { assignments, addAssignment, updateAssignment, toggleAssignment, deleteAssignment } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, completed

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    subject: '',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    priority: 'Medium'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newAssignment.title || !newAssignment.subject) return;
    addAssignment(newAssignment);
    setNewAssignment({
      title: '',
      subject: '',
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      priority: 'Medium'
    });
    setShowAddModal(false);
  };

  const handleEdit = (assignment) => {
    setEditingAssignment({
      ...assignment,
      dueDate: assignment.dueDate || format(new Date(), 'yyyy-MM-dd')
    });
    setShowEditModal(true);
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (!editingAssignment.title || !editingAssignment.subject) return;
    updateAssignment(editingAssignment.id, {
      title: editingAssignment.title,
      subject: editingAssignment.subject,
      dueDate: editingAssignment.dueDate,
      priority: editingAssignment.priority
    });
    setShowEditModal(false);
    setEditingAssignment(null);
  };

  const filteredAssignments = assignments.filter(a => {
    if (filter === 'pending') return !a.completed;
    if (filter === 'completed') return a.completed;
    return true;
  }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return (
    <div className="assignments-page">
      <header className="page-header flex-header">
        <div>
          <h1 className="page-title">Assignments</h1>
          <p className="page-subtitle">Manage your academic tasks.</p>
        </div>
        <button className="add-btn glass" onClick={() => setShowAddModal(true)}>
          <Plus size={24} />
        </button>
      </header>

      <div className="filter-bar">
        {['all', 'pending', 'completed'].map(f => (
          <button
            key={f}
            className={`filter-chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="assignments-list">
        <AnimatePresence>
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`assignment-card glass hover-lift ${task.completed ? 'completed' : ''}`}
              >
                <div className="card-check">
                  <button onClick={() => toggleAssignment(task.id)} className="check-btn">
                    {task.completed ? <CheckCircle fill="var(--success)" color="white" /> : <div className="check-circle" />}
                  </button>
                </div>
                <div className="card-main">
                  <h3>{task.title}</h3>
                  <div className="card-meta">
                    <span className="meta-item"><Tag size={12} /> {task.subject}</span>
                    <span className="meta-item"><Calendar size={12} /> {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                    <span className={`priority-tag ${task.priority.toLowerCase()}`}>{task.priority}</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button onClick={() => handleEdit(task)} className="edit-btn" title="Edit">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => deleteAssignment(task.id)} className="delete-btn" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
              No assignments found. Tap + to add one!
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
              <h2>New Assignment</h2>
              <button onClick={() => setShowAddModal(false)}><X /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newAssignment.title}
                  onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  placeholder="e.g. History Essay"
                  autoFocus
                  required
                />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  value={newAssignment.subject}
                  onChange={e => setNewAssignment({ ...newAssignment, subject: e.target.value })}
                  placeholder="e.g. World History"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={newAssignment.dueDate}
                    onChange={e => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={newAssignment.priority}
                    onChange={e => setNewAssignment({ ...newAssignment, priority: e.target.value })}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary submit-btn">Add Assignment</button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingAssignment && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="modal-content glass"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Edit Assignment</h2>
              <button onClick={() => setShowEditModal(false)}><X /></button>
            </div>
            <form onSubmit={handleUpdateSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={editingAssignment.title}
                  onChange={e => setEditingAssignment({ ...editingAssignment, title: e.target.value })}
                  placeholder="e.g. History Essay"
                  autoFocus
                  required
                />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  value={editingAssignment.subject}
                  onChange={e => setEditingAssignment({ ...editingAssignment, subject: e.target.value })}
                  placeholder="e.g. World History"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={editingAssignment.dueDate}
                    onChange={e => setEditingAssignment({ ...editingAssignment, dueDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={editingAssignment.priority}
                    onChange={e => setEditingAssignment({ ...editingAssignment, priority: e.target.value })}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary submit-btn">Update Assignment</button>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default Assignments;

