import crypto from "node:crypto";
import {
  setCache,
  getCache,
  delCache,
  incrementCacheWithExpiry,
  createEmailHash,
  setCacheIfNotExists,
} from "../../pkg/cache/cache.service";
import { sendEmail } from "./mail.service";
import { AppError } from "../../pkg/errors/AppError";

// =======================
// OTP Configuration
// =======================

export const generateOTP = () => {
  return crypto.randomInt(100000, 1000000);
};

// =======================
// Email Verification
// =======================

export const storedOTP = async (email: string) => {
  const otp = generateOTP();

  await setCache(`otp:${email}`, otp.toString(), 300);
  await sendEmail(email, otp.toString());
};

export const verifyOTP = async (
  email: string,
  otp: string,
): Promise<boolean> => {
  const key = `otp:${email}`;
  const storedOTP = await getCache(key);

  if (!storedOTP || storedOTP !== otp) {
    return false;
  }

  await delCache(key);

  return true;
};

// =======================
// Reset Password
// =======================

export const storedResetOTP = async (email: string) => {
  const otp = generateOTP();

  await setCache(`reset-password:${email}`, otp.toString(), 300);
  await sendEmail(email, otp.toString());
};

export const verifyResetOTP = async (
  email: string,
  otp: string,
): Promise<boolean> => {
  const key = `reset-password:${email}`;
  const storedOTP = await getCache(key);

  if (!storedOTP || storedOTP !== otp) {
    return false;
  }

  await delCache(key);

  return true;
};

// =======================
// Two Factor Authentication
// =======================

type TwoFactorPurpose = "enable" | "login";

const MAX_OTP_ATTEMPTS = 5;
const OTP_ATTEMPT_TTL = 15 * 60;

const MAX_OTP_SENDS = 5;
const OTP_SEND_TTL = 15 * 60;
const OTP_SEND_COOLDOWN = 60;

const getOTPAttemptsKey = (
  email: string,
  purpose: TwoFactorPurpose,
): string => {
  const emailHash = createEmailHash(email);

  return `rate-limit:otp:${purpose}:${emailHash}`;
};

const getOTPSendKey = (email: string, purpose: TwoFactorPurpose): string => {
  const emailHash = createEmailHash(email);

  return `rate-limit:otp-send:${purpose}:${emailHash}`;
};

// =======================
// Store Two Factor OTP
// =======================

export const storedTwoFactorOTP = async (
  email: string,
  purpose: TwoFactorPurpose,
) => {
  const sendKey = getOTPSendKey(email, purpose);
  const cooldownKey = `${sendKey}:cooldown`;

  // Prevent sending OTP more than once every 60 seconds
  const canSend = await setCacheIfNotExists(
    cooldownKey,
    "1",
    OTP_SEND_COOLDOWN,
  );

  if (!canSend) {
    throw new AppError(
      "Please wait 60 seconds before requesting another OTP.",
      429,
    );
  }

  // Allow a maximum of 5 OTP sends within 15 minutes
  const sends = await incrementCacheWithExpiry(sendKey, OTP_SEND_TTL);

  if (sends > MAX_OTP_SENDS) {
    await delCache(cooldownKey);

    throw new AppError("Too many OTP requests. Please try again later.", 429);
  }

  const otp = generateOTP();
  const otpKey = `two-factor:${purpose}:${email}`;

  await setCache(otpKey, otp.toString(), 300);

  try {
    await sendEmail(email, otp.toString());
  } catch (error) {
    await delCache(cooldownKey);
    await delCache(otpKey);

    throw error;
  }
};

// =======================
// Verify Two Factor OTP
// =======================

export const verifyTwoFactorOTP = async (
  email: string,
  otp: string,
  purpose: TwoFactorPurpose,
): Promise<boolean> => {
  const attemptsKey = getOTPAttemptsKey(email, purpose);

  const attempts = await incrementCacheWithExpiry(attemptsKey, OTP_ATTEMPT_TTL);

  if (attempts > MAX_OTP_ATTEMPTS) {
    throw new AppError("Too many OTP attempts. Please try again later.", 429);
  }

  const otpKey = `two-factor:${purpose}:${email}`;
  const storedOTP = await getCache(otpKey);

  if (!storedOTP || storedOTP !== otp) {
    return false;
  }

  await delCache(otpKey);
  await delCache(attemptsKey);

  return true;
};
