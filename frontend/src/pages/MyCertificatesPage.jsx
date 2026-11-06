import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  Edit2,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
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

const MyCertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Edit Modal State
  const [editingCert, setEditingCert] = useState(null);
  const [editFormData, setEditFormData] = useState({
    certificateTitle: '',
    certificateType: '',
    organization: '',
    issueDate: '',
    certificateNumber: '',
  });
  const [editLoading, setEditLoading] = useState(false);

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

      const res = await api.get('/certificates/my', { params });
      if (res.data.success) {
        setCertificates(res.data.certificates);
      }
    } catch {
      console.warn('Certificate list request failed.');
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

  // Open Edit Modal
  const openEditModal = (cert) => {
    setEditingCert(cert);
    setEditFormData({
      certificateTitle: cert.certificateTitle,
      certificateType: cert.certificateType,
      organization: cert.organization,
      issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : '',
      certificateNumber: cert.certificateNumber,
    });
  };

  // Submit Edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const res = await api.put(`/certificates/${editingCert._id}`, editFormData);
      if (res.data.success) {
        setNotification('Certificate updated successfully! Status reset to Pending for admin re-verification.');
        setEditingCert(null);
        fetchCertificates();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update certificate.');
    } finally {
      setEditLoading(false);
    }
  };

  // Submit Delete
  const handleDeleteSubmit = async () => {
    if (!deletingCert) return;
    setDeleteLoading(true);
    try {
      const res = await api.delete(`/certificates/${deletingCert._id}`);
      if (res.data.success) {
        setNotification('Certificate record deleted successfully.');
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
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Certificates</h1>
          <p className="page-subtitle">
            Manage your submitted credentials, track review remarks, and edit records
          </p>
        </div>
        <Link to="/student/add-certificate" className="btn btn-primary">
          <PlusCircle size={18} /> Add New Certificate
        </Link>
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
              placeholder="Search by title, cert number, or issuing organization..."
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
              <option value="Pending">Pending</option>
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

      {/* Certificates Table */}
      <div className="card">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            Retrieving certificate records from MongoDB Atlas...
          </div>
        ) : certificates.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
            <FileText size={48} color="var(--slate-300)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Certificates Found</h3>
            <p style={{ color: 'var(--slate-500)', marginBottom: '1.5rem' }}>
              No certificates match your search and filter criteria.
            </p>
            <Link to="/student/add-certificate" className="btn btn-primary">
              <PlusCircle size={16} /> Add Certificate
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
                  <th>Admin Remarks</th>
                  <th>Actions</th>
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
                    <td style={{ maxWidth: '200px' }}>
                      {cert.latestVerification?.remarks ? (
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--slate-600)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={cert.latestVerification.remarks}
                        >
                          "{cert.latestVerification.remarks}"
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                          No remarks yet
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="actions-cell">
                        <Link
                          to={`/certificates/${cert._id}`}
                          className="btn btn-secondary btn-sm"
                          title="View Full Details"
                        >
                          <ExternalLink size={14} />
                        </Link>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(cert)}
                          title="Edit Certificate"
                        >
                          <Edit2 size={14} />
                        </button>
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

      {/* Edit Certificate Modal */}
      <Modal
        isOpen={!!editingCert}
        onClose={() => setEditingCert(null)}
        title="Edit Certificate Details"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setEditingCert(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleEditSubmit}
              disabled={editLoading}
            >
              {editLoading ? 'Saving...' : 'Save & Resubmit'}
            </button>
          </>
        }
      >
        {editingCert && (
          <form onSubmit={handleEditSubmit}>
            <div className="alert alert-warning" style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
              Updating certificate details will automatically reset the verification status back to <strong>Pending</strong> for re-review.
            </div>

            <div className="form-group">
              <label className="form-label">Certificate Title</label>
              <input
                type="text"
                className="form-control"
                value={editFormData.certificateTitle}
                onChange={(e) => setEditFormData({ ...editFormData, certificateTitle: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Certificate Type</label>
                <select
                  className="form-control"
                  value={editFormData.certificateType}
                  onChange={(e) => setEditFormData({ ...editFormData, certificateType: e.target.value })}
                >
                  {CERTIFICATE_TYPES.filter((t) => t !== 'All').map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Issuing Organization</label>
                <input
                  type="text"
                  className="form-control"
                  value={editFormData.organization}
                  onChange={(e) => setEditFormData({ ...editFormData, organization: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Issue Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={editFormData.issueDate}
                  onChange={(e) => setEditFormData({ ...editFormData, issueDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Certificate Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={editFormData.certificateNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, certificateNumber: e.target.value })}
                  required
                />
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingCert}
        onClose={() => setDeletingCert(null)}
        title="Delete Certificate Record"
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
              {deleteLoading ? 'Deleting...' : 'Permanently Delete'}
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--slate-700)' }}>
          Are you sure you want to permanently delete the certificate:
        </p>
        <div
          style={{
            margin: '1rem 0',
            padding: '1rem',
            background: 'var(--slate-50)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--slate-200)',
          }}
        >
          <strong>{deletingCert?.certificateTitle}</strong>
          <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            Reg No: {deletingCert?.certificateNumber} | {deletingCert?.organization}
          </div>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--danger)' }}>
          This will permanently remove the certificate and its verification audit trail from MongoDB Atlas.
        </p>
      </Modal>
    </div>
  );
};

export default MyCertificatesPage;
