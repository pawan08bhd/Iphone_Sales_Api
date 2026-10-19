import mongoose from 'mongoose';

export const connectDatabase = async () => {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured. Add it to your .env file.');
  }

  // Fail quickly during startup instead of keeping the API waiting on an unavailable database.
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
};
