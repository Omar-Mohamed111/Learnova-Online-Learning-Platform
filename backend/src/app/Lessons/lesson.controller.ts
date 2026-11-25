import { Request, Response, NextFunction } from "express";
import { AppError } from "../../pkg/errors/AppError";
import * as lessonService from "./lesson.service";

// Create a lesson inside a course.
export const createLesson = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const teacherId = res.locals.userId;
    const { title, content, courseId } = req.body;

    // Ensure the teacher is authenticated.
    if (typeof teacherId !== "string") {
      throw new AppError("Authentication required", 401);
    }

    // Create the lesson.
    const lesson = await lessonService.createLesson(
      title,
      content,
      courseId,
      teacherId,
    );

    res.status(201).json({
      message: "Lesson created successfully",
      lesson,
    });
  } catch (error) {
    next(error);
  }
};

// Get all lessons belonging to a course.
export const getLessonsByCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const studentId = res.locals.userId;
    const { courseId } = req.params;

    // Ensure the student is authenticated.
    if (typeof studentId !== "string") {
      throw new AppError("Authentication required", 401);
    }

    if (typeof courseId !== "string") {
      throw new AppError("Course ID is required", 400);
    }

    const lessons = await lessonService.getLessonsByCourse(courseId, studentId);

    res.status(200).json({
      message: "Lessons fetched successfully",
      lessons,
    });
  } catch (error) {
    next(error);
  }
};

// Update a lesson.
export const updateLesson = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = res.locals.userId;
    const userRole = res.locals.userRole;
    const { lessonId } = req.params;
    const { title, content } = req.body;

    // Ensure the user is authenticated.
    if (typeof userId !== "string") {
      throw new AppError("Authentication required", 401);
    }

    if (userRole !== "teacher" && userRole !== "admin") {
      throw new AppError("Forbidden", 403);
    }

    if (typeof lessonId !== "string") {
      throw new AppError("Lesson ID is required", 400);
    }

    // Update the lesson using the user's ID and role.
    const lesson = await lessonService.updateLesson(
      lessonId,
      userId,
      userRole,
      { title, content },
    );

    res.status(200).json({
      message: "Lesson updated successfully",
      lesson,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a lesson.
export const deleteLesson = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = res.locals.userId;
    const userRole = res.locals.userRole;
    const { lessonId } = req.params;

    // Ensure the user is authenticated.
    if (typeof userId !== "string") {
      throw new AppError("Authentication required", 401);
    }

    if (userRole !== "teacher" && userRole !== "admin") {
      throw new AppError("Forbidden", 403);
    }

    if (typeof lessonId !== "string") {
      throw new AppError("Lesson ID is required", 400);
    }

    // Delete the lesson using the user's ID and role.
    await lessonService.deleteLesson(lessonId, userId, userRole);

    res.status(200).json({
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
