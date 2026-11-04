const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema(
  {
    verificationId: {
      type: String,
      unique: true,
      index: true,
    },
    certificateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Certificate',
      required: [true, 'Certificate reference is required'],
      index: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Admin reference (verifiedBy) is required'],
    },
    verificationDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-assign human-readable verificationId before validation
verificationSchema.pre('validate', function (next) {
  if (!this.verificationId) {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestampPart = Date.now().toString().slice(-4);
    this.verificationId = `VER-${randomHex}${timestampPart}`;
  }
  next();
});

module.exports = mongoose.model('Verification', verificationSchema);
