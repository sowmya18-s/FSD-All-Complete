const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { respondWithControllerError } = require('../utils/controllerError');

const generateToken = (userId, role) =>
  jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

const validateCredentials = (name, email, password) =>
  typeof name === 'string' &&
  name.trim().length > 0 &&
  name.trim().length <= 120 &&
  typeof email === 'string' &&
  email.trim().length <= 254 &&
  typeof password === 'string' &&
  password.length >= 8 &&
  Buffer.byteLength(password, 'utf8') <= 72;

const register = async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!validateCredentials(name, email, password)) {
    return res.status(400).json({
      success: false,
      message: 'Provide a name, valid email, and password between 8 and 72 UTF-8 bytes.',
    });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'student',
    });

    return res.status(201).json({
      success: true,
      message: 'Student account registered successfully.',
      token: generateToken(user._id, user.role),
      user: {
        _id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return respondWithControllerError(
      res,
      error,
      'Registration error',
      'Unable to register this account.'
    );
  }
};

const login = async (req, res) => {
  const { email, password } = req.body || {};
  if (
    typeof email !== 'string' ||
    !email.trim() ||
    email.length > 254 ||
    typeof password !== 'string' ||
    !password ||
    Buffer.byteLength(password, 'utf8') > 72
  ) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address and password.',
    });
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token: generateToken(user._id, user.role),
      user: {
        _id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return respondWithControllerError(res, error, 'Login error', 'Unable to sign in.');
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return respondWithControllerError(
      res,
      error,
      'User profile error',
      'Failed to retrieve user profile.'
    );
  }
};

module.exports = {
  register,
  login,
  getMe,
};
