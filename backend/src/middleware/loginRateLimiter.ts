import { Request, Response, NextFunction } from "express";
import { incrementCacheWithExpiry } from "../pkg/cache/cache.service";

export const loginRateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ip = req.ip ?? "unknown";
    const key = `rate-limit:login:ip:${ip}`;

    const requestCount = await incrementCacheWithExpiry(key, 60);

    if (requestCount > 20) {
      res.status(429).json({
        message: "Too many login attempts. Please try again later.",
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
