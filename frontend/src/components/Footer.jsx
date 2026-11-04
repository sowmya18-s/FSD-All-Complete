import React from 'react';
import { Award, ShieldCheck, Database, Layers } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ color: 'var(--primary)', display: 'flex' }}>
            <Award size={20} />
          </div>
          <div>
            <strong>Digital Certificate Verification Portal</strong>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--slate-400)' }}>
              A College Mini-Project built with MongoDB Atlas, Express.js, React, & Node.js
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.8rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Database size={14} color="#16a34a" /> MongoDB Atlas Cloud
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} color="#2563eb" /> JWT Authentication
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Layers size={14} color="#7c3aed" /> Full MERN Stack
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
