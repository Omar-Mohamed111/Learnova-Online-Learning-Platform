import { Enrollment } from "./enrollment.model";

// Create a new enrollment record.
export const createEnrollment = async (studentId: string, courseId: string) => {
  return Enrollment.create({ student: studentId, course: courseId });
};

// Find an enrollment by student and course.
export const findEnrollment = async (studentId: string, courseId: string) => {
  return Enrollment.findOne({ student: studentId, course: courseId });
};

// Get all enrollments for a specific student.
export const findEnrollmentsByStudent = async (studentId: string) => {
  return Enrollment.find({ student: studentId }).populate("course");
};

// Check whether a course has any enrollments.
export const hasEnrollments = async (courseId: string) => {
  return Enrollment.exists({ course: courseId });
};
