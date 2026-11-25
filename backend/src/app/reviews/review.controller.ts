import { Request, Response, NextFunction } from "express";
import { AppError } from "../../pkg/errors/AppError";
import * as reviewService from "./review.service";

// Create a review.
export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const studentId = res.locals.userId;
    const { rating, comment, courseId } = req.body;

    if (typeof studentId !== "string") {
      throw new AppError("Authentication required", 401);
    }

    const review = await reviewService.createReview(
      rating,
      comment,
      studentId,
      courseId,
    );

    res.status(201).json({
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    next(error);
  }
};

// Get all reviews for a course.
export const getReviewsByCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { courseId } = req.params;

    if (typeof courseId !== "string") {
      throw new AppError("Course ID is required", 400);
    }

    const result = await reviewService.getReviewsByCourse(courseId);

    res.status(200).json({
      message: "Reviews fetched successfully",
      averageRating: result.averageRating,
      totalReviews: result.totalReviews,
      reviews: result.reviews,
    });
  } catch (error) {
    next(error);
  }
};

// Update a review.
export const updateReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const studentId = res.locals.userId;
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    if (typeof studentId !== "string") {
      throw new AppError("Authentication required", 401);
    }

    if (typeof reviewId !== "string") {
      throw new AppError("Review ID is required", 400);
    }

    const review = await reviewService.updateReview(reviewId, studentId, {
      rating,
      comment,
    });

    res.status(200).json({
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a review.
export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const studentId = res.locals.userId;
    const { reviewId } = req.params;

    if (typeof studentId !== "string") {
      throw new AppError("Authentication required", 401);
    }

    if (typeof reviewId !== "string") {
      throw new AppError("Review ID is required", 400);
    }

    await reviewService.deleteReview(reviewId, studentId);

    res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
