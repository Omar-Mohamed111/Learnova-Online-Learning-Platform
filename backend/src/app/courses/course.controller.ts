import { NextFunction, Request, Response } from "express";
import * as courseService from "./course.service";
import { AppError } from "../../pkg/errors/AppError";

// =======================
// create course
// =======================

export const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const teacherId = res.locals.userId;
    const course = await courseService.createCourse(req.body, teacherId);
    res.status(201).json({
      message: "course created successfully",
      course,
    });
  } catch (error) {
    next(error);
  }
};

// =======================
// get all course
// =======================

export const getAllcourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Read pagination parameters, using defaults if omitted.
    const limit = Number(req.query.limit ?? 10);
    const page = Number(req.query.page ?? 1);

    // Read price filters only when they are provided.
    const minPrice = req.query.minPrice !== undefined ? Number(req.query.minPrice) : undefined;

    const maxPrice = req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : undefined;

    // Read the search term if it is a single string.
    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    // Read sorting parameters with default values.
    const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : "createdAt";

    const order = typeof req.query.order === "string" ? req.query.order : "desc";

    // Get courses using all requested filters and options.
    const allCourse = await courseService.getAllcourse(
      limit,
      page,
      minPrice,
      maxPrice,
      search,
      sortBy as "price" | "createdAt",
      order as "asc" | "desc",
    );

    // Return the results.
    res.status(200).json({
      message: "Courses fetched successfully",
      allCourse,
    });
  } catch (error) {
    // Forward errors to the global error handler.
    next(error);
  }
};

// =======================
// get course by id
// =======================

export const findCourseById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id;
    if (typeof id !== "string") {
      throw new AppError("Invalid course id", 400);
    }
    const course = await courseService.findCourseById(id);
    res.status(200).json({
      message: "Course",
      course,
    });
  } catch (error) {
    next(error);
  }
};

// =======================
// update course by id
// =======================

export const updateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id;
    const userId = res.locals.userId;
    const userRole = res.locals.userRole;

    if (typeof id !== "string") {
      throw new AppError("Invalid course id", 400);
    }

    const course = await courseService.updateCourse(
      id,
      req.body,
      userId,
      userRole,
    );

    res.status(200).json({
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    next(error);
  }
};

// =======================
// delete course by id
// =======================

export const deleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id;
    const userId = res.locals.userId;
    const userRole = res.locals.userRole;

    if (typeof id !== "string") {
      throw new AppError("Invalid course id", 400);
    }

    await courseService.deleteCourse(id, userId, userRole);

    res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// =======================
// get my course
// =======================

export const getMyCourses = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const teacherId = res.locals.userId;

    if (typeof teacherId !== "string") {
      throw new AppError("Authentication required", 401);
    }

    const courses = await courseService.getMyCourses(teacherId);

    res.status(200).json({
      message: "My courses",
      courses,
    });
  } catch (error) {
    next(error);
  }
};
