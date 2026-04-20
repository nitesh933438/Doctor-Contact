import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/docreserve');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`MongoDB Connection Error: ${error.message}`);
      console.error('Please configure a remote MongoDB cluster (like MongoDB Atlas) and add its connection string as MONGODB_URI in the Secrets panel.');
    }
  }
};
