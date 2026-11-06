import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import {
  Award,
  CheckCircle2,
  Clock,
  XCircle,
  PlusCircle,
  FileText,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
  });
  const [recentCertificates, setRecentCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/certificates/student-stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentCertificates(res.data.recentCertificates || []);
      }
    } catch {
      console.warn('Dashboard request failed.');
      setError('Unable to load dashboard data from MongoDB. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name}!</h1>
          <p className="page-subtitle">
            Student ID: <strong>{user?.userId || 'N/A'}</strong> | Manage and track your verified credentials
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/student/add-certificate" className="btn btn-primary">
            <PlusCircle size={18} />
            Add Certificate
          </Link>
          <Link to="/student/my-certificates" className="btn btn-secondary">
            <FileText size={18} />
            My Certificates
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Real-time MongoDB Statistics Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Certificates"
          value={stats.total}
          icon={Award}
          color="blue"
          subtitle="All submitted credentials"
        />
        <StatCard
          title="Verified Certificates"
          value={stats.verified}
          icon={CheckCircle2}
          color="green"
          subtitle="Approved by administrators"
        />
        <StatCard
          title="Pending Certificates"
          value={stats.pending}
          icon={Clock}
          color="amber"
          subtitle="Awaiting administrative review"
        />
        <StatCard
          title="Rejected Certificates"
          value={stats.rejected}
          icon={XCircle}
          color="red"
          subtitle="Action or correction required"
        />
      </div>

      {/* Recent Certificates Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Clock size={20} color="var(--primary)" />
            Recent Certificates
          </h2>
          <Link
            to="/student/my-certificates"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            View All Certificates <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            Loading certificates from MongoDB Atlas...
          </div>
        ) : recentCertificates.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
            <Award size={48} color="var(--slate-300)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Certificates Added Yet</h3>
            <p style={{ color: 'var(--slate-500)', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              Upload your academic and extracurricular certificates (Workshop, Internship, NPTEL, etc.) to get them verified.
            </p>
            <Link to="/student/add-certificate" className="btn btn-primary">
              <PlusCircle size={18} /> Add Your First Certificate
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Certificate Title</th>
                  <th>Type</th>
                  <th>Organization</th>
                  <th>Certificate No.</th>
                  <th>Issue Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentCertificates.map((cert) => (
                  <tr key={cert._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>
                        {cert.certificateTitle}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                        ID: {cert.certificateId}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-type">{cert.certificateType}</span>
                    </td>
                    <td>{cert.organization}</td>
                    <td>
                      <code style={{ background: 'var(--slate-100)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>
                        {cert.certificateNumber}
                      </code>
                    </td>
                    <td>
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </td>
                    <td>
                      <StatusBadge status={cert.verificationStatus} />
                    </td>
                    <td>
                      <Link
                        to={`/certificates/${cert._id}`}
                        className="btn btn-secondary btn-sm"
                        title="View Certificate Details"
                      >
                        <ExternalLink size={14} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
