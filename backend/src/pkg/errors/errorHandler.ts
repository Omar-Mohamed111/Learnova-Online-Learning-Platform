import { Request, Response, NextFunction } from "express";
import { AppError } from "./AppError";
import logger from "../logger/logger";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
      errors: err.error,
    });
    return;
  }

  logger.error(err.message, { correlationId: res.locals.correlationId });

  res.status(500).json({
    message: "Internal Server Error",
  });
};
