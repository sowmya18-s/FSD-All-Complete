import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import AddCertificatePage from './pages/AddCertificatePage';
import MyCertificatesPage from './pages/MyCertificatesPage';
import CertificateDetailsPage from './pages/CertificateDetailsPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminVerifyPage from './pages/AdminVerifyPage';
import AdminStudentsPage from './pages/AdminStudentsPage';
import AdminReportsPage from './pages/AdminReportsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-layout">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Certificate Details (Accessible by Owner Student or Admin) */}
              <Route
                path="/certificates/:id"
                element={
                  <ProtectedRoute allowedRoles={['student', 'admin']}>
                    <CertificateDetailsPage />
                  </ProtectedRoute>
                }
              />

              {/* Student Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/add-certificate"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <AddCertificatePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/my-certificates"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <MyCertificatesPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/verify"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminVerifyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminStudentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminReportsPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
