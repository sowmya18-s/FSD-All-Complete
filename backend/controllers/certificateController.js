const Certificate = require('../models/Certificate');
const Verification = require('../models/Verification');
const mongoose = require('mongoose');
const { respondWithControllerError, escapeRegex } = require('../utils/controllerError');

const isCertificateStatus = (status) => ['Pending', 'Verified', 'Rejected'].includes(status);
const isCertificateType = (type) =>
  [
    'Workshop',
    'Internship',
    'NPTEL',
    'Seminar',
    'Hackathon',
    'Sports',
    'Technical Competition',
    'Other',
  ].includes(type);

/**
 * @desc    Submit a new certificate
 * @route   POST /api/certificates
 * @access  Private (Student)
 */
const createCertificate = async (req, res) => {
  try {
    const {
      certificateTitle,
      certificateType,
      organization,
      issueDate,
      certificateNumber,
    } = req.body || {};

    // Validation
    if (
      [certificateTitle, certificateType, organization, issueDate, certificateNumber].some(
        (value) => typeof value !== 'string' || !value.trim()
      ) ||
      certificateTitle.length > 200 ||
      organization.length > 200 ||
      certificateNumber.length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields (title, type, organization, issue date, certificate number) are required.',
      });
    }

    const cleanCertNumber = certificateNumber.trim().toUpperCase();

    // Check duplicate certificate number
    const existing = await Certificate.findOne({ certificateNumber: cleanCertNumber });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A certificate with number "${cleanCertNumber}" is already registered.`,
      });
    }

    const certificate = await Certificate.create({
      studentId: req.user._id,
      certificateTitle: certificateTitle.trim(),
      certificateType,
      organization: organization.trim(),
      issueDate,
      certificateNumber: cleanCertNumber,
      verificationStatus: 'Pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Certificate submitted successfully! Status is currently Pending verification.',
      certificate,
    });
  } catch (error) {
    return respondWithControllerError(res, error, 'Create certificate error', 'Failed to submit certificate.');
  }
};

/**
 * @desc    Get all certificates belonging to logged-in student
 * @route   GET /api/certificates/my
 * @access  Private (Student)
 */
const getMyCertificates = async (req, res) => {
  try {
    const { search, status, type } = req.query;

    const query = { studentId: req.user._id };

    if ((status && status !== 'All' && !isCertificateStatus(status)) ||
        (type && type !== 'All' && !isCertificateType(type))) {
      return res.status(400).json({ success: false, message: 'Invalid certificate filter.' });
    }

    if (status && status !== 'All') {
      query.verificationStatus = status;
    }

    if (type && type !== 'All') {
      query.certificateType = type;
    }

    if (search !== undefined) {
      if (typeof search !== 'string' || search.length > 100) {
        return res.status(400).json({ success: false, message: 'Search text is invalid.' });
      }
      if (search.trim()) {
        const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
        query.$or = [
          { certificateTitle: searchRegex },
          { certificateNumber: searchRegex },
          { organization: searchRegex },
        ];
      }
    }

    const certificates = await Certificate.find(query)
      .populate({
        path: 'latestVerification',
        populate: { path: 'verifiedBy', select: 'name email role' },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: certificates.length,
      certificates,
    });
  } catch (error) {
    return respondWithControllerError(res, error, 'Get certificates error', 'Failed to retrieve certificates.');
  }
};

/**
 * @desc    Get student dashboard metrics & recent certificates
 * @route   GET /api/certificates/student-stats
 * @access  Private (Student)
 */
const getStudentStats = async (req, res) => {
  try {
    const studentId = req.user._id;

    const [total, verified, pending, rejected, recentCertificates] = await Promise.all([
      Certificate.countDocuments({ studentId }),
      Certificate.countDocuments({ studentId, verificationStatus: 'Verified' }),
      Certificate.countDocuments({ studentId, verificationStatus: 'Pending' }),
      Certificate.countDocuments({ studentId, verificationStatus: 'Rejected' }),
      Certificate.find({ studentId })
        .populate({
          path: 'latestVerification',
          populate: { path: 'verifiedBy', select: 'name' },
        })
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        total,
        verified,
        pending,
        rejected,
      },
      recentCertificates,
    });
  } catch (error) {
    return respondWithControllerError(res, error, 'Student stats error', 'Failed to load dashboard statistics.');
  }
};

/**
 * @desc    Get single certificate details by MongoDB _id or certificateId
 * @route   GET /api/certificates/:id
 * @access  Private (Owner Student or Admin)
 */
const getCertificateById = async (req, res) => {
  try {
    const { id } = req.params;

    let certificate;
    if (id.startsWith('CERT-')) {
      certificate = await Certificate.findOne({ certificateId: id });
    } else {
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ success: false, message: 'Certificate ID is invalid.' });
      }
      certificate = await Certificate.findById(id);
    }

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found.',
      });
    }

    // Access control: Only owner or admin can view details
    if (
      req.user.role !== 'admin' &&
      certificate.studentId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this certificate.',
      });
    }

    await certificate.populate('studentId', 'name email userId');

    // Retrieve full verification audit trail
    const verificationHistory = await Verification.find({
      certificateId: certificate._id,
    })
      .populate('verifiedBy', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      certificate,
      verificationHistory,
    });
  } catch (error) {
    return respondWithControllerError(res, error, 'Get certificate error', 'Failed to load certificate details.');
  }
};

/**
 * @desc    Update certificate information
 * @route   PUT /api/certificates/:id
 * @access  Private (Owner Student)
 */
const updateCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      certificateTitle,
      certificateType,
      organization,
      issueDate,
      certificateNumber,
    } = req.body || {};

    if (
      !mongoose.isValidObjectId(id) ||
      [certificateTitle, certificateType, organization, issueDate, certificateNumber].some(
        (value) => typeof value !== 'string' || !value.trim()
      ) ||
      certificateTitle.length > 200 ||
      organization.length > 200 ||
      certificateNumber.length > 100
    ) {
      return res.status(400).json({ success: false, message: 'Certificate details are invalid.' });
    }

    const certificate = await Certificate.findById(id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found.',
      });
    }

    // Check ownership
    if (certificate.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own certificates.',
      });
    }

    // Check certificate number uniqueness if changed
    if (certificateNumber && certificateNumber.trim().toUpperCase() !== certificate.certificateNumber) {
      const exists = await Certificate.findOne({
        certificateNumber: certificateNumber.trim().toUpperCase(),
        _id: { $ne: certificate._id },
      });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: 'Another certificate already uses this certificate number.',
        });
      }
      certificate.certificateNumber = certificateNumber.trim().toUpperCase();
    }

    if (certificateTitle) certificate.certificateTitle = certificateTitle.trim();
    if (certificateType) certificate.certificateType = certificateType;
    if (organization) certificate.organization = organization.trim();
    if (issueDate) certificate.issueDate = issueDate;

    // Reset status to Pending upon modification so admin can reverify
    certificate.verificationStatus = 'Pending';
    certificate.latestVerification = null;

    await certificate.save();

    return res.status(200).json({
      success: true,
      message: 'Certificate updated successfully. Status reset to Pending for admin re-verification.',
      certificate,
    });
  } catch (error) {
    return respondWithControllerError(res, error, 'Update certificate error', 'Failed to update certificate.');
  }
};

/**
 * @desc    Delete certificate
 * @route   DELETE /api/certificates/:id
 * @access  Private (Owner Student)
 */
const deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Certificate ID is invalid.' });
    }

    const certificate = await Certificate.findById(id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found.',
      });
    }

    // Verify ownership
    if (certificate.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own certificates.',
      });
    }

    // Delete associated verification records
    await Verification.deleteMany({ certificateId: certificate._id });
    await Certificate.findByIdAndDelete(certificate._id);

    return res.status(200).json({
      success: true,
      message: 'Certificate record deleted successfully.',
    });
  } catch (error) {
    return respondWithControllerError(res, error, 'Delete certificate error', 'Failed to delete certificate.');
  }
};

/**
 * @desc    Public certificate verification lookup (by certificate number)
 * @route   GET /api/certificates/public-verify/:number
 * @access  Public
 */
const verifyPublicCertificate = async (req, res) => {
  try {
    const { number } = req.params;
    if (typeof number !== 'string' || !number.trim() || number.length > 100) {
      return res.status(400).json({ success: false, found: false, message: 'Certificate number is invalid.' });
    }

    const certificate = await Certificate.findOne({
      certificateNumber: number.trim().toUpperCase(),
    })
      .populate('studentId', 'name')
      .populate({
        path: 'latestVerification',
        populate: { path: 'verifiedBy', select: 'name' },
      });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        found: false,
        message: `No certificate found matching registration number "${number}".`,
      });
    }

    return res.status(200).json({
      success: true,
      found: true,
      certificate: {
        certificateId: certificate.certificateId,
        certificateNumber: certificate.certificateNumber,
        certificateTitle: certificate.certificateTitle,
        certificateType: certificate.certificateType,
        organization: certificate.organization,
        issueDate: certificate.issueDate,
        studentName: certificate.studentId ? certificate.studentId.name : 'N/A',
        verificationStatus: certificate.verificationStatus,
        verificationDate: certificate.latestVerification ? certificate.latestVerification.verificationDate : null,
        verifiedBy: certificate.latestVerification && certificate.latestVerification.verifiedBy ? certificate.latestVerification.verifiedBy.name : null,
        remarks: certificate.latestVerification ? certificate.latestVerification.remarks : '',
      },
    });
  } catch (error) {
    return respondWithControllerError(res, error, 'Public verification error', 'Unable to search for certificate.');
  }
};

module.exports = {
  createCertificate,
  getMyCertificates,
  getStudentStats,
  getCertificateById,
  updateCertificate,
  deleteCertificate,
  verifyPublicCertificate,
};
