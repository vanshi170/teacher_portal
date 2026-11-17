
import 'dotenv/config';
import app from './app.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
const requiredEnvironment = [
  'MONGODB_URI',
  'JWT_SECRET',
  'ADMIN_API_KEY',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];
const missingEnvironment = requiredEnvironment.filter((name) => !process.env[name]);

if (missingEnvironment.length) {
  throw new Error(`Missing required environment variables: ${missingEnvironment.join(', ')}`);
}

if (process.env.JWT_SECRET.length < 32 || process.env.ADMIN_API_KEY.length < 32) {
  throw new Error('JWT_SECRET and ADMIN_API_KEY must each be at least 32 characters long.');
}

const port = Number(process.env.PORT || 10000);

try {
  await connectDatabase(process.env.MONGODB_URI);
  console.log('Connected to MongoDB successfully.');
} catch (err) {
  console.error('Failed to connect to MongoDB:', err.message);
  process.exit(1);
}

const server = app.listen(port, () => {
  console.log(`Student attendance API listening on port ${port}`);
});

// Graceful Shutdown
const shutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await disconnectDatabase();
      console.log('MongoDB connection closed. Server shut down cleanly.');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
