const express = require('express');
const router = express.Router();
const {
  createCertificate,
  getMyCertificates,
  getStudentStats,
  getCertificateById,
  updateCertificate,
  deleteCertificate,
  verifyPublicCertificate,
} = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/auth');

// Public verification lookup (No authentication required)
router.get('/public-verify/:number', verifyPublicCertificate);

// Protected routes
router.use(protect);

// Student Dashboard Statistics
router.get('/student-stats', authorize('student'), getStudentStats);

// Student Certificate List
router.get('/my', authorize('student'), getMyCertificates);

// Submit Certificate
router.post('/', authorize('student'), createCertificate);

// Get Single Certificate (Student Owner or Admin)
router.get('/:id', getCertificateById);

// Update Certificate (Student Owner)
router.put('/:id', authorize('student'), updateCertificate);

// Delete Certificate (Student Owner)
router.delete('/:id', authorize('student'), deleteCertificate);

module.exports = router;
