import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  BarChart3,
  Download,
  Printer,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Award,
  RefreshCw,
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

const escapeCsvCell = (value) => {
  let text = String(value ?? '');
  if (/^[\u0000-\u0020]*[=+\-@]/.test(text)) {
    text = `'${text}`;
  }
  return `"${text.replace(/"/g, '""')}"`;
};

const AdminReportsPage = () => {
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
    generatedAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Report Filters
  const [status, setStatus] = useState('All');
  const [type, setType] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (status !== 'All') params.status = status;
      if (type !== 'All') params.type = type;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/admin/reports', { params });
      if (res.data.success) {
        setReportData(res.data.reportData);
        setSummary(res.data.summary);
      }
    } catch {
      console.warn('Certificate report request failed.');
      setError('Failed to generate report from MongoDB Atlas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [status, type]);

  // Export CSV
  const handleExportCSV = () => {
    if (!reportData || reportData.length === 0) {
      alert('No data available to export.');
      return;
    }

    const headers = [
      'Certificate ID',
      'Certificate Number',
      'Title',
      'Type',
      'Organization',
      'Student Name',
      'Student Email',
      'Issue Date',
      'Status',
      'Verified By',
      'Remarks',
    ];

    const csvRows = [headers.map(escapeCsvCell).join(',')];

    reportData.forEach((row) => {
      const values = [
        row.certificateId,
        row.certificateNumber,
        row.title,
        row.type,
        row.organization,
        row.studentName,
        row.studentEmail,
        row.issueDate ? new Date(row.issueDate).toLocaleDateString() : '',
        row.status,
        row.verifiedBy,
        row.remarks,
      ];
      csvRows.push(values.map(escapeCsvCell).join(','));
    });

    const csvContent = new Blob([`\uFEFF${csvRows.join('\r\n')}`], {
      type: 'text/csv;charset=utf-8',
    });
    const downloadUrl = URL.createObjectURL(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', downloadUrl);
    link.setAttribute(
      'download',
      `Certificate_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Certificate Audit & Verification Reports</h1>
          <p className="page-subtitle">
            Generate customized compliance reports, filter criteria, and export to CSV or PDF
          </p>
        </div>

        <div className="no-print" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={handleExportCSV} className="btn btn-primary" disabled={reportData.length === 0}>
            <Download size={16} /> Export to CSV
          </button>
          <button onClick={handlePrint} className="btn btn-secondary">
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger no-print">{error}</div>}

      {/* Filter Controls */}
      <div className="card no-print" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 600 }}>
          <Filter size={18} color="var(--primary)" />
          <span>Report Filter Parameters</span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '160px' }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Verification Status</label>
            <select
              className="form-control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Verified">Verified Only</option>
              <option value="Pending">Pending Only</option>
              <option value="Rejected">Rejected Only</option>
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '160px' }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Certificate Type</label>
            <select
              className="form-control"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {CERTIFICATE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === 'All' ? 'All Types' : t}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '160px' }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Issue Date From</label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div style={{ flex: 1, minWidth: '160px' }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Issue Date To</label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div>
            <button type="button" onClick={fetchReport} className="btn btn-secondary">
              <RefreshCw size={14} /> Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon blue">
            <Award size={24} />
          </div>
          <div>
            <div className="stat-value">{summary.total}</div>
            <div className="stat-label">Filtered Certificates</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="stat-value">{summary.verified}</div>
            <div className="stat-label">Verified ({summary.total ? Math.round((summary.verified / summary.total) * 100) : 0}%)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-value">{summary.pending}</div>
            <div className="stat-label">Pending Review</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <XCircle size={24} />
          </div>
          <div>
            <div className="stat-value">{summary.rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <BarChart3 size={20} color="var(--primary)" />
            Generated Report Records
          </h2>
          {summary.generatedAt && (
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>
              Generated on: {new Date(summary.generatedAt).toLocaleString()}
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            Querying MongoDB Atlas database...
          </div>
        ) : reportData.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            No certificate records found for the selected criteria.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Reg Number</th>
                  <th>Title</th>
                  <th>Student Name</th>
                  <th>Type</th>
                  <th>Organization</th>
                  <th>Issue Date</th>
                  <th>Status</th>
                  <th>Verified By</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, idx) => (
                  <tr key={idx}>
                    <td>
                      <code>{row.certificateNumber}</code>
                    </td>
                    <td>
                      <strong>{row.title}</strong>
                    </td>
                    <td>{row.studentName}</td>
                    <td>
                      <span className="badge badge-type">{row.type}</span>
                    </td>
                    <td>{row.organization}</td>
                    <td>{row.issueDate ? new Date(row.issueDate).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <StatusBadge status={row.status} />
                    </td>
                    <td>{row.verifiedBy || 'Pending Review'}</td>
                    <td style={{ maxWidth: '220px', fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                      {row.remarks || '-'}
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

export default AdminReportsPage;
