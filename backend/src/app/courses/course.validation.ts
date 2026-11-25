import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),

  description: z.string().trim().min(1, "Description is required"),

  price: z.number().min(0, "Price must be greater than or equal to 0"),
});

export const updateCourseSchema = createCourseSchema.partial().strict();