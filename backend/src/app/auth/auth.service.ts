import jwt from "jsonwebtoken";
import { AppError } from "../../pkg/errors/AppError";
import * as authRepository from "./auth.repository";
import bcrypt from "bcrypt";
import { env } from "../../lib/config/env";
import {
  storedOTP,
  storedResetOTP,
  verifyOTP,
  verifyResetOTP,
  storedTwoFactorOTP,
  verifyTwoFactorOTP,
} from "../../lib/email/otp.service";
import { OAuth2Client } from "google-auth-library";
import {
  incrementCacheWithExpiry,
  getCache,
  delCache,
  createEmailHash,
} from "../../pkg/cache/cache.service";

const googleClient = new OAuth2Client(env.googleClientId);

type userData = {
  name: string;
  email: string;
  password: string;
};

// =====================
// Register
// =====================

export const createUser = async (data: userData) => {
  
  const emailExist = await authRepository.findUserByEmail(data.email);
  if (emailExist) {
    throw new AppError("User already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await authRepository.createUser({
    ...data,
    password: hashedPassword,
    role: "student",
  });

  await storedOTP(user.email);

  const { password, ...safeUser } = user.toObject();

  return safeUser;
};

// =====================
// Verify Email
// =====================

export const verifyEmail = async (email: string, otp: string) => {
  const isValid = await verifyOTP(email, otp);

  if (!isValid) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  await authRepository.emailVerified(email);
};

// =====================
// Forgot Password
// =====================

export const forgotPassword = async (email: string) => {
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.isEmailVerified) {
    throw new AppError("User not verified", 403);
  }

  await storedResetOTP(user.email);
};

// =====================
// Reset Password
// =====================

export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
) => {
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.isEmailVerified) {
    throw new AppError("User not verified", 403);
  }

  const isOTPValid = await verifyResetOTP(email, otp);

  if (!isOTPValid) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const userUpdated = await authRepository.updatePassword(
    email,
    hashedPassword,
  );

  if (userUpdated.matchedCount === 0) {
    throw new AppError("User not found", 404);
  }

  await delCache(`reset-password:${email}`);

  return userUpdated;
};

// =====================
// Login
// =====================

export const login = async (data: { email: string; password: string }) => {
  await checkLoginAttempts(data.email);

  const user = await authRepository.findUserByEmail(data.email);

  if (!user) {
    await recordLoginFailure(data.email);
    throw new AppError("Invalid email or password", 400);
  }

  if (!user.isEmailVerified) {
    throw new AppError("You are not verified", 400);
  }

  if (!user.password) {
    await recordLoginFailure(data.email);
    throw new AppError("Invalid email or password", 400);
  }

  const correctPassword = await bcrypt.compare(data.password, user.password);

  if (!correctPassword) {
    await recordLoginFailure(data.email);
    throw new AppError("Invalid email or password", 400);
  }

  await delCache(getLoginAttemptsKey(data.email));

  // Two Factor Authentication
  if (user.isTwoFactorEnabled) {
    await storedTwoFactorOTP(user.email, "login");

    return {
      requiresTwoFactor: true as const,
      email: user.email,
    };
  }

  const token = jwt.sign({ userId: user._id }, env.jwtSecret, {
    expiresIn: "1d",
  });

  const { password, ...safeUser } = user.toObject();

  return {
    requiresTwoFactor: false as const,
    token,
    safeUser,
  };
};

// =====================
// Login Attempts
// =====================

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_ATTEMPT_TTL = 15 * 60;

const getLoginAttemptsKey = (email: string): string => {
  const emailHash = createEmailHash(email);
  return `rate-limit:login:account:${emailHash}`;
};

const checkLoginAttempts = async (email: string): Promise<void> => {
  const key = getLoginAttemptsKey(email);
  const attempts = Number((await getCache(key)) ?? 0);

  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    throw new AppError("Too many login attempts. Please try again later.", 429);
  }
};

const recordLoginFailure = async (email: string): Promise<void> => {
  const key = getLoginAttemptsKey(email);
  await incrementCacheWithExpiry(key, LOGIN_ATTEMPT_TTL);
};

// =====================
// Enable Two Factor Authentication
// =====================

export const enableTwoFactor = async (userId: string) => {
  const user = await authRepository.findUserById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.isEmailVerified) {
    throw new AppError("Email is not verified", 403);
  }

  if (user.isTwoFactorEnabled) {
    throw new AppError("Two Factor Authentication is already enabled", 400);
  }

  await storedTwoFactorOTP(user.email, "enable");

  return {
    message: "Two Factor Authentication OTP sent successfully",
  };
};

// =====================
// Verify Enable Two Factor
// =====================

export const verifyEnableTwoFactor = async (userId: string, otp: string) => {
  const user = await authRepository.findUserById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.isEmailVerified) {
    throw new AppError("Email is not verified", 403);
  }

  if (user.isTwoFactorEnabled) {
    throw new AppError("Two Factor Authentication is already enabled", 400);
  }

  const isValid = await verifyTwoFactorOTP(user.email, otp, "enable");

  if (!isValid) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  await authRepository.updateTwoFactorStatus(user.email, true);

  return {
    message: "Two Factor Authentication enabled successfully",
  };
};

// =====================
// Verify Two Factor Login
// =====================

export const verifyTwoFactorLogin = async (email: string, otp: string) => {
  const user = await authRepository.findUserByEmail(email);

  if (!user || !user.isEmailVerified || !user.isTwoFactorEnabled) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  const isValid = await verifyTwoFactorOTP(email, otp, "login");

  if (!isValid) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  const token = jwt.sign({ userId: user._id }, env.jwtSecret, {
    expiresIn: "1d",
  });

  const { password, ...safeUser } = user.toObject();

  return {
    token,
    safeUser,
  };
};

// =====================
// Google Token Verification
// =====================

const verifyGoogleToken = async (credential: string) => {
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: env.googleClientId,
  });

  const payload = ticket.getPayload();

  if (!payload?.email || !payload.email_verified) {
    throw new AppError("Invalid Google account", 401);
  }

  return payload;
};

// =====================
// Login With Google
// =====================

export const googleLogin = async (credential: string) => {
  const payload = await verifyGoogleToken(credential);

  const email = payload.email!;
  const name = payload.name ?? email.split("@")[0] ?? "Student";

  const existingUser = await authRepository.findUserByEmail(email);

  // Existing user
  if (existingUser) {
    if (!existingUser.isEmailVerified) {
      throw new AppError("Email is not verified", 403);
    }

    // Check Two Factor Authentication
    if (existingUser.isTwoFactorEnabled) {
      await storedTwoFactorOTP(existingUser.email, "login");

      return {
        requiresTwoFactor: true as const,
        email: existingUser.email,
      };
    }

    const token = jwt.sign({ userId: existingUser._id }, env.jwtSecret, {
      expiresIn: "1d",
    });

    const { password, ...safeUser } = existingUser.toObject();

    return {
      requiresTwoFactor: false as const,
      token,
      safeUser,
    };
  }

  // New user
  const newUser = await authRepository.createUser({
    name,
    email,
    role: "student",
    isEmailVerified: true,
  });

  const token = jwt.sign({ userId: newUser._id }, env.jwtSecret, {
    expiresIn: "1d",
  });

  const { password, ...safeUser } = newUser.toObject();

  return {
    requiresTwoFactor: false as const,
    token,
    safeUser,
  };
};

// =====================
// My Profile
// =====================

export const myProfile = async (id: string) => {
  const user = await authRepository.findUserById(id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const { password, ...safeUser } = user.toObject();

  return safeUser;
};
