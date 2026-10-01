import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bulkmailpro';
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    
    // Connect with a 5 second serverSelectionTimeoutMS so it doesn't hang indefinitely if offline
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.warn(
      '\n[NOTICE] MongoDB is not running locally or the connection failed.' +
      '\nPlease ensure MongoDB service is started, or update MONGO_URI in server/.env with your MongoDB Atlas connection string.\n'
    );
  }
};

export default connectDB;
