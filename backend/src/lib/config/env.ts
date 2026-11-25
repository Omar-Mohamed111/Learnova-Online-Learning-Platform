import z from "zod";
import { config } from "dotenv";
config();

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  JWT_SECRET: z.string().min(20),
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),
  EMAIL_USER: z.string().email("email is not correct"),
  EMAIL_PASS: z.string().min(1, "EMAIL_PASS is required"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  RATE_LIMIT_SECRET: z.string().min(32, "RATE_LIMIT_SECRET must be at least 32 characters"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment variables:", result.error);
  process.exit(1);
}

export const env = {
  port: result.data.PORT,
  mongoUri: result.data.MONGO_URI,
  jwtSecret: result.data.JWT_SECRET,
  redisUrl: result.data.REDIS_URL,
  emailUser: result.data.EMAIL_USER,
  emailPass: result.data.EMAIL_PASS,
  googleClientId: result.data.GOOGLE_CLIENT_ID,
  rateLimitSecret: result.data.RATE_LIMIT_SECRET,
};
