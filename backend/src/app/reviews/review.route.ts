import express from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import * as reviewController from "./review.controller";
import { validate } from "../../pkg/validate/validate";
import { createReviewSchema, updateReviewSchema } from "./review.validation";

const router = express.Router();

// Create a review (students only).
router.post(
  "/",
  authenticate,
  authorize("student"),
  validate(createReviewSchema),
  reviewController.createReview,
);

// Get all reviews for a course (public to authenticated users).
router.get(
  "/course/:courseId",
  authenticate,
  reviewController.getReviewsByCourse,
);

// Update a review (students only).
router.patch(
  "/:reviewId",
  authenticate,
  authorize("student"),
  validate(updateReviewSchema),
  reviewController.updateReview,
);

// Delete a review (students only).
router.delete(
  "/:reviewId",
  authenticate,
  authorize("student"),
  reviewController.deleteReview,
);

export default router;
