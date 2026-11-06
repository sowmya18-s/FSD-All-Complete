import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  Award,
  ShieldCheck,
  Search,
  Users,
  Database,
  ArrowRight,
} from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated, isStudent, isAdmin } = useAuth();

  // Public certificate lookup state
  const [certNumberQuery, setCertNumberQuery] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError] = useState('');

  const handlePublicSearch = async (e) => {
    e.preventDefault();
    if (!certNumberQuery.trim()) return;

    setLookupLoading(true);
    setLookupError('');
    setLookupResult(null);

    try {
      const res = await api.get(`/certificates/public-verify/${encodeURIComponent(certNumberQuery.trim())}`);
      if (res.data.success && res.data.found) {
        setLookupResult(res.data.certificate);
      } else {
        setLookupError('No certificate found with this registration number.');
      }
    } catch (err) {
      setLookupError(
        err.response?.data?.message || 'Certificate not found or verification error occurred.'
      );
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-pill">
          <ShieldCheck size={16} />
          MongoDB Atlas Cloud Powered Verification
        </div>
        <h1 className="hero-title">
          Verify Academic & Professional <span>Certificates</span> Instantly
        </h1>
        <p className="hero-desc">
          A dedicated MERN stack verification ecosystem. Students submit academic credentials,
          and academic administrators audit, verify, or reject submissions with full transparency.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {isAuthenticated ? (
            isStudent ? (
              <Link to="/student/dashboard" className="btn btn-primary btn-lg">
                Go to Student Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <Link to="/admin/dashboard" className="btn btn-primary btn-lg">
                Go to Admin Dashboard <ArrowRight size={18} />
              </Link>
            )
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">
                Student Registration <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Public Live Certificate Verification Tool */}
      <section id="public-verify" className="container" style={{ marginBottom: '3.5rem' }}>
        <div className="hero-search-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <Search size={22} color="var(--primary)" />
            <h2 style={{ fontSize: '1.35rem', margin: 0 }}>Public Certificate Lookup</h2>
          </div>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Employers, colleges, or evaluators can verify the authenticity and status of any certificate
            using its unique certificate registration number.
          </p>

          <form onSubmit={handlePublicSearch}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Certificate Number (e.g. NPTEL-2024-9981 or CERT-ABC)"
                  value={certNumberQuery}
                  onChange={(e) => setCertNumberQuery(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={lookupLoading}
              >
                {lookupLoading ? 'Verifying...' : 'Verify Certificate'}
              </button>
            </div>
          </form>

          {/* Lookup Error Message */}
          {lookupError && (
            <div className="alert alert-danger" style={{ marginTop: '1.25rem' }}>
              {lookupError}
            </div>
          )}

          {/* Lookup Result Box */}
          {lookupResult && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1.5rem',
                border: '1px solid var(--slate-200)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--slate-50)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  borderBottom: '1px solid var(--slate-200)',
                  paddingBottom: '0.75rem',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)' }}>
                    {lookupResult.certificateTitle}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                    Reg No: <strong>{lookupResult.certificateNumber}</strong>
                  </span>
                </div>
                <div>
                  <StatusBadge status={lookupResult.verificationStatus} />
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                  fontSize: '0.9rem',
                }}
              >
                <div>
                  <span style={{ color: 'var(--slate-500)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Student Name
                  </span>
                  <div style={{ fontWeight: 600 }}>{lookupResult.studentName}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--slate-500)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Issuing Organization
                  </span>
                  <div style={{ fontWeight: 600 }}>{lookupResult.organization}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--slate-500)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Certificate Type
                  </span>
                  <div style={{ fontWeight: 600 }}>{lookupResult.certificateType}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--slate-500)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Issue Date
                  </span>
                  <div style={{ fontWeight: 600 }}>
                    {new Date(lookupResult.issueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {lookupResult.remarks && (
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: '#ffffff',
                    border: '1px solid var(--slate-200)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                  }}
                >
                  <strong style={{ color: 'var(--slate-700)' }}>Administrator Remarks: </strong>
                  <span>{lookupResult.remarks}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="container" style={{ marginBottom: '4rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
          Key Features & Architecture
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--slate-500)', marginBottom: '2.5rem' }}>
          Designed specifically for college mini projects with production-grade MERN principles.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-box">
              <Database size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>MongoDB Atlas Cloud</h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem' }}>
              Permanent, remote cloud storage using Mongoose schemas. Collections for Users, Certificates,
              and Verification audit trails.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <Award size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Student Self-Service</h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem' }}>
              Add certificate details for NPTEL, Hackathons, Internships, Workshops, and Seminars. Track real-time
              verification progress.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Admin Audit Workflow</h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem' }}>
              Authorized administrators can audit submissions, append verification remarks, approve or reject,
              and generate downloadable reports.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
