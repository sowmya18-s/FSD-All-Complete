const express = require('express');
const router = express.Router();
const {
  getAdminDashboardStats,
  getAllCertificates,
  verifyCertificate,
  getAllStudents,
  deleteCertificateAdmin,
  getCertificateReport,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes strictly require authentication and 'admin' role
router.use(protect);
router.use(authorize('admin'));

// Admin Dashboard Metrics
router.get('/dashboard-stats', getAdminDashboardStats);

// View and filter all submitted certificates
router.get('/certificates', getAllCertificates);

// Verify or Reject certificate with remarks
router.put('/certificates/:id/verify', verifyCertificate);

// Delete certificate record
router.delete('/certificates/:id', deleteCertificateAdmin);

// View all registered students
router.get('/students', getAllStudents);

// Generate certificate reports
router.get('/reports', getCertificateReport);

module.exports = router;
