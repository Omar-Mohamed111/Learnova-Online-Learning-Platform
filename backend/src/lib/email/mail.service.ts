import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.emailUser,
    pass: env.emailPass,
  },
});

export const sendEmail = async (to: string, otp: string): Promise<void> => {
  await transporter.sendMail({
    from: env.emailUser,
    to,
    subject: "Online Learning Platform - Email Verification",
    text: `Your OTP is ${otp}`,
  });
};
