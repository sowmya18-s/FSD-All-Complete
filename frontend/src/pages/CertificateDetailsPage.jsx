import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  Award,
  ArrowLeft,
  ShieldCheck,
  Printer,
} from 'lucide-react';

const CertificateDetailsPage = () => {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [certificate, setCertificate] = useState(null);
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCertificateDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/certificates/${id}`);
        if (res.data.success) {
          setCertificate(res.data.certificate);
          setVerificationHistory(res.data.verificationHistory || []);
        }
      } catch {
        console.warn('Certificate details request failed.');
        setError(
          err.response?.data?.message || 'Failed to retrieve certificate details from database.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCertificateDetails();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p style={{ color: 'var(--slate-500)', fontSize: '1.1rem' }}>
          Loading certificate verification details...
        </p>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="container-narrow" style={{ paddingTop: '3rem' }}>
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          {error || 'Certificate not found.'}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
        >
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      {/* Top action bar */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <button
          onClick={() => navigate(isAdmin ? '/admin/verify' : '/student/dashboard')}
          className="btn btn-secondary btn-sm"
        >
          <ArrowLeft size={16} />
          {isAdmin ? 'Back to Verification Queue' : 'Back to Dashboard'}
        </button>

        <button onClick={handlePrint} className="btn btn-outline-primary btn-sm">
          <Printer size={16} /> Print / Save PDF
        </button>
      </div>

      {/* Main Certificate Card Display */}
      <div className="certificate-display-card">
        <div className="certificate-watermark">
          <Award size={240} />
        </div>

        <div className="cert-top-bar">
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                color: 'var(--primary)',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              Academic Credential Document
            </span>
            <h1 style={{ fontSize: '1.75rem', marginTop: '0.2rem', color: 'var(--slate-900)' }}>
              {certificate.certificateTitle}
            </h1>
          </div>
          <div>
            <StatusBadge status={certificate.verificationStatus} />
          </div>
        </div>

        {/* Certificate Metadata Grid */}
        <div className="cert-meta-grid">
          <div className="cert-meta-item">
            <div className="label">Certificate Number</div>
            <div className="value">
              <code>{certificate.certificateNumber}</code>
            </div>
          </div>

          <div className="cert-meta-item">
            <div className="label">System Certificate ID</div>
            <div className="value">{certificate.certificateId}</div>
          </div>

          <div className="cert-meta-item">
            <div className="label">Certificate Type</div>
            <div className="value">{certificate.certificateType}</div>
          </div>

          <div className="cert-meta-item">
            <div className="label">Issuing Organization</div>
            <div className="value">{certificate.organization}</div>
          </div>

          <div className="cert-meta-item">
            <div className="label">Student Name</div>
            <div className="value">{certificate.studentId?.name || 'N/A'}</div>
          </div>

          <div className="cert-meta-item">
            <div className="label">Student ID / Email</div>
            <div className="value" style={{ fontSize: '0.9rem' }}>
              {certificate.studentId?.userId} ({certificate.studentId?.email})
            </div>
          </div>

          <div className="cert-meta-item">
            <div className="label">Issue Date</div>
            <div className="value">
              {new Date(certificate.issueDate).toLocaleDateString()}
            </div>
          </div>

          <div className="cert-meta-item">
            <div className="label">Date Submitted</div>
            <div className="value">
              {new Date(certificate.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Verification Audit Trail Section */}
        <div style={{ marginTop: '2rem' }}>
          <h2
            style={{
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <ShieldCheck size={20} color="var(--primary)" />
            Verification History & Audit Trail
          </h2>

          {verificationHistory.length === 0 ? (
            <div
              style={{
                padding: '1rem',
                background: 'var(--slate-50)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--slate-500)',
                fontSize: '0.9rem',
              }}
            >
              This certificate has not yet been reviewed by an administrator. Status remains{' '}
              <strong>Pending</strong>.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {verificationHistory.map((ver, idx) => (
                <div
                  key={ver._id || idx}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--slate-200)',
                    backgroundColor: '#ffffff',
                    borderLeft: `4px solid ${
                      certificate.verificationStatus === 'Verified'
                        ? 'var(--success)'
                        : certificate.verificationStatus === 'Rejected'
                        ? 'var(--danger)'
                        : 'var(--warning)'
                    }`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <strong style={{ color: 'var(--slate-900)' }}>
                        Audited by: {ver.verifiedBy?.name || 'Administrator'}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginLeft: '8px' }}>
                        ({ver.verifiedBy?.email})
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                      {new Date(ver.verificationDate || ver.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {ver.remarks ? (
                    <div
                      style={{
                        padding: '0.5rem 0.75rem',
                        background: 'var(--slate-50)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        color: 'var(--slate-700)',
                      }}
                    >
                      <strong>Remarks:</strong> {ver.remarks}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: 'var(--slate-400)' }}>
                      No specific remarks recorded.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateDetailsPage;
