import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  password: {
    type: String,
    required: false,
    minlength: 8,
  },

  role: {
    type: String,
    enum: ["admin", "student", "teacher"],
    default: "student",
    required: true,
  },

  isEmailVerified: {
    type: Boolean,
    default: false,
    required: true,
  },

  isTwoFactorEnabled: {
    type: Boolean,
    default: false,
    required: true,
  },
});

export const User = mongoose.model("User", userSchema);
