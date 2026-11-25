import * as adminRepository from "./admin.repository";

// Get all dashboard statistics.
export const getDashboardStats = async () => {
  const [users, courses, enrollments, reviews, popularCourses] =
    await Promise.all([
      adminRepository.getUsersStats(),
      adminRepository.getCoursesStats(),
      adminRepository.getEnrollmentsStats(),
      adminRepository.getReviewsStats(),
      adminRepository.getPopularCourses(),
    ]);

  return {
    users,
    courses,
    enrollments,
    reviews,
    popularCourses,
  };
};
