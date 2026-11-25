import express from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import * as adminController from "./admin.controller";

const router = express.Router();

// Only authenticated admins can access dashboard statistics.
router.get(
  "/stats",
  authenticate,
  authorize("admin"),
  adminController.getDashboardStats,
);

export default router;