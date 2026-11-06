import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import {
  Users,
  Award,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCertificates: 0,
    verifiedCertificates: 0,
    pendingCertificates: 0,
    rejectedCertificates: 0,
  });
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/dashboard-stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentSubmissions(res.data.recentSubmissions || []);
      }
    } catch {
      console.warn('Administrator dashboard request failed.');
      setError('Failed to fetch administrator statistics from MongoDB Atlas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  return (
    <div className="container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 className="page-title">Administrator Dashboard</h1>
            <span className="badge role-admin" style={{ fontSize: '0.8rem' }}>
              System Authority
            </span>
          </div>
          <p className="page-subtitle">
            Welcome, <strong>{user?.name}</strong>. Monitor platform activity, audit student credentials, and issue verifications.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/admin/verify" className="btn btn-primary">
            <FileCheck size={18} />
            Verify Certificates
          </Link>
          <Link to="/admin/students" className="btn btn-secondary">
            <Users size={18} />
            View Students
          </Link>
          <Link to="/admin/reports" className="btn btn-secondary">
            <BarChart3 size={18} />
            Generate Reports
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Real-time Atlas Statistics Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Registered Students"
          value={stats.totalStudents}
          icon={Users}
          color="purple"
          subtitle="Active student accounts"
        />
        <StatCard
          title="Total Certificates"
          value={stats.totalCertificates}
          icon={Award}
          color="blue"
          subtitle="All submissions"
        />
        <StatCard
          title="Pending Verification"
          value={stats.pendingCertificates}
          icon={Clock}
          color="amber"
          subtitle="Needs administrative review"
        />
        <StatCard
          title="Verified Certificates"
          value={stats.verifiedCertificates}
          icon={CheckCircle2}
          color="green"
          subtitle="Approved credentials"
        />
        <StatCard
          title="Rejected Certificates"
          value={stats.rejectedCertificates}
          icon={XCircle}
          color="red"
          subtitle="Declined submissions"
        />
      </div>

      {/* Recent Submissions Audit Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Clock size={20} color="var(--primary)" />
            Recent Certificate Submissions
          </h2>
          <Link to="/admin/verify" className="btn btn-secondary btn-sm">
            Open Full Verification Queue <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            Loading submissions from MongoDB Atlas...
          </div>
        ) : recentSubmissions.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            No certificate submissions in the database yet.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Certificate Title</th>
                  <th>Student Name</th>
                  <th>Type</th>
                  <th>Organization</th>
                  <th>Certificate No.</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentSubmissions.map((cert) => (
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
                      <div style={{ fontWeight: 500 }}>{cert.studentId?.name || 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                        {cert.studentId?.email}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-type">{cert.certificateType}</span>
                    </td>
                    <td>{cert.organization}</td>
                    <td>
                      <code>{cert.certificateNumber}</code>
                    </td>
                    <td>
                      <StatusBadge status={cert.verificationStatus} />
                    </td>
                    <td>
                      <Link
                        to="/admin/verify"
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.8rem' }}
                      >
                        Review / Audit
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

export default AdminDashboard;
