import mongoose from "mongoose";
import { env } from "../config/env";
import logger from "../../pkg/logger/logger";

export const connectDB = async () => {
  await mongoose.connect(env.mongoUri);

  logger.info("MongoDB Connected Successfully ✅ ");
};
