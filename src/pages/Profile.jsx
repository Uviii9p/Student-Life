import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Settings, LogOut, Award, Book, Clock, Camera } from 'lucide-react';

const Profile = () => {
    const { userName, userEmail, pomodoroStats, assignments, exams, logout, setUserName, profileImage, setProfileImage, token } = useApp();
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(userName);
    const fileInputRef = useRef(null);

    const stats = [
        { label: 'Study Hours', value: `${Math.floor(pomodoroStats.total / 60)}h`, icon: <Clock size={20} />, color: '#6366f1' },
        { label: 'Tasks Done', value: assignments.filter(a => a.completed).length, icon: <Award size={20} />, color: '#10b981' },
        { label: 'Exams Tracked', value: exams.length, icon: <Book size={20} />, color: '#f59e0b' },
    ];

    const handleUpdateName = async () => {
        setUserName(newName);
        setIsEditing(false);
        // Sync happens automatically via AppContext useEffect
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="profile-page">
            <header className="page-header">
                <h1 className="page-title">My Profile</h1>
                <p className="page-subtitle">Manage your account and view your progress.</p>
            </header>

            <div className="profile-content">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="profile-card glass"
                >
                    <div className="profile-header">
                        <div className="avatar-container">
                            <div className="avatar-large">
                                {profileImage ? (
                                    <img src={profileImage} alt={userName} />
                                ) : (
                                    userName ? userName.charAt(0).toUpperCase() : <User />
                                )}
                            </div>
                            <button className="avatar-edit" onClick={triggerFileInput}>
                                <Camera size={16} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                hidden
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </div>
                        <div className="profile-main-info">
                            {isEditing ? (
                                <div className="edit-name-group">
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="edit-name-input"
                                        autoFocus
                                    />
                                    <div className="edit-actions">
                                        <button onClick={handleUpdateName} className="btn-save-mini">Save</button>
                                        <button onClick={() => setIsEditing(false)} className="btn-cancel-mini">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="name-group">
                                    <h2>{userName || 'Student'}</h2>
                                    <button onClick={() => setIsEditing(true)} className="edit-btn-text">Edit Name</button>
                                </div>
                            )}
                            <p className="profile-email"><Mail size={14} /> {userEmail || 'No email provided'}</p>
                        </div>
                    </div>

                    <div className="profile-stats-row">
                        {stats.map((stat, index) => (
                            <div key={index} className="profile-stat-item">
                                <div className="stat-icon-circle" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                    {stat.icon}
                                </div>
                                <div className="stat-details">
                                    <span className="stat-val">{stat.value}</span>
                                    <span className="stat-lab">{stat.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <div className="profile-settings-list">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="settings-card glass"
                    >
                        <h3>Account Settings</h3>
                        <div className="settings-items">
                            <div className="settings-item">
                                <div className="settings-item-info">
                                    <Shield size={20} />
                                    <span>Security & Privacy</span>
                                </div>
                                <Settings size={18} color="var(--text-muted)" />
                            </div>
                            <div className="settings-item" onClick={logout}>
                                <div className="settings-item-info text-danger">
                                    <LogOut size={20} />
                                    <span>Logout</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
