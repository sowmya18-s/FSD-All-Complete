import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        {Icon && <Icon size={26} />}
      </div>
      <div>
        <div className="stat-value">{value !== undefined ? value : 0}</div>
        <div className="stat-label">{title}</div>
        {subtitle && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{subtitle}</div>}
      </div>
    </div>
  );
};

export default StatCard;
