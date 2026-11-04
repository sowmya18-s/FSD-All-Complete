import React from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'Verified':
      return (
        <span className="badge badge-verified">
          <CheckCircle2 size={14} />
          Verified
        </span>
      );
    case 'Rejected':
      return (
        <span className="badge badge-rejected">
          <XCircle size={14} />
          Rejected
        </span>
      );
    case 'Pending':
    default:
      return (
        <span className="badge badge-pending">
          <Clock size={14} />
          Pending
        </span>
      );
  }
};

export default StatusBadge;
