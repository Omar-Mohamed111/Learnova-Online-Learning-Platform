import { Request, Response, NextFunction } from "express";
import * as adminService from "./admin.service";

// Get dashboard statistics.
export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const stats = await adminService.getDashboardStats();

    res.status(200).json({
      message: "Dashboard statistics fetched successfully",
      stats,
    });
  } catch (error) {
    next(error);
  }
};
