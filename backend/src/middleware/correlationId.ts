import { NextFunction, Request, Response } from "express";
import crypto from "node:crypto";
import logger from "../pkg/logger/logger";

export const correlationId = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = crypto.randomUUID();

  res.locals.correlationId = id;
  res.setHeader("x-correlation-id", id);

  logger.info("Incoming request", {
    correlationId: id,
    method: req.method,
    url: req.originalUrl,
  });

  const startTime = Date.now();

  res.on("finish", () => {
    logger.info("Request completed", {
      correlationId: id,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startTime,
    });
  });

  next();
};

export default correlationId;
