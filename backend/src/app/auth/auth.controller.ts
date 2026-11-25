import * as authService from "./auth.service";
import { Request, Response, NextFunction } from "express";

// =====================
// Cookie Options
// =====================

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  maxAge: 24 * 60 * 60 * 1000,
};

// =====================
// Register
// =====================

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await authService.createUser(req.body);

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// =====================
// Verify Email
// =====================

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp } = req.body;

    await authService.verifyEmail(email, otp);

    res.status(200).json({
      message: "Verified user successfully",
    });
  } catch (error) {
    next(error);
  }
};

// =====================
// Forgot Password
// =====================

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;

    await authService.forgotPassword(email);

    res.status(200).json({
      message: "Password reset OTP sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

// =====================
// Reset Password
// =====================

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp, newPassword } = req.body;

    await authService.resetPassword(email, otp, newPassword);

    res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

// =====================
// Login
// =====================

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.login(req.body);

    // 2FA required
    if (result.requiresTwoFactor) {
      return res.status(200).json({
        message: "Two Factor Authentication required",
        requiresTwoFactor: true,
        email: result.email,
      });
    }

    // Normal login
    res.cookie("token", result.token, cookieOptions);

    return res.status(200).json({
      message: "Login successfully",
      user: result.safeUser,
    });
  } catch (error) {
    next(error);
  }
};

// =====================
// Login With Google
// =====================

export const googleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.googleLogin(req.body.credential);

    // 2FA required
    if (result.requiresTwoFactor) {
      return res.status(200).json({
        message: "Two Factor Authentication required",
        requiresTwoFactor: true,
        email: result.email,
      });
    }

    // Normal Google login
    res.cookie("token", result.token, cookieOptions);

    return res.status(200).json({
      message: "Google Login successfully",
      user: result.safeUser,
    });
  } catch (error) {
    next(error);
  }
};

// =====================
// Enable Two Factor Authentication
// =====================

export const enableTwoFactor = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = res.locals.userId;

    const result = await authService.enableTwoFactor(userId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// =====================
// Verify Enable Two Factor
// =====================

export const verifyEnableTwoFactor = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = res.locals.userId;
    const { otp } = req.body;

    const result = await authService.verifyEnableTwoFactor(userId, otp);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// =====================
// Verify Two Factor Login
// =====================

export const verifyTwoFactorLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp } = req.body;

    const result = await authService.verifyTwoFactorLogin(email, otp);

    res.cookie("token", result.token, cookieOptions);

    res.status(200).json({
      message: "Login successfully",
      user: result.safeUser,
    });
  } catch (error) {
    next(error);
  }
};

// =====================
// Get Profile
// =====================

export const myProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = res.locals.userId;

    const myProfile = await authService.myProfile(id);

    res.status(200).json({
      message: "My profile",
      myProfile,
    });
  } catch (error) {
    next(error);
  }
};

// =====================
// Logout
// =====================

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
    });

    res.status(200).json({
      message: "Logout successfully",
    });
  } catch (error) {
    next(error);
  }
};
