import z from "zod";

export const userSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),

  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

export const verifyEmailSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  otp: z.string().regex(/^\d{6}$/, {
    message: "OTP must be exactly 6 digits",
  }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  otp: z
    .string()
    .length(6, { message: "OTP must be 6 digits" })
    .regex(/^\d{6}$/, { message: "OTP must contain only numbers" }),

  newPassword: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
});

export const googleLoginSchema = z.object({
  credential: z.string().min(1, {
    message: "Google credential is required",
  }),
});

// =======================
// Two Factor Authentication
// =======================

export const verifyTwoFactorSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  otp: z.string().regex(/^\d{6}$/, {
    message: "OTP must be exactly 6 digits",
  }),
});

export const verifyEnableTwoFactorSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, {
    message: "OTP must be exactly 6 digits",
  }),
});
