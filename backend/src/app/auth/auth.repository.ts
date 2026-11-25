import { User } from "./auth.model";

type userData = {
  name: string;
  email: string;
  password?: string;
  role: "admin" | "teacher" | "student";
  isEmailVerified?: boolean;
};

export const findUserByEmail = async (email: string) => {
  return await User.findOne({ email });
};

export const createUser = async (data: userData) => {
  return await User.create(data);
};

export const findUserById = async (id: string) => {
  return await User.findById(id);
};

export const emailVerified = async (email: string) => {
  return await User.updateOne({ email }, { isEmailVerified: true });
};

export const updatePassword = async (email: string, hashedPassword: string) => {
  return await User.updateOne({ email }, { password: hashedPassword });
};

export const updateTwoFactorStatus = async (
  email: string,
  enabled: boolean,
) => {
  return await User.updateOne({ email }, { isTwoFactorEnabled: enabled });
};
