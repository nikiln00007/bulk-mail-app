import mongoose from 'mongoose';

/**
 * Global cache for Mongoose connection in Serverless environments (Vercel)
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  // If already connected, reuse existing connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  // On Vercel, if no external MongoDB URI is provided, skip trying localhost to avoid 5s timeout
  if (!mongoUri && process.env.VERCEL === '1') {
    return null;
  }

  const targetUri = mongoUri || 'mongodb://127.0.0.1:27017/bulkmailpro';

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 4000,
    };

    cached.promise = mongoose.connect(targetUri, opts).then((mongooseInstance) => {
      console.log(`MongoDB Connected successfully: ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    }).catch((err) => {
      console.warn(`MongoDB Connection Error: ${err.message}. Operating in fallback mode.`);
      cached.promise = null;
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
  }

  return cached.conn;
};

export default connectDB;
