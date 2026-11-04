import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, AlertCircle, Shield } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(name, email, password);
      navigate('/student/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please check your information.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-narrow" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div className="card" style={{ maxWidth: '480px', margin: '0 auto', padding: '2rem' }}>
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
            <UserPlus size={28} />
          </div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>Student Registration</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
            Create an account to submit and manage your certificates
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
              Full Name <span className="required">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="e.g. student@college.edu"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Password <span className="required">*</span>
            </label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Confirm Password <span className="required">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              placeholder="Re-type your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register as Student'}
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
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Log in here
          </Link>
        </div>

        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: 'var(--slate-50)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            color: 'var(--slate-500)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Shield size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
          <span>
            Admin accounts are securely seeded by system administrators and cannot be created via public registration.
          </span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
