import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const API = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    me: "/auth/my-profile",
    logout: "/auth/logout",
    verifyEmail: "/auth/verify-email",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    google: "/auth/google",
    enable2FA: "/auth/2fa/enable",
    verifyEnable2FA: "/auth/2fa/verify-enable",
    verifyLogin2FA: "/auth/2fa/verify-login",
  },
  courses: {
    all: "/course/all-courses",
    mine: "/course/my-courses",
    create: "/course/",
    byId: (id: string) => `/course/${id}`,
  },
  enrollments: {
    mine: "/enrollments/my-enrollments",
    create: "/enrollments",
  },
  lessons: {
    create: "/lessons",
    byCourse: (courseId: string) => `/lessons/course/${courseId}`,
    byId: (lessonId: string) => `/lessons/${lessonId}`,
  },
  reviews: {
    create: "/reviews",
    byCourse: (courseId: string) => `/reviews/course/${courseId}`,
    byId: (reviewId: string) => `/reviews/${reviewId}`,
  },
  admin: { stats: "/admin/stats" },
};

export function getApiError(error: unknown, fallback = "Something went wrong.") {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: { field?: string; message?: string }[] }
      | undefined;
    if (data?.errors?.length) return data.errors.map((item) => item.message).filter(Boolean).join(", ");
    return data?.message || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
