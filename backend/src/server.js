const app = require('./app');
const config = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(config.port, () => {
      console.log(`\n🚀 MyProfile Backend API running on http://localhost:${config.port}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔑 OTP Mode: ${config.otpMode.toUpperCase()}`);
      console.log(`📁 Static Uploads: http://localhost:${config.port}/uploads\n`);
    });

    const shutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        console.log('Server terminated successfully.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('Fatal Server Startup Error:', err);
    process.exit(1);
  }
};

startServer();
