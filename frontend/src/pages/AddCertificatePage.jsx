import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { PlusCircle, Award, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

const CERTIFICATE_TYPES = [
  'Workshop',
  'Internship',
  'NPTEL',
  'Seminar',
  'Hackathon',
  'Sports',
  'Technical Competition',
  'Other',
];

const AddCertificatePage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    certificateTitle: '',
    certificateType: 'Workshop',
    organization: '',
    issueDate: '',
    certificateNumber: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { certificateTitle, certificateType, organization, issueDate, certificateNumber } = formData;

    if (!certificateTitle || !certificateType || !organization || !issueDate || !certificateNumber) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await api.post('/certificates', formData);
      if (res.data.success) {
        setSuccessMessage(
          'Certificate submitted successfully! Initial status set to Pending verification.'
        );
        setTimeout(() => {
          navigate('/student/my-certificates');
        }, 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to submit certificate to MongoDB. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-narrow">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/student/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--slate-600)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
            }}
          >
            <PlusCircle size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Add New Certificate</h1>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', margin: 0 }}>
              Submit your credential details for administrative review and official verification
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Certificate Title */}
          <div className="form-group">
            <label className="form-label">
              Certificate Title <span className="required">*</span>
            </label>
            <input
              type="text"
              name="certificateTitle"
              className="form-control"
              placeholder="e.g. Full Stack Web Development BootCamp / Python for Data Science"
              value={formData.certificateTitle}
              onChange={handleChange}
              required
            />
            <span className="form-helper">The official course, event, or certification title</span>
          </div>

          <div className="form-row">
            {/* Certificate Type */}
            <div className="form-group">
              <label className="form-label">
                Certificate Type <span className="required">*</span>
              </label>
              <select
                name="certificateType"
                className="form-control"
                value={formData.certificateType}
                onChange={handleChange}
                required
              >
                {CERTIFICATE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Issuing Organization */}
            <div className="form-group">
              <label className="form-label">
                Issuing Organization <span className="required">*</span>
              </label>
              <input
                type="text"
                name="organization"
                className="form-control"
                placeholder="e.g. IIT Madras, NPTEL, Coursera, IBM"
                value={formData.organization}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            {/* Issue Date */}
            <div className="form-group">
              <label className="form-label">
                Issue Date <span className="required">*</span>
              </label>
              <input
                type="date"
                name="issueDate"
                className="form-control"
                value={formData.issueDate}
                onChange={handleChange}
                required
              />
            </div>

            {/* Certificate Number */}
            <div className="form-group">
              <label className="form-label">
                Certificate / Registration Number <span className="required">*</span>
              </label>
              <input
                type="text"
                name="certificateNumber"
                className="form-control"
                placeholder="e.g. NPTEL24CS99S8, CERT-998124"
                value={formData.certificateNumber}
                onChange={handleChange}
                required
              />
              <span className="form-helper">Must be unique as printed on the certificate document</span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end',
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--slate-200)',
            }}
          >
            <Link to="/student/dashboard" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving to Atlas...' : 'Submit for Verification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCertificatePage;
