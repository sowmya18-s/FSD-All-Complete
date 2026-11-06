const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const adminRoutes = require('./routes/adminRoutes');
const checkDBConnection = require('./middleware/dbCheck');

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32 || jwtSecret.includes('replace-with')) {
  throw new Error('Set JWT_SECRET to a unique random value of at least 32 characters.');
}

const port = Number.parseInt(process.env.PORT || '5000', 10);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid TCP port.');
}

const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set(configuredOrigins);
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.add('http://localhost:5173');
  allowedOrigins.add('http://127.0.0.1:5173');
}

const app = express();
app.disable('x-powered-by');
app.use(
  cors({
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.has(origin));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

app.get('/api/health', (req, res) => {
  const database = mongoose.connection.readyState === 1 ? 'connected' : 'unavailable';
  return res.status(database === 'connected' ? 200 : 503).json({
    status: database === 'connected' ? 'ok' : 'unavailable',
    database,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', checkDBConnection, authRoutes);
app.use('/api/certificates', checkDBConnection, certificateRoutes);
app.use('/api/admin', checkDBConnection, adminRoutes);

app.get('/', (req, res) => {
  res.json({ name: 'Digital Certificate Verification Portal API', health: '/api/health' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  const status =
    Number.isInteger(error.status) && error.status >= 400 && error.status < 500
      ? error.status
      : 500;
  if (status < 500) {
    const message = status === 413 ? 'Request body is too large.' : 'Invalid request.';
    return res.status(status).json({ success: false, message });
  }

  console.error(`Unhandled request error: ${error.name || 'Error'}`);
  return res.status(status).json({
    success: false,
    message: 'An unexpected server error occurred.',
  });
});

const startServer = async () => {
  await connectDB();
  return app.listen(port, () => {
    console.log(`API server listening on port ${port}.`);
  });
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error(`Server startup failed: ${error.name || 'Error'}`);
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };
