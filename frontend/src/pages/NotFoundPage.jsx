import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
      <Award size={64} color="var(--primary)" style={{ margin: '0 auto 1.5rem', opacity: 0.6 }} />
      <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--slate-900)' }}>404</h1>
      <h2 style={{ fontSize: '1.4rem', color: 'var(--slate-700)', marginBottom: '1rem' }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--slate-500)', maxWidth: '440px', margin: '0 auto 2rem' }}>
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        <ArrowLeft size={16} /> Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
