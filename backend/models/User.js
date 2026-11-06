const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true,
      maxlength: [120, 'Name must be 120 characters or fewer'],
    },
    email: {
      type: String,
      required: [true, 'Please provide email address'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [254, 'Email address is too long'],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      validate: {
        validator: (password) => Buffer.byteLength(password, 'utf8') <= 72,
        message: 'Password must not exceed 72 UTF-8 bytes',
      },
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-assign userId before validation if not present
userSchema.pre('validate', function (next) {
  if (!this.userId) {
    const prefix = this.role === 'admin' ? 'ADM' : 'STU';
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    this.userId = `${prefix}-${randomSuffix}`;
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to verify password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Transform output to not expose password hash
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
