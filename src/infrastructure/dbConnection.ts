import mongoose from 'mongoose';
import logger from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
  }
  catch (error) {
    logger.error(`error connecting to mongodb: ${error}`)
  }
};
