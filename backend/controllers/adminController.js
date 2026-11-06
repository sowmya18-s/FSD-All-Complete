const User = require('../models/User');
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
 * @desc    Get admin dashboard metrics & recent submissions
 * @route   GET /api/admin/dashboard-stats
 * @access  Private (Admin)
 */
const getAdminDashboardStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalCertificates,
      verifiedCount,
      pendingCount,
      rejectedCount,
      recentSubmissions,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Certificate.countDocuments({}),
      Certificate.countDocuments({ verificationStatus: 'Verified' }),
      Certificate.countDocuments({ verificationStatus: 'Pending' }),
      Certificate.countDocuments({ verificationStatus: 'Rejected' }),
      Certificate.find({})
        .populate('studentId', 'name email userId')
        .populate({
          path: 'latestVerification',
          populate: { path: 'verifiedBy', select: 'name' },
        })
        .sort({ createdAt: -1 })
        .limit(6),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalCertificates,
        verifiedCertificates: verifiedCount,
        pendingCertificates: pendingCount,
        rejectedCertificates: rejectedCount,
      },
      recentSubmissions,
    });
  } catch (error) {
    return respondWithControllerError(
      res,
      error,
      'Admin dashboard stats error',
      'Failed to retrieve admin dashboard metrics.'
    );
  }
};

/**
 * @desc    Get all certificates with search, type and status filtering
 * @route   GET /api/admin/certificates
 * @access  Private (Admin)
 */
const getAllCertificates = async (req, res) => {
  try {
    const { search, status, type, sortBy } = req.query;

    const query = {};

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

    // If searching, check certificate title, number, organization, or student name
    let matchingStudentIds = [];
    if (search !== undefined) {
      if (typeof search !== 'string' || search.length > 100) {
        return res.status(400).json({ success: false, message: 'Search text is invalid.' });
      }

      const searchRegex = search.trim()
        ? new RegExp(escapeRegex(search.trim()), 'i')
        : null;

      if (searchRegex) {
        const matchedUsers = await User.find({
          role: 'student',
          $or: [{ name: searchRegex }, { email: searchRegex }],
        }).select('_id');

        matchingStudentIds = matchedUsers.map((u) => u._id);

        query.$or = [
          { certificateTitle: searchRegex },
          { certificateNumber: searchRegex },
          { organization: searchRegex },
          { studentId: { $in: matchingStudentIds } },
        ];
      }
    }

    let sortOption = { createdAt: -1 };
    if (sortBy === 'oldest') sortOption = { createdAt: 1 };
    if (sortBy === 'title') sortOption = { certificateTitle: 1 };
    if (sortBy === 'issueDate') sortOption = { issueDate: -1 };

    const certificates = await Certificate.find(query)
      .populate('studentId', 'name email userId')
      .populate({
        path: 'latestVerification',
        populate: { path: 'verifiedBy', select: 'name email' },
      })
      .sort(sortOption);

    return res.status(200).json({
      success: true,
      count: certificates.length,
      certificates,
    });
  } catch (error) {
    return respondWithControllerError(res, error, 'Get all certificates error', 'Failed to retrieve certificates.');
  }
};

/**
 * @desc    Verify or Reject a certificate, add remarks, and log verification history
 * @route   PUT /api/admin/certificates/:id/verify
 * @access  Private (Admin)
 */
const verifyCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body || {};

    if (!mongoose.isValidObjectId(id) || !['Verified', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Certificate ID or status is invalid.',
      });
    }
    if (
      typeof remarks !== 'string' ||
      !remarks.trim() ||
      remarks.length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: 'Provide verification remarks of 1 to 2000 characters.',
      });
    }

    const certificate = await Certificate.findById(id).populate('studentId', 'name email');
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found.',
      });
    }

    // Create a new record in Verification collection
    const verificationRecord = await Verification.create({
      certificateId: certificate._id,
      verifiedBy: req.user._id,
      verificationDate: new Date(),
      remarks: remarks.trim(),
    });

    // Update Certificate document
    certificate.verificationStatus = status;
    certificate.latestVerification = verificationRecord._id;
    await certificate.save();

    // Populate for response
    await verificationRecord.populate('verifiedBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: `Certificate has been marked as "${status}" successfully.`,
      certificate,
      verification: verificationRecord,
    });
  } catch (error) {
    return respondWithControllerError(res, error, 'Verify certificate error', 'Failed to update verification status.');
  }
};

/**
 * @desc    Get all registered students and their certificate statistics
 * @route   GET /api/admin/students
 * @access  Private (Admin)
 */
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });

    // Aggregate certificate counts for each student
    const studentStats = await Promise.all(
      students.map(async (student) => {
        const total = await Certificate.countDocuments({ studentId: student._id });
        const verified = await Certificate.countDocuments({
          studentId: student._id,
          verificationStatus: 'Verified',
        });
        const pending = await Certificate.countDocuments({
          studentId: student._id,
          verificationStatus: 'Pending',
        });
        const rejected = await Certificate.countDocuments({
          studentId: student._id,
          verificationStatus: 'Rejected',
        });

        return {
          _id: student._id,
          userId: student.userId,
          name: student.name,
          email: student.email,
          createdAt: student.createdAt,
          certificates: {
            total,
            verified,
            pending,
            rejected,
          },
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: studentStats.length,
      students: studentStats,
    });
  } catch (error) {
    return respondWithControllerError(res, error, 'Get students error', 'Failed to retrieve student directory.');
  }
};

/**
 * @desc    Delete certificate record (Admin action)
 * @route   DELETE /api/admin/certificates/:id
 * @access  Private (Admin)
 */
const deleteCertificateAdmin = async (req, res) => {
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

    // Clean up verification history
    await Verification.deleteMany({ certificateId: certificate._id });
    await Certificate.findByIdAndDelete(certificate._id);

    return res.status(200).json({
      success: true,
      message: `Certificate "${certificate.certificateTitle}" and its verification history were deleted successfully.`,
    });
  } catch (error) {
    return respondWithControllerError(res, error, 'Admin delete certificate error', 'Failed to delete certificate.');
  }
};

/**
 * @desc    Generate comprehensive report data for certificates
 * @route   GET /api/admin/reports
 * @access  Private (Admin)
 */
const getCertificateReport = async (req, res) => {
  try {
    const { status, type, startDate, endDate } = req.query;

    const query = {};

    if ((status && status !== 'All' && !isCertificateStatus(status)) ||
        (type && type !== 'All' && !isCertificateType(type))) {
      return res.status(400).json({ success: false, message: 'Invalid report filter.' });
    }

    if (status && status !== 'All') {
      query.verificationStatus = status;
    }

    if (type && type !== 'All') {
      query.certificateType = type;
    }

    if (startDate || endDate) {
      query.issueDate = {};
      if (
        (startDate && (typeof startDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(startDate))) ||
        (endDate && (typeof endDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)))
      ) {
        return res.status(400).json({ success: false, message: 'Report dates must use YYYY-MM-DD format.' });
      }
      if (startDate) query.issueDate.$gte = new Date(`${startDate}T00:00:00.000Z`);
      if (endDate) query.issueDate.$lte = new Date(`${endDate}T23:59:59.999Z`);
      if (
        (startDate && Number.isNaN(query.issueDate.$gte.getTime())) ||
        (endDate && Number.isNaN(query.issueDate.$lte.getTime())) ||
        (startDate && query.issueDate.$gte.toISOString().slice(0, 10) !== startDate) ||
        (endDate && query.issueDate.$lte.toISOString().slice(0, 10) !== endDate) ||
        (startDate && endDate && startDate > endDate)
      ) {
        return res.status(400).json({ success: false, message: 'Report date range is invalid.' });
      }
    }

    const certificates = await Certificate.find(query)
      .populate('studentId', 'name email userId')
      .populate({
        path: 'latestVerification',
        populate: { path: 'verifiedBy', select: 'name' },
      })
      .sort({ createdAt: -1 });

    const summary = {
      total: certificates.length,
      verified: certificates.filter((c) => c.verificationStatus === 'Verified').length,
      pending: certificates.filter((c) => c.verificationStatus === 'Pending').length,
      rejected: certificates.filter((c) => c.verificationStatus === 'Rejected').length,
      generatedAt: new Date(),
    };

    return res.status(200).json({
      success: true,
      summary,
      reportData: certificates.map((c) => ({
        certificateId: c.certificateId,
        certificateNumber: c.certificateNumber,
        title: c.certificateTitle,
        type: c.certificateType,
        organization: c.organization,
        studentName: c.studentId ? c.studentId.name : 'Unknown',
        studentEmail: c.studentId ? c.studentId.email : 'Unknown',
        studentUserId: c.studentId ? c.studentId.userId : 'Unknown',
        issueDate: c.issueDate,
        status: c.verificationStatus,
        verificationDate: c.latestVerification ? c.latestVerification.verificationDate : null,
        verifiedBy: c.latestVerification && c.latestVerification.verifiedBy ? c.latestVerification.verifiedBy.name : null,
        remarks: c.latestVerification ? c.latestVerification.remarks : '',
        submissionDate: c.createdAt,
      })),
    });
  } catch (error) {
    return respondWithControllerError(res, error, 'Certificate report error', 'Failed to generate certificate report.');
  }
};

module.exports = {
  getAdminDashboardStats,
  getAllCertificates,
  verifyCertificate,
  getAllStudents,
  deleteCertificateAdmin,
  getCertificateReport,
};
