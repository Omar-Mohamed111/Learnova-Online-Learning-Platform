import { Request, Response, NextFunction } from "express";
import { findUserById } from "../app/auth/auth.repository";
import { AppError } from "../pkg/errors/AppError";

type UserRole = "admin" | "teacher" | "student";

export const authorize = (...allowedRoles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = res.locals.userId;

      if (typeof userId !== "string") {
        return next(new AppError("Authentication required", 401));
      }

      const user = await findUserById(userId);

      if (!user) {
        return next(new AppError("User not found", 404));
      }

      if (!allowedRoles.includes(user.role)) {
        return next(new AppError("Forbidden", 403));
      }

      res.locals.userRole = user.role;

      return next();
    } catch (error) {
      return next(error);
    }
  };
};
