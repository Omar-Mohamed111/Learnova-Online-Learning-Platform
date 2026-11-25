import app from "./app";
import { redis } from "./lib/cache/redis";
import { env } from "./lib/config/env";
import { connectDB } from "./lib/database/connectDb";
import logger from "./pkg/logger/logger";

const PORT = env.port;

const startServer = async () => {
  
  await connectDB();
  await redis.ping();
  logger.info("Redis Connected Successfully ✅");

  app.listen(PORT, () => {
    logger.info(`Server Running In Port ${PORT} ✅`);
  });


};

startServer();
