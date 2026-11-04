import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Info, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect to appropriate dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await login(email, password);
      if (data.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please verify your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper to fill demo admin credentials for testing
  const fillAdminCredentials = () => {
    setEmail('admin@certverify.edu');
    setPassword('Admin@123456');
    setError('');
  };

  return (
    <div className="container-narrow" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
      <div className="card" style={{ maxWidth: '460px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '0.75rem',
              borderRadius: '50%',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              marginBottom: '0.75rem',
            }}
          >
            <LogIn size={28} />
          </div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>Portal Sign In</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
            Access student certificate tools or administrative review
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Password <span className="required">*</span>
            </label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--slate-200)',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: 'var(--slate-600)',
          }}
        >
          New Student?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Register here
          </Link>
        </div>

        {/* Quick Demo Seed helper for examiner / evaluation */}
        <div
          style={{
            marginTop: '1.25rem',
            padding: '0.85rem',
            backgroundColor: 'var(--slate-50)',
            border: '1px dashed var(--slate-300)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem',
            color: 'var(--slate-600)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            <ShieldCheck size={16} color="var(--primary)" />
            <span>Administrator Quick Test:</span>
          </div>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: 'var(--slate-500)' }}>
            After running <code>npm run seed</code> in backend:
          </p>
          <button
            type="button"
            onClick={fillAdminCredentials}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', width: '100%' }}
          >
            Auto-Fill Admin Credentials (admin@certverify.edu)
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
