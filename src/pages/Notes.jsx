import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Trash2, Calendar, X, Save, Image as ImageIcon, Sparkles, Book } from 'lucide-react';
import { format } from 'date-fns';

const Notes = () => {
  const { notes, addNote, updateNote, deleteNote } = useApp();
  const [search, setSearch] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const [noteForm, setNoteForm] = useState({ title: '', content: '', subject: '', image: '' });

  const handleSave = (e) => {
    e.preventDefault();
    if (!noteForm.title) return;

    if (editingNote) {
      updateNote(editingNote.id, noteForm);
    } else {
      addNote(noteForm);
    }
    closeModal();
  };

  const closeModal = () => {
    setEditingNote(null);
    setIsAdding(false);
    setNoteForm({ title: '', content: '', subject: '', image: '' });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2000000) { // 2MB Limit
        alert("Image is too large. Please select an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNoteForm({ ...noteForm, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const openEdit = (note) => {
    setEditingNote(note);
    setNoteForm({ title: note.title, content: note.content, subject: note.subject, image: note.image || '' });
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    (n.subject && n.subject.toLowerCase().includes(search.toLowerCase())) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="notes-page">
      <header className="page-header flex-header">
        <div>
          <h1 className="page-title text-gradient">Digital Notes</h1>
          <p className="page-subtitle">Capture your thoughts and organize your learnings.</p>
        </div>
        <button className="add-btn" onClick={() => setIsAdding(true)}>
          <Plus size={32} color="white" />
        </button>
      </header>

      <div className="search-bar-premium glass hover-lift">
        <Search size={22} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search your knowledge base..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="notes-grid">
        <AnimatePresence mode="popLayout">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note, index) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: index * 0.05 } }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="note-card-premium glass hover-lift"
                onClick={() => openEdit(note)}
              >
                <div className="note-card-header">
                  <span className="note-badge">{note.subject || 'General'}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                    className="delete-note-btn"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <h3 className="note-title">{note.title}</h3>

                {note.image && (
                  <div className="note-image-container">
                    <img src={note.image} alt="Note Attachment" className="note-image" />
                  </div>
                )}

                <p className="note-preview">{note.content}</p>

                <div className="note-footer">
                  <Calendar size={14} /> {format(new Date(note.date), 'MMMM d, yyyy')}
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="stunning-empty"
              style={{ gridColumn: '1 / -1', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <div className="icon-badge" style={{ margin: '0 auto 1.5rem', background: 'rgba(255,255,255,0.1)' }}>
                <Book size={48} style={{ color: 'var(--text-muted)' }} />
              </div>
              <h3>Canvas Empty</h3>
              <p>Your digital notebook is waiting for its first brilliant idea.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {(isAdding || editingNote) && (
          <div className="modal-overlay-premium" onClick={closeModal}>
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              className="modal-content-premium glass"
              onClick={e => e.stopPropagation()}
            >
              <header className="modal-header-premium">
                <h2 className="modal-title">{editingNote ? 'Refine Note' : 'New Note'}</h2>
                <div className="modal-actions">
                  <button onClick={handleSave} className="btn-icon-large btn-save" title="Save">
                    <Save size={24} />
                  </button>
                  <button onClick={closeModal} className="btn-icon-large btn-close" title="Close">
                    <X size={24} />
                  </button>
                </div>
              </header>

              <form className="note-form-premium" onSubmit={handleSave}>
                <input
                  className="input-title-large"
                  type="text"
                  placeholder="Note Title..."
                  value={noteForm.title}
                  onChange={e => setNoteForm({ ...noteForm, title: e.target.value })}
                  autoFocus
                />

                <input
                  className="input-category"
                  type="text"
                  placeholder="Subject / Category (Optional)"
                  value={noteForm.subject}
                  onChange={e => setNoteForm({ ...noteForm, subject: e.target.value })}
                />

                <textarea
                  className="textarea-content"
                  placeholder="Start typing your thoughts here..."
                  value={noteForm.content}
                  onChange={e => setNoteForm({ ...noteForm, content: e.target.value })}
                />

                <div className="image-upload-area">
                  {noteForm.image ? (
                    <div className="preview-container">
                      <img src={noteForm.image} alt="Preview" className="preview-img" />
                      <button type="button" onClick={() => setNoteForm({ ...noteForm, image: '' })} className="remove-img-btn">
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <label className="upload-label glass hover-lift">
                      <ImageIcon size={32} />
                      <span>Add Visual Reference (Image)</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                    </label>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notes;
