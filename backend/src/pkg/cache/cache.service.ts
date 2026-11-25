import { redis } from "../../lib/cache/redis";
import crypto from "node:crypto";
import { env } from "../../lib/config/env";

export const setCache = async (
  key: string,
  value: string,
  ttl: number,
): Promise<void> => {
  await redis.set(key, value, "EX", ttl);
};

export const getCache = async (key: string): Promise<string | null> => {
  return await redis.get(key);
};

export const delCache = async (key: string): Promise<string | void> => {
  await redis.del(key);
};

export const incrementCache = async (key: string): Promise<number> => {
  return await redis.incr(key);
};

export const incrementCacheWithExpiry = async (
  key: string,
  ttl: number,
): Promise<number> => {
  const result = await redis.eval(
    `
      local count = redis.call("INCR", KEYS[1])

      if count == 1 then
        redis.call("EXPIRE", KEYS[1], ARGV[1])
      end

      return count
    `,
    1,
    key,
    ttl,
  );

  return Number(result);
};

export const createEmailHash = (email: string): string => {
  return crypto
    .createHmac("sha256", env.rateLimitSecret)
    .update(email.trim().toLowerCase())
    .digest("hex");
};

export const setCacheIfNotExists = async (
  key: string,
  value: string,
  ttl: number,
): Promise<boolean> => {
  const result = await redis.set(key, value, "EX", ttl, "NX");

  return result === "OK";
};
