const path = require('path');
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const adminRoutes = require('./routes/adminRoutes');
const checkDBConnection = require('./middleware/dbCheck');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Connect to MongoDB Atlas Cloud Database
connectDB();

// CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching CLIENT_URL or localhost
      if (!origin || origin === CLIENT_URL || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for local student development
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Request Logger for Development
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes Mount (with database readiness check)
app.use('/api/auth', checkDBConnection, authRoutes);
app.use('/api/certificates', checkDBConnection, certificateRoutes);
app.use('/api/admin', checkDBConnection, adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'Digital Certificate Verification Portal API',
    timestamp: new Date(),
  });
});

// Root welcome endpoint
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Certificate Verification API</title></head>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #2563eb;">Digital Certificate Verification Portal API</h1>
        <p>The backend server is running successfully on port ${PORT}.</p>
        <p>Connect from your React frontend at <a href="${CLIENT_URL}">${CLIENT_URL}</a></p>
      </body>
    </html>
  `);
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found on this server.`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log('\n======================================================');
  console.log(` Server is running on port ${PORT}`);
  console.log(` API URL: http://localhost:${PORT}/api`);
  console.log(` Frontend Client: ${CLIENT_URL}`);
  console.log('======================================================\n');
});
