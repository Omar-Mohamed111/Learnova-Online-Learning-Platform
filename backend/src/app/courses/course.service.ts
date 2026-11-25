import { InferSchemaType, Types } from "mongoose";
import { AppError } from "../../pkg/errors/AppError";
import * as courseRepository from "./course.repository";
import * as enrollmentRepository from "../enrollments/enrollment.repository";
import { courseSchema } from "./course.model";
import {
  getCache,
  setCache,
  incrementCache,
} from "../../pkg/cache/cache.service";

type CourseData = InferSchemaType<typeof courseSchema>;
type CreateCourseData = Omit<CourseData, "teacher">;

const COURSES_CACHE_TTL = 5 * 60;
const COURSES_CACHE_VERSION_KEY = "courses:list:version";

// =======================
// Courses Cache Key
// =======================

const getCoursesCacheKey = (params: {
  limit: number;
  page: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy: "price" | "createdAt";
  order: "asc" | "desc";
  version: number;
}) => {
  return `courses:list:${JSON.stringify(params)}`;
};

// =======================
// get course by id
// =======================

export const getCourseById = async (id: string) => {
  const course = await courseRepository.findCourseById(id);

  if (!course) {
    throw new AppError("course not found", 404);
  }

  return course;
};

// =======================
// create course
// =======================

export const createCourse = async (
  data: CreateCourseData,
  teacherId: string,
) => {
  const courseData = {
    ...data,
    teacher: new Types.ObjectId(teacherId),
  };

  const course = await courseRepository.createCourse(courseData);

  await incrementCache(COURSES_CACHE_VERSION_KEY);

  return course;
};

// =======================
// get all courses
// =======================

export const getAllcourse = async (
  limit: number,
  page: number,
  minPrice?: number,
  maxPrice?: number,
  search?: string,
  sortBy: "price" | "createdAt" = "createdAt",
  order: "asc" | "desc" = "desc",
) => {
  if (
    page < 1 ||
    limit < 1 ||
    !Number.isInteger(page) ||
    !Number.isInteger(limit) ||
    limit > 100
  ) {
    throw new AppError("Invalid pagination parameters", 400);
  }

  if (
    (minPrice !== undefined && (!Number.isFinite(minPrice) || minPrice < 0)) ||
    (maxPrice !== undefined && (!Number.isFinite(maxPrice) || maxPrice < 0))
  ) {
    throw new AppError("Invalid price parameters", 400);
  }

  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    throw new AppError("minPrice cannot be greater than maxPrice", 400);
  }

  if (sortBy !== "price" && sortBy !== "createdAt") {
    throw new AppError("Invalid sortBy parameter", 400);
  }

  if (order !== "asc" && order !== "desc") {
    throw new AppError("Invalid order parameter", 400);
  }

  if (search !== undefined && typeof search !== "string") {
    throw new AppError("Invalid search parameter", 400);
  }

  const cacheVersion = Number((await getCache(COURSES_CACHE_VERSION_KEY)) ?? 0);

  const cacheKey = getCoursesCacheKey({
    limit,
    page,
    minPrice,
    maxPrice,
    search: search?.trim() || undefined,
    sortBy,
    order,
    version: cacheVersion,
  });

  const cachedCourses = await getCache(cacheKey);

  if (cachedCourses) {
    return JSON.parse(cachedCourses);
  }

  const courses = await courseRepository.findAllCourses(
    limit,
    page,
    minPrice,
    maxPrice,
    search?.trim() || undefined,
    sortBy,
    order,
  );

  await setCache(cacheKey, JSON.stringify(courses), COURSES_CACHE_TTL);

  return courses;
};

// =======================
// find course by id
// =======================

export const findCourseById = async (id: string) => {
  const course = await courseRepository.findCourseById(id);

  if (!course) {
    throw new AppError("course not found", 404);
  }

  return course;
};

// =======================
// update course by id
// =======================

export const updateCourse = async (
  id: string,
  data: Partial<CreateCourseData>,
  userId: string,
  userRole: string,
) => {
  const course = await courseRepository.findCourseById(id);

  if (!course) {
    throw new AppError("course not found", 404);
  }

  const isOwner = course.teacher.toString() === userId;
  const isAdmin = userRole === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError("You are not allowed to update this course", 403);
  }

  const updatedCourse = await courseRepository.updateCourse(id, data);

  if (updatedCourse) {
    await incrementCache(COURSES_CACHE_VERSION_KEY);
  }

  return updatedCourse;
};

// =======================
// delete course by id
// =======================

export const deleteCourse = async (
  id: string,
  userId: string,
  userRole: string,
) => {
  const course = await courseRepository.findCourseById(id);

  if (!course) {
    throw new AppError("course not found", 404);
  }

  const isOwner = course.teacher.toString() === userId;
  const isAdmin = userRole === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError("You are not allowed to delete this course", 403);
  }

  const hasEnrollments = await enrollmentRepository.hasEnrollments(id);

  if (hasEnrollments) {
    throw new AppError(
      "Cannot delete a course that has enrolled students",
      409,
    );
  }

  const deletedCourse = await courseRepository.deleteCourse(id);

  if (deletedCourse) {
    await incrementCache(COURSES_CACHE_VERSION_KEY);
  }

  return deletedCourse;
};

// =======================
// get my courses
// =======================

export const getMyCourses = async (teacherId: string) => {
  return courseRepository.findCoursesByTeacher(teacherId);
};
