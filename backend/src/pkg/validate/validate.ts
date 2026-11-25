import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import { AppError } from "../errors/AppError";

export const validate = (schema: ZodType) => {

  return (req: Request, res: Response, next: NextFunction) => {
      
      const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      next(new AppError("Validation Error", 400, errors));
      return;
    }

    req.body = result.data;
    next();
  };
};
