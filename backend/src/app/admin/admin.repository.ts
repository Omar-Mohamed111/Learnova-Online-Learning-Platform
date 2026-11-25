import { User } from "../auth/auth.model";
import { Course } from "../courses/course.model";
import { Enrollment } from "../enrollments/enrollment.model";
import { Review } from "../reviews/review.model";

// Get users statistics.
export const getUsersStats = async () => {
  const [totalUsers, totalStudents, totalTeachers] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "teacher" }),
  ]);

  return {
    totalUsers,
    totalStudents,
    totalTeachers,
  };
};

// Get total number of courses.
export const getCoursesStats = async () => {
  const totalCourses = await Course.countDocuments();

  return { totalCourses };
};

// Get total number of enrollments.
export const getEnrollmentsStats = async () => {
  const totalEnrollments = await Enrollment.countDocuments();

  return { totalEnrollments };
};

// Get overall reviews statistics.
export const getReviewsStats = async () => {
  const result = await Review.aggregate([
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  return {
    averageRating: Number((result[0]?.averageRating ?? 0).toFixed(1)),
    totalReviews: result[0]?.totalReviews ?? 0,
  };
};

// Get the most popular courses based on enrollments.
export const getPopularCourses = async () => {
  return Enrollment.aggregate([
    // Group enrollments by course.
    {
      $group: {
        _id: "$course",
        totalEnrollments: { $sum: 1 },
      },
    },

    // Show the most enrolled courses first.
    {
      $sort: {
        totalEnrollments: -1,
      },
    },

    // Limit the result to the top 5 courses.
    {
      $limit: 5,
    },

    // Join course details from the courses collection.
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "course",
      },
    },

    // Convert the course array into an object.
    {
      $unwind: "$course",
    },

    // Select the fields returned by the API.
    {
      $project: {
        _id: 0,
        courseId: "$course._id",
        title: "$course.title",
        totalEnrollments: 1,
      },
    },
  ]);
};
