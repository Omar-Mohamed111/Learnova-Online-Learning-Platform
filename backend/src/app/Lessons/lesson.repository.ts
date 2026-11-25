import { Lesson } from "./lesson.model";

// Create a new lesson.
export const createLesson = async (
  title: string,
  content: string,
  courseId: string,
  teacherId: string,
) => {
  return Lesson.create({
    title,
    content,
    course: courseId,
    teacher: teacherId,
  });
};

// Find a lesson by its ID.
export const findLessonById = async (lessonId: string) => {
  return Lesson.findById(lessonId);
};

// Get all lessons belonging to a specific course.
export const findLessonsByCourse = async (courseId: string) => {
  return Lesson.find({ course: courseId }).sort({ createdAt: 1 });
};

// Update a lesson.
export const updateLesson = async (
  lessonId: string,
  data: {
    title?: string;
    content?: string;
  },
) => {
  return Lesson.findByIdAndUpdate(lessonId, data, {
    new: true,
    runValidators: true,
  });
};

// Delete a lesson.
export const deleteLesson = async (lessonId: string) => {
  return Lesson.findByIdAndDelete(lessonId);
};
