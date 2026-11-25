import express from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import * as enrollmentController from "./enrollment.controller";

const router = express.Router();

// Enroll the authenticated student in a course.
router.post(
  "/",
  authenticate,
  authorize("student"),
  enrollmentController.enrollStudent,
);

// Get the authenticated student's enrollments.
router.get(
  "/my-enrollments",
  authenticate,
  authorize("student"),
  enrollmentController.getMyEnrollments,
);

export default router;
