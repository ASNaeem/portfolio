const dotenv = require('dotenv');
// Load environment variables
dotenv.config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 3300;
const HOST = process.env.HOST || 'localhost';

async function startServer() {
  // If no MongoDB URI is configured, spin up an in-memory MongoDB instance for convenience
  if (!process.env.MONGODB_URI) {
    console.log('No MONGODB_URI environment variable found. Starting in-memory MongoDB instance...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create({
        instance: {
          ip: '127.0.0.1',
        }
      });
      process.env.MONGODB_URI = mongoServer.getUri();
      console.log('In-memory MongoDB instance started.');
    } catch (err) {
      console.error('Failed to start in-memory MongoDB server:', err);
      process.exit(1);
    }
  }

  await connectDB();

  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
