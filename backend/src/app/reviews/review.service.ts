import { AppError } from "../../pkg/errors/AppError";
import * as reviewRepository from "./review.repository";
import * as courseRepository from "../courses/course.repository";
import * as enrollmentRepository from "../enrollments/enrollment.repository";

// Create a review for an enrolled course.
export const createReview = async (
  rating: number,
  comment: string | undefined,
  studentId: string,
  courseId: string,
) => {
  // Check whether the course exists.
  const course = await courseRepository.findCourseById(courseId);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  // Check whether the student is enrolled in the course.
  const enrollment = await enrollmentRepository.findEnrollment(
    studentId,
    courseId,
  );

  if (!enrollment) {
    throw new AppError("You are not enrolled in this course", 403);
  }

  // Prevent the student from reviewing the same course twice.
  const existingReview = await reviewRepository.findReviewByStudentAndCourse(
    studentId,
    courseId,
  );

  if (existingReview) {
    throw new AppError("You have already reviewed this course", 409);
  }

  // Create the review.
  return reviewRepository.createReview(rating, comment, studentId, courseId);
};

// Get all reviews for a course.
// Get all reviews and rating statistics for a course.
export const getReviewsByCourse = async (courseId: string) => {
  // Check if the course exists.
  const course = await courseRepository.findCourseById(courseId);

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  // Fetch reviews and statistics.
  const reviews = await reviewRepository.findReviewsByCourse(courseId);
  const stats = await reviewRepository.getCourseReviewStats(courseId);

  return {
    averageRating: Number(stats.averageRating.toFixed(1)),
    totalReviews: stats.totalReviews,
    reviews,
  };
};

// Update a student's own review.
export const updateReview = async (
  reviewId: string,
  studentId: string,
  data: { rating?: number; comment?: string },
) => {
  const review = await reviewRepository.findReviewById(reviewId);

  if (!review) {
    throw new AppError("Review not found", 404);
  }

  // Students can update only their own reviews.
  if (review.student.toString() !== studentId) {
    throw new AppError("You are not allowed to update this review", 403);
  }

  return reviewRepository.updateReview(reviewId, data);
};

// Delete a student's own review.
export const deleteReview = async (reviewId: string, studentId: string) => {
  const review = await reviewRepository.findReviewById(reviewId);

  if (!review) {
    throw new AppError("Review not found", 404);
  }

  // Students can delete only their own reviews.
  if (review.student.toString() !== studentId) {
    throw new AppError("You are not allowed to delete this review", 403);
  }

  return reviewRepository.deleteReview(reviewId);
};
