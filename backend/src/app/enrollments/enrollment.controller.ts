import { Request, Response, NextFunction } from "express";
import { AppError } from "../../pkg/errors/AppError";
import * as enrollmentService from "./enrollment.service";

// Enroll the authenticated student in a course.
export const enrollStudent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const studentId = res.locals.userId;
    const courseId = req.body.courseId;

    // Ensure the user is authenticated.
    if (typeof studentId !== "string") {
      throw new AppError("Authentication required", 401);
    }

    // Ensure the course ID was provided as a string.
    if (typeof courseId !== "string") {
      throw new AppError("Course ID is required", 400);
    }

    const idempotencyKey = req.get("Idempotency-Key");

    if (!idempotencyKey) {
      throw new AppError("Idempotency-Key header is required", 400);
    }

    const enrollment = await enrollmentService.enrollStudent(
      studentId,
      courseId,
      idempotencyKey,
    );

    res.status(201).json({
      message: "Enrolled successfully",
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};

// Get the authenticated student's enrollments.
export const getMyEnrollments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const studentId = res.locals.userId;

    if (typeof studentId !== "string") {
      throw new AppError("Authentication required", 401);
    }

    const enrollments = await enrollmentService.getMyEnrollments(studentId);

    res.status(200).json({
      message: "My enrollments",
      enrollments,
    });
  } catch (error) {
    next(error);
  }
};
