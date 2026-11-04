import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Users, Search, Award, CheckCircle2, Clock, XCircle, ArrowLeft } from 'lucide-react';

const AdminStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/students');
      if (res.data.success) {
        setStudents(res.data.students);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
      setError('Failed to retrieve registered students from MongoDB Atlas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.userId && s.userId.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Registered Students Directory</h1>
          <p className="page-subtitle">
            All registered student accounts and certificate submission statistics stored in MongoDB Atlas
          </p>
        </div>
        <Link to="/admin/dashboard" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Search Input */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            className="form-control"
            placeholder="Search students by name, email, or student ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="card">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            Loading student accounts from MongoDB Atlas...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            <Users size={48} color="var(--slate-300)" style={{ margin: '0 auto 1rem' }} />
            <p>No registered students found matching your search.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Registered On</th>
                  <th>Total Submissions</th>
                  <th>Verified</th>
                  <th>Pending</th>
                  <th>Rejected</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id}>
                    <td>
                      <code style={{ background: 'var(--slate-100)', padding: '3px 8px', borderRadius: '4px' }}>
                        {student.userId || 'N/A'}
                      </code>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--slate-900)' }}>{student.name}</strong>
                    </td>
                    <td>{student.email}</td>
                    <td>{new Date(student.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className="badge badge-type">
                        {student.certificates?.total || 0}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-verified" style={{ fontSize: '0.75rem' }}>
                        {student.certificates?.verified || 0}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-pending" style={{ fontSize: '0.75rem' }}>
                        {student.certificates?.pending || 0}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-rejected" style={{ fontSize: '0.75rem' }}>
                        {student.certificates?.rejected || 0}
                      </span>
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

export default AdminStudentsPage;
