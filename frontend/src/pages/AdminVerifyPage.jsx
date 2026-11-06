import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import {
  FileCheck,
  Search,
  ExternalLink,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const CERTIFICATE_TYPES = [
  'All',
  'Workshop',
  'Internship',
  'NPTEL',
  'Seminar',
  'Hackathon',
  'Sports',
  'Technical Competition',
  'Other',
];

const AdminVerifyPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Verify/Reject Modal State
  const [selectedCert, setSelectedCert] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('Verified');
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Delete Modal State
  const [deletingCert, setDeletingCert] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (typeFilter !== 'All') params.type = typeFilter;

      const res = await api.get('/admin/certificates', { params });
      if (res.data.success) {
        setCertificates(res.data.certificates);
      }
    } catch {
      console.warn('Certificate queue request failed.');
      setError('Failed to fetch certificates from MongoDB Atlas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCertificates();
  };

  // Open Verify Modal
  const openVerifyModal = (cert, defaultStatus = 'Verified') => {
    setSelectedCert(cert);
    setVerificationStatus(defaultStatus);
    setRemarks(
      cert.latestVerification?.remarks ||
        (defaultStatus === 'Verified'
          ? 'Certificate authenticated and verified successfully.'
          : 'Submission rejected due to incomplete or unverified credentials.')
    );
  };

  // Submit Verification Decision
  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCert) return;

    setActionLoading(true);
    try {
      const res = await api.put(`/admin/certificates/${selectedCert._id}/verify`, {
        status: verificationStatus,
        remarks: remarks.trim(),
      });

      if (res.data.success) {
        setNotification(
          `Certificate "${selectedCert.certificateTitle}" marked as ${verificationStatus}. Logged to Verification collection.`
        );
        setSelectedCert(null);
        fetchCertificates();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update certificate verification status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Delete Certificate
  const handleDeleteSubmit = async () => {
    if (!deletingCert) return;
    setDeleteLoading(true);
    try {
      const res = await api.delete(`/admin/certificates/${deletingCert._id}`);
      if (res.data.success) {
        setNotification(`Certificate record deleted from Atlas.`);
        setDeletingCert(null);
        fetchCertificates();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete certificate.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Certificate Verification Queue</h1>
          <p className="page-subtitle">
            Review student credentials, authenticate claims, approve or reject with audit remarks
          </p>
        </div>
      </div>

      {notification && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} className="filter-bar" style={{ margin: 0 }}>
          <div className="search-input-wrapper">
            <Search size={18} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by student name, cert title, or certificate number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              className="form-control filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Verified">Verified</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              className="form-control filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {CERTIFICATE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === 'All' ? 'All Types' : t}
                </option>
              ))}
            </select>

            <button type="submit" className="btn btn-secondary">
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Verification Data Table */}
      <div className="card">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            Retrieving certificate verification queue from MongoDB Atlas...
          </div>
        ) : certificates.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            <FileCheck size={48} color="var(--slate-300)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Certificates Found</h3>
            <p>No certificate submissions match your search/filter parameters.</p>
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
                  <th>Certificate Number</th>
                  <th>Issue Date</th>
                  <th>Current Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((cert) => (
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
                      <div style={{ fontWeight: 600 }}>{cert.studentId?.name || 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                        ID: {cert.studentId?.userId}
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
                      <div className="actions-cell">
                        {/* Verify / Review button */}
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => openVerifyModal(cert, 'Verified')}
                          title="Verify or Reject with Remarks"
                        >
                          <FileCheck size={14} /> Audit
                        </button>

                        {/* View full details */}
                        <Link
                          to={`/certificates/${cert._id}`}
                          className="btn btn-secondary btn-sm"
                          title="View Full Certificate Card"
                        >
                          <ExternalLink size={14} />
                        </Link>

                        {/* Admin delete */}
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => setDeletingCert(cert)}
                          title="Delete Certificate"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verify / Reject Modal */}
      <Modal
        isOpen={!!selectedCert}
        onClose={() => setSelectedCert(null)}
        title="Audit Certificate Submission"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSelectedCert(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`btn ${
                verificationStatus === 'Verified'
                  ? 'btn-success'
                  : verificationStatus === 'Rejected'
                  ? 'btn-danger'
                  : 'btn-primary'
              }`}
              onClick={handleVerificationSubmit}
              disabled={actionLoading}
            >
              {actionLoading
                ? 'Saving to MongoDB...'
                : `Confirm ${verificationStatus}`}
            </button>
          </>
        }
      >
        {selectedCert && (
          <form onSubmit={handleVerificationSubmit}>
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--slate-50)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                border: '1px solid var(--slate-200)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--slate-900)' }}>
                {selectedCert.certificateTitle}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '4px' }}>
                Student: <strong>{selectedCert.studentId?.name}</strong> ({selectedCert.studentId?.email})
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                Org: {selectedCert.organization} | Cert No: <code>{selectedCert.certificateNumber}</code>
              </div>
            </div>

            {/* Verification Status Choice */}
            <div className="form-group">
              <label className="form-label">
                Decision Status <span className="required">*</span>
              </label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    color: 'var(--success)',
                  }}
                >
                  <input
                    type="radio"
                    name="status"
                    value="Verified"
                    checked={verificationStatus === 'Verified'}
                    onChange={(e) => setVerificationStatus(e.target.value)}
                  />
                  Mark as Verified
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    color: 'var(--danger)',
                  }}
                >
                  <input
                    type="radio"
                    name="status"
                    value="Rejected"
                    checked={verificationStatus === 'Rejected'}
                    onChange={(e) => setVerificationStatus(e.target.value)}
                  />
                  Mark as Rejected
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    color: 'var(--warning)',
                  }}
                >
                  <input
                    type="radio"
                    name="status"
                    value="Pending"
                    checked={verificationStatus === 'Pending'}
                    onChange={(e) => setVerificationStatus(e.target.value)}
                  />
                  Leave Pending
                </label>
              </div>
            </div>

            {/* Remarks input */}
            <div className="form-group">
              <label className="form-label">
                Verification Remarks / Feedback <span className="required">*</span>
              </label>
              <textarea
                className="form-control"
                placeholder="Enter remarks visible to the student and public verifiers..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                required
              />
              <span className="form-helper">
                This remark will be permanently logged in the MongoDB Verification collection with your admin ID and timestamp.
              </span>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingCert}
        onClose={() => setDeletingCert(null)}
        title="Admin Delete Certificate"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setDeletingCert(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteSubmit}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete Certificate'}
            </button>
          </>
        }
      >
        <p>Are you sure you want to delete this certificate and all of its verification history?</p>
        <div style={{ margin: '1rem 0', fontWeight: 600 }}>{deletingCert?.certificateTitle}</div>
      </Modal>
    </div>
  );
};

export default AdminVerifyPage;
