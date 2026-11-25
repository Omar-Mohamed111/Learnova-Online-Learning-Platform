import express from "express";
import { validate } from "../../pkg/validate/validate";

import {
  forgotPasswordSchema,
  googleLoginSchema,
  loginSchema,
  resetPasswordSchema,
  userSchema,
  verifyEmailSchema,
  verifyTwoFactorSchema,
  verifyEnableTwoFactorSchema,
} from "./auth.validation";

import * as authController from "./auth.controller";
import { authenticate } from "../../middleware/authenticate";
import { loginRateLimiter } from "../../middleware/loginRateLimiter";

const router = express.Router();

// =====================
// Register & Login
// =====================

router.post("/register", validate(userSchema), authController.createUser);

router.post(
  "/login",
  loginRateLimiter,
  validate(loginSchema),
  authController.login,
);

router.post("/google", validate(googleLoginSchema), authController.googleLogin);

// =====================
// Two Factor Authentication
// =====================

// Enable 2FA - Requires authentication
router.post("/2fa/enable", authenticate, authController.enableTwoFactor);

// Verify OTP and activate 2FA - Requires authentication
router.post(
  "/2fa/verify-enable",
  authenticate,
  validate(verifyEnableTwoFactorSchema),
  authController.verifyEnableTwoFactor,
);

// Verify OTP during login - Does NOT require authentication
router.post(
  "/2fa/verify-login",
  validate(verifyTwoFactorSchema),
  authController.verifyTwoFactorLogin,
);

// =====================
// Profile & Logout
// =====================

router.get("/my-profile", authenticate, authController.myProfile);

router.post("/logout", authenticate, authController.logout);

// =====================
// Email Verification
// =====================

router.post(
  "/verify-email",
  validate(verifyEmailSchema),
  authController.verifyEmail,
);

// =====================
// Password Reset
// =====================

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  authController.resetPassword,
);

export default router;
