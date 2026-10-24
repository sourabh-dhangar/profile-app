const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const config = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const sectionRoutes = require('./routes/sections');
const reelRoutes = require('./routes/reels');
const discoveryRoutes = require('./routes/discovery');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const aiRoutes = require('./routes/ai');
const chatRoutes = require('./routes/chat');

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS configuration
app.use(cors({
  origin: '*', // For local development allow frontend & mobile
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());


// Request logging
app.use(morgan('dev'));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.resolve(config.uploadDir)));

// Rate limiting on API routes
app.use('/api', generalLimiter);

// Root landing & gateway status endpoint
app.get('/', (req, res) => {
  const isPureJson = req.headers.accept && req.headers.accept.includes('application/json') && !req.headers.accept.includes('text/html');
  if (!isPureJson) {
      return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MyProfile API Gateway — Operational</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0f19; color: #f3f4f6; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .card { background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 36px 32px; max-width: 580px; width: 100%; box-shadow: 0 20px 40px rgba(0,0,0,0.5); text-align: center; }
    .status-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(16,185,129,0.12); color: #10b981; border: 1px solid rgba(16,185,129,0.3); padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
    .pulse { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981; animation: pulse 1.8s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }
    h1 { font-size: 24px; font-weight: 800; margin-bottom: 8px; color: #fff; }
    p.desc { color: #9ca3af; font-size: 14.5px; line-height: 1.5; margin-bottom: 24px; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; background: #172033; padding: 14px; border-radius: 10px; border: 1px solid #232e48; }
    .stat-label { font-size: 11px; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.5px; }
    .stat-value { font-size: 15px; font-weight: 700; color: #fff; margin-top: 4px; }
    .btn-group { display: flex; flex-direction: column; gap: 10px; }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none; transition: all 0.2s; }
    .btn-primary { background: #10b981; color: #020617; }
    .btn-primary:hover { background: #059669; }
    .btn-secondary { background: #1f2937; color: #f3f4f6; border: 1px solid #374151; }
    .btn-secondary:hover { background: #374151; }
    .endpoints { margin-top: 24px; text-align: left; background: #090d16; padding: 14px 16px; border-radius: 8px; font-size: 12px; font-family: monospace; color: #94a3b8; border: 1px solid #1e293b; }
    .endpoints span { color: #38bdf8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="status-badge"><span class="pulse"></span> Production Gateway Live</div>
    <h1>MyProfile REST API v2.0</h1>
    <p class="desc">Backend services are fully operational on Vercel Serverless with Cloud MongoDB connectivity, high-speed rate limiting, and zero-knowledge privacy.</p>
    
    <div class="stats">
      <div>
        <div class="stat-label">Status</div>
        <div class="stat-value" style="color:#10b981;">Online</div>
      </div>
      <div>
        <div class="stat-label">Version</div>
        <div class="stat-value">v2.0.0</div>
      </div>
      <div>
        <div class="stat-label">Uptime</div>
        <div class="stat-value">${Math.floor(process.uptime())}s</div>
      </div>
    </div>

    <div class="btn-group">
      <a href="https://myprofile-official-web.vercel.app" class="btn btn-primary">🌐 Open Web Application (Frontend)</a>
      <a href="https://expo.dev/artifacts/eas/7KqmaUUROgg8JVlUPOSqTskBjQ_1B1WkpjkWF2nu6Jw.apk" class="btn btn-secondary">📱 Download Android APK</a>
      <a href="/api/v1/reels/feed" class="btn btn-secondary">🎥 View Public Reels Feed JSON</a>
    </div>

    <div class="endpoints">
      <strong>Active API Routes:</strong><br>
      • <span>GET /health</span> - Heartbeat & uptime probe<br>
      • <span>POST /api/v1/auth/*</span> - OTP & JWT session auth<br>
      • <span>GET /api/v1/profiles/*</span> - Modular profile & vCard hub<br>
      • <span>GET /api/v1/reels/*</span> - 60s video reels & social feed<br>
      • <span>POST /api/v1/ai/*</span> - Gemini AI bio & caption generator
    </div>
  </div>
</body>
</html>`);
  }

  res.status(200).json({
    success: true,
    status: 'online',
    message: 'MyProfile API Gateway v2.0 is live and operational',
    version: '2.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    frontendUrl: 'https://myprofile-official-web.vercel.app',
    apkUrl: 'https://expo.dev/artifacts/eas/7KqmaUUROgg8JVlUPOSqTskBjQ_1B1WkpjkWF2nu6Jw.apk',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      profiles: '/api/v1/profiles',
      reels: '/api/v1/reels',
      discovery: '/api/v1/discovery',
      admin: '/api/v1/admin',
      ai: '/api/v1/ai',
    },
  });
});

// Health check endpoint
app.get(['/health', '/api/v1/health'], (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profiles/me/sections', sectionRoutes);
app.use('/api/v1/sections', sectionRoutes);
app.use('/api/v1/profiles', profileRoutes);
app.use('/api/v1/reels', reelRoutes);
app.use('/api/v1/discovery', discoveryRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/chat', chatRoutes);

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
