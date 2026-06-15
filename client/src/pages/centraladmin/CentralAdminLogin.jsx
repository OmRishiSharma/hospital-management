import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAuth } from '../../store/hooks';
import { loginAdmin, clearError } from '../../store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';
import { RiArrowLeftLine } from 'react-icons/ri';
import '../user/Login.css';

const CentralAdminLogin = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { loading, error, isAuthenticated, user } = useAuth();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [redirectInfo, setRedirectInfo] = useState(null);

    useEffect(() => {
        dispatch(clearError());
    }, [dispatch]);

    useEffect(() => {
        if (isAuthenticated && user) {
            const role = user.role?.toLowerCase();
            if (role === 'centraladmin' || role === 'superadmin') {
                navigate('/supremeadmin');
            }
        }
    }, [isAuthenticated, user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        dispatch(clearError());
        setRedirectInfo(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(clearError());
        setRedirectInfo(null);
        if (!formData.email || !formData.password) return;
        const resultAction = await dispatch(loginAdmin({ email: formData.email, password: formData.password }));
        if (loginAdmin.rejected.match(resultAction)) {
            const payload = resultAction.payload;
            if (payload && payload.hospitalSlug) {
                setRedirectInfo({
                    slug: payload.hospitalSlug,
                    name: payload.hospitalName
                });
            }
        }
    };

    return (
        <section className="auth-section">
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="auth-container"
                >
                    <div className="auth-blob blob-1" />
                    <div className="auth-blob blob-2" />

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="auth-card"
                    >
                        {/* Left: Form */}
                        <div className="auth-form-container">
                            <div className="auth-box">
                                <button onClick={() => navigate('/')} className="back-button-new" type="button">
                                    <RiArrowLeftLine /> <span>Go Back</span>
                                </button>

                                <div className="hospital-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <img src="/logo.png" alt="Medical HMS Logo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                                  <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0a2647', letterSpacing: '-0.03em', fontFamily: "'Outfit', sans-serif" }}>
                                    MEDICAL<span style={{ fontWeight: '900', color: '#14b8a6' }}>HMS</span>
                                  </span>
                                </div>

                                <div className="auth-header">
                                    <h3>Supreme Portal</h3>
                                    <p>Sign in to the system administration dashboard.</p>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="error-message"
                                    >
                                        <div>{error}</div>
                                        {redirectInfo && (
                                            <div style={{
                                                marginTop: '10px',
                                                paddingTop: '8px',
                                                borderTop: '1px solid rgba(239, 68, 68, 0.2)',
                                                fontSize: '0.85rem',
                                                fontWeight: 'normal',
                                                color: '#7f1d1d'
                                            }}>
                                                Are you looking for the portal for <strong>{redirectInfo.name}</strong>?
                                                <br />
                                                <Link
                                                    to={`/login?slug=${redirectInfo.slug}`}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        color: '#b91c1c',
                                                        fontWeight: '700',
                                                        textDecoration: 'none',
                                                        marginTop: '6px',
                                                        padding: '4px 8px',
                                                        background: 'rgba(239, 68, 68, 0.1)',
                                                        borderRadius: '6px',
                                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                                                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                                                    }}
                                                >
                                                    Log In to {redirectInfo.name} &rarr;
                                                </Link>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit} className="modern-form">
                                    <div className="auth-input-group">
                                        <label>Admin Email</label>
                                        <div className="input-field-wrapper">
                                            <HiOutlineMail className="input-icon" />
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="admin@medicalhms.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="auth-input-group">
                                        <label>Secret Password</label>
                                        <div className="input-field-wrapper">
                                            <HiOutlineLockClosed className="input-icon" />
                                            <input
                                                type="password"
                                                name="password"
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button className="btn-primary btn-block" disabled={loading} style={{ marginTop: '1rem' }}>
                                        {loading ? <span className="loader-dots">Authenticating...</span> : 'Access System Control →'}
                                    </button>
                                </form>

                                <div className="auth-footer-note">
                                    Enterprise Internal Control Node
                                </div>
                            </div>
                        </div>

                        {/* Right: Visual */}
                        <div className="auth-visual" style={{ background: '#020617' }}>
                            <img
                                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop"
                                alt="Central Control"
                                className="auth-hero-img"
                                style={{ opacity: 0.3 }}
                            />
                            <div className="auth-visual-overlay"></div>
                            <div className="auth-content">
                                <div className="visual-badge" style={{ color: '#06b6d4', background: 'rgba(6,182,212,0.1)', borderColor: 'rgba(6,182,212,0.3)' }}>
                                    System Core
                                </div>
                                <h2>Global Oversight.</h2>
                                <p>Manage all clinical instances, audit logs, and provider performance from the unified central command.</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </section>
    );
};

export default CentralAdminLogin;
