const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      unique: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID reference is required'],
      index: true,
    },
    certificateTitle: {
      type: String,
      required: [true, 'Certificate title is required'],
      trim: true,
      index: true,
    },
    certificateType: {
      type: String,
      required: [true, 'Certificate type is required'],
      enum: {
        values: [
          'Workshop',
          'Internship',
          'NPTEL',
          'Seminar',
          'Hackathon',
          'Sports',
          'Technical Competition',
          'Other',
        ],
        message: '{VALUE} is not a valid certificate type',
      },
      index: true,
    },
    organization: {
      type: String,
      required: [true, 'Issuing organization name is required'],
      trim: true,
    },
    issueDate: {
      type: Date,
      required: [true, 'Issue date is required'],
    },
    certificateNumber: {
      type: String,
      required: [true, 'Certificate registration/serial number is required'],
      trim: true,
      uppercase: true,
      unique: true,
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    latestVerification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Verification',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-assign human-readable certificateId before validation
certificateSchema.pre('validate', function (next) {
  if (!this.certificateId) {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestampPart = Date.now().toString().slice(-4);
    this.certificateId = `CERT-${randomHex}${timestampPart}`;
  }
  next();
});

// Composite index for fast searching and filtering
certificateSchema.index({ studentId: 1, verificationStatus: 1 });
certificateSchema.index({ certificateTitle: 'text', organization: 'text', certificateNumber: 'text' });

module.exports = mongoose.model('Certificate', certificateSchema);
