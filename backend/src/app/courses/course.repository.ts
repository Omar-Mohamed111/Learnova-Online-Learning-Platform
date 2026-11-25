import { InferSchemaType } from "mongoose";
import { Course, courseSchema } from "./course.model";

type CourseData = InferSchemaType<typeof courseSchema>;

export const createCourse = async (data: CourseData) => {
  return Course.create(data);
};

export const findAllCourses = async (
  limit: number,
  page: number,
  minPrice?: number,
  maxPrice?: number,
  search?: string,
  sortBy: "price" | "createdAt" = "createdAt",
  order: "asc" | "desc" = "desc",
) => {
  // Calculate how many documents to skip for the requested page.
  const skip = (page - 1) * limit;

  // Build the MongoDB filter dynamically.
  const filter: {
    price?: { $gte?: number; $lte?: number };
    $or?: Array<{
      title?: { $regex: string; $options: string };
      description?: { $regex: string; $options: string };
    }>;
  } = {};

  // Filter courses by minimum and/or maximum price.
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};

    if (minPrice !== undefined) {
      filter.price.$gte = minPrice;
    }

    if (maxPrice !== undefined) {
      filter.price.$lte = maxPrice;
    }
  }

  // Search in the course title or description.
  if (search) {
    // Escape special regex characters so search input is treated as text.
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.$or = [
      {
        title: {
          $regex: escapedSearch,
          $options: "i", // Case-insensitive search.
        },
      },
      {
        description: {
          $regex: escapedSearch,
          $options: "i",
        },
      },
    ];
  }

  // Convert the requested order to MongoDB's sort direction.
  const sortDirection = order === "asc" ? 1 : -1;

  // Apply filtering, sorting, pagination, and then return the results.
  return Course.find(filter)
    .sort({ [sortBy]: sortDirection })
    .skip(skip)
    .limit(limit);
};
export const findCourseById = async (id: string) => {
  return Course.findById(id);
};

export const updateCourse = async (id: string, data: Partial<CourseData>) => {
  return Course.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const deleteCourse = async (id: string) => {
  return Course.findByIdAndDelete(id);
};

export const findCoursesByTeacher = async (teacherId: string) => {
  return Course.find({ teacher: teacherId });
};
