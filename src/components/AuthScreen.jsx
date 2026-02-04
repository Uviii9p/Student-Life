import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, BookOpen, Calendar, CheckSquare, Timer, Sparkles, AlertCircle } from 'lucide-react';
import '../auth-premium.css';

const AuthScreen = ({ onLogin, onRegister }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = isLogin
                ? await onLogin(email, password)
                : await onRegister(email, password, name);

            if (!res.success) {
                setError(res.error);
            }
        } catch (err) {
            setError("Network error. Is the server running?");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setEmail('');
        setPassword('');
        setName('');
    };

    const features = [
        { icon: <Calendar size={24} />, title: 'Smart Timetable', desc: 'Organize your schedule' },
        { icon: <CheckSquare size={24} />, title: 'Task Manager', desc: 'Track assignments' },
        { icon: <BookOpen size={24} />, title: 'Digital Notes', desc: 'Study smarter' },
        { icon: <Timer size={24} />, title: 'Pomodoro Timer', desc: 'Focus better' },
    ];

    return (
        <div className="auth-screen">
            {/* Animated Background */}
            <div className="auth-bg">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            <div className="auth-container">
                {/* Left Side - Branding */}
                <motion.div
                    className="auth-branding"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="brand-header">
                        <motion.div
                            className="brand-icon"
                            animate={{
                                rotate: [0, 5, -5, 0],
                                scale: [1, 1.05, 1]
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Sparkles size={32} />
                        </motion.div>
                        <h1 className="brand-title">StudentLife</h1>
                    </div>

                    <p className="brand-tagline">
                        Your all-in-one companion for academic success. Organize, study, and thrive.
                    </p>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="feature-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                whileHover={{ y: -5, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                            >
                                <div className="feature-icon">{feature.icon}</div>
                                <div className="feature-content">
                                    <h3>{feature.title}</h3>
                                    <p>{feature.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="brand-footer">
                        <p>© 2026 StudentLife. Join thousands of students today.</p>
                    </div>
                </motion.div>

                {/* Right Side - Auth Form */}
                <motion.div
                    className="auth-form-container"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                >
                    <div className="auth-card glass">
                        <div className="auth-header">
                            <h2>{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
                            <p>{isLogin ? 'Sign in to continue your journey' : 'Start your journey to academic success'}</p>
                        </div>

                        {/* Tab Switcher */}
                        <div className="auth-tabs">
                            <button
                                className={`auth-tab ${isLogin ? 'active' : ''}`}
                                onClick={() => setIsLogin(true)}
                            >
                                Login
                            </button>
                            <button
                                className={`auth-tab ${!isLogin ? 'active' : ''}`}
                                onClick={() => setIsLogin(false)}
                            >
                                Sign Up
                            </button>
                            <motion.div
                                className="tab-indicator"
                                animate={{ x: isLogin ? 0 : '100%' }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <AnimatePresence mode="popLayout">
                                {!isLogin && (
                                    <motion.div
                                        key="name"
                                        initial={{ opacity: 0, height: 0, y: -20 }}
                                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                                        exit={{ opacity: 0, height: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="input-group"
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <label>Full Name</label>
                                        <div className="input-wrapper">
                                            <User size={20} className="input-icon" />
                                            <input
                                                type="text"
                                                placeholder="Enter your name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required={!isLogin}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="input-group">
                                <label>Email Address</label>
                                <div className="input-wrapper">
                                    <Mail size={20} className="input-icon" />
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Password</label>
                                <div className="input-wrapper">
                                    <Lock size={20} className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex="-1"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="error-message"
                                    >
                                        <AlertCircle size={18} />
                                        <span>{error}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.button
                                type="submit"
                                className="submit-btn"
                                disabled={isLoading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isLoading ? (
                                    <div className="loading-spinner"></div>
                                ) : (
                                    isLogin ? 'Sign In' : 'Create Account'
                                )}
                            </motion.button>
                        </form>

                        <div className="auth-footer">
                            <p>
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <button onClick={toggleAuthMode} className="link-btn">
                                    {isLogin ? 'Sign up' : 'Log in'}
                                </button>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthScreen;
