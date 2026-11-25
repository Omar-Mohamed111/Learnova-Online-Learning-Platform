import express from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import * as lessonController from "./lesson.controller";

const router = express.Router();

// Create a lesson.
// Only teachers and admins can access this route.
router.post(
  "/",
  authenticate,
  authorize("teacher", "admin"),
  lessonController.createLesson,
);

// Get all lessons belonging to a course.
// Only authenticated students can access this route.
router.get(
  "/course/:courseId",
  authenticate,
  authorize("student"),
  lessonController.getLessonsByCourse,
);

// Update a lesson.
router.patch(
  "/:lessonId",
  authenticate,
  authorize("teacher", "admin"),
  lessonController.updateLesson,
);

// Delete a lesson.
router.delete(
  "/:lessonId",
  authenticate,
  authorize("teacher", "admin"),
  lessonController.deleteLesson,
);

export default router;
