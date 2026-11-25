import { AppError } from "../../pkg/errors/AppError";
import * as lessonRepository from "./lesson.repository";
import * as courseRepository from "../courses/course.repository";
import * as enrollmentRepository from "../enrollments/enrollment.repository";

// Create a lesson inside a course.
export const createLesson = async (
  title: string,
  content: string,
  courseId: string,
  teacherId: string,
) => {

  // Check whether the course exists.
  const course = await courseRepository.findCourseById(courseId);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  // Check whether the teacher owns this course.
  if (course.teacher.toString() !== teacherId) {
    throw new AppError(
      "You are not allowed to add lessons to this course",
      403,
    );
  }

  // Create the lesson.
  return lessonRepository.createLesson(title, content, courseId, teacherId);
};

// Get all lessons belonging to a course.
export const getLessonsByCourse = async (
  courseId: string,
  studentId: string,
) => {
  
  // Check whether the course exists.
  const course = await courseRepository.findCourseById(courseId);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  // Check whether the student is enrolled in this course.
  const enrollment = await enrollmentRepository.findEnrollment(
    studentId,
    courseId,
  );

  if (!enrollment) {
    throw new AppError("You are not enrolled in this course", 403);
  }

  // Return the lessons after verifying enrollment.
  return lessonRepository.findLessonsByCourse(courseId);
};

// Update a lesson.
export const updateLesson = async (
  lessonId: string,
  userId: string,
  userRole: "teacher" | "admin",
  data: { title?: string; content?: string },
) => {
  const lesson = await lessonRepository.findLessonById(lessonId);

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  // Teachers can update only their own lessons.
  // Admins can update any lesson.
  if (userRole !== "admin" && lesson.teacher.toString() !== userId) {
    throw new AppError("You are not allowed to update this lesson", 403);
  }

  return lessonRepository.updateLesson(lessonId, data);
};

// Delete a lesson.
export const deleteLesson = async (
  lessonId: string,
  userId: string,
  userRole: "teacher" | "admin",
) => {
  const lesson = await lessonRepository.findLessonById(lessonId);

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  // Teachers can delete only their own lessons.
  // Admins can delete any lesson.
  if (userRole !== "admin" && lesson.teacher.toString() !== userId) {
    throw new AppError("You are not allowed to delete this lesson", 403);
  }

  return lessonRepository.deleteLesson(lessonId);
};
