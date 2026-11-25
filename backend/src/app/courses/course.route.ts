import express from "express";
import * as courseController from "./course.controller";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { createCourseSchema, updateCourseSchema } from "./course.validation";
import { validate } from "../../pkg/validate/validate";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("admin", "teacher"),
  validate(createCourseSchema),
  courseController.createCourse,
);

router.get("/all-courses", courseController.getAllcourse);

router.get(
  "/my-courses",
  authenticate,
  authorize("admin", "teacher"),
  courseController.getMyCourses,
);

router.get("/:id", courseController.findCourseById);

router.patch(
  "/:id",
  authenticate,
  authorize("admin", "teacher"),
  validate(updateCourseSchema),
  courseController.updateCourse,
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin", "teacher"),
  courseController.deleteCourse,
);

export default router;
