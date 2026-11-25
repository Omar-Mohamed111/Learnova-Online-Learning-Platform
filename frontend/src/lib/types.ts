export type UserRole = "student" | "teacher" | "admin";

export type User = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
};

export type Course = {
  _id: string;
  title: string;
  description: string;
  price: number;
  teacher: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Enrollment = {
  _id: string;
  student: string;
  course: Course | string;
  createdAt?: string;
  updatedAt?: string;
};

export type Lesson = {
  _id: string;
  title: string;
  content: string;
  course: string;
  teacher: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Review = {
  _id: string;
  rating: number;
  comment?: string;
  student: { _id: string; name: string } | string;
  course: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminStats = {
  users: { totalUsers: number; totalStudents: number; totalTeachers: number };
  courses: { totalCourses: number };
  enrollments: { totalEnrollments: number };
  reviews: { averageRating: number; totalReviews: number };
  popularCourses: { courseId: string; title: string; totalEnrollments: number }[];
};

export const getList = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];
  const value = payload as Record<string, unknown>;
  for (const key of ["allCourse", "courses", "enrollments", "lessons", "reviews", "data", "results", "items"]) {
    if (Array.isArray(value[key])) return value[key] as T[];
  }
  return [];
};
