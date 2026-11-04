import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  LayoutDashboard,
  PlusCircle,
  FileText,
  CheckCircle,
  Users,
  BarChart3,
  Search,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isStudent, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/" className="brand-link">
          <div className="brand-icon-box">
            <Award size={24} />
          </div>
          <div>
            <span>CertiVerify</span>
            <span className="brand-badge">Portal</span>
          </div>
        </Link>

        {/* Navigation items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <ul className="nav-links">
            <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} end>
              Home
            </NavLink>

            {/* Public Quick Verification Check Link */}
            <NavLink
              to="/#public-verify"
              onClick={() => {
                const el = document.getElementById('public-verify');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="nav-link"
            >
              <Search size={16} />
              Verify Check
            </NavLink>

            {/* Student Navigation Links */}
            {isAuthenticated && isStudent && (
              <>
                <NavLink
                  to="/student/dashboard"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </NavLink>
                <NavLink
                  to="/student/add-certificate"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  <PlusCircle size={16} />
                  Add Certificate
                </NavLink>
                <NavLink
                  to="/student/my-certificates"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  <FileText size={16} />
                  My Certificates
                </NavLink>
              </>
            )}

            {/* Admin Navigation Links */}
            {isAuthenticated && isAdmin && (
              <>
                <NavLink
                  to="/admin/dashboard"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </NavLink>
                <NavLink
                  to="/admin/verify"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  <CheckCircle size={16} />
                  Verify Certificates
                </NavLink>
                <NavLink
                  to="/admin/students"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  <Users size={16} />
                  Students
                </NavLink>
                <NavLink
                  to="/admin/reports"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  <BarChart3 size={16} />
                  Reports
                </NavLink>
              </>
            )}
          </ul>

          {/* User Profile or Auth Action */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isAuthenticated ? (
              <>
                <div className="nav-user-pill">
                  <span>{user?.name}</span>
                  <span className={`user-role-tag ${isAdmin ? 'role-admin' : 'role-student'}`}>
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  title="Sign Out"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  <LogIn size={15} />
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  <UserPlus size={15} />
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
