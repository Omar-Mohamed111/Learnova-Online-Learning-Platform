import mongoose from "mongoose";
import { Review } from "./review.model";

// Create a new review.

export const createReview = async (
  rating: number,
  comment: string | undefined,
  studentId: string,
  courseId: string,
) => {
  return Review.create({
    rating,
    ...(comment !== undefined && { comment }),
    student: studentId,
    course: courseId,
  });
};

// Find a review by its ID.
export const findReviewById = async (reviewId: string) => {
  return Review.findById(reviewId);
};

// Find a student's review for a specific course.
export const findReviewByStudentAndCourse = async (
  studentId: string,
  courseId: string,
) => {
  return Review.findOne({
    student: studentId,
    course: courseId,
  });
};

// Get all reviews for a course.
export const findReviewsByCourse = async (courseId: string) => {
  return Review.find({ course: courseId })
    .populate("student", "name")
    .sort({ createdAt: -1 });
};

// Update a review.
export const updateReview = async (
  reviewId: string,
  data: { rating?: number; comment?: string },
) => {
  return Review.findByIdAndUpdate(reviewId, data, {
    new: true,
    runValidators: true,
  });
};

// Delete a review.
export const deleteReview = async (reviewId: string) => {
  return Review.findByIdAndDelete(reviewId);
};

// Get the average rating and total number of reviews for a course.
export const getCourseReviewStats = async (courseId: string) => {
  const result = await Review.aggregate([
    {
      $match: {
        course: new mongoose.Types.ObjectId(courseId),
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  return (
    result[0] ?? {
      averageRating: 0,
      totalReviews: 0,
    }
  );
};
