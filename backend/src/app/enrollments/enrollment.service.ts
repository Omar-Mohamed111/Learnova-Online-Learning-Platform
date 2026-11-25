import crypto from "node:crypto";
import { AppError } from "../../pkg/errors/AppError";
import * as enrollmentRepository from "./enrollment.repository";
import * as courseRepository from "../courses/course.repository";
import {
  getCache,
  setCache,
  setCacheIfNotExists,
  delCache,
} from "../../pkg/cache/cache.service";

type IdempotencyRecord = {
  status: "processing" | "completed";
  requestHash: string;
  response?: unknown;
};

const IDEMPOTENCY_TTL = 60 * 60;

const createIdempotencyKey = (studentId: string, key: string) => {
  return `idempotency:enrollment:${studentId}:${key}`;
};

const createRequestHash = (studentId: string, courseId: string) => {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify({ studentId, courseId }))
    .digest("hex");
};

export const enrollStudent = async (
  studentId: string,
  courseId: string,
  idempotencyKey: string,
) => {
  // Check whether the course exists.
  const course = await courseRepository.findCourseById(courseId);

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  // Generate Redis key and request hash.
  const redisKey = createIdempotencyKey(studentId, idempotencyKey);
  const requestHash = createRequestHash(studentId, courseId);

  // Reserve the idempotency key.
  const isNewRequest = await setCacheIfNotExists(
    redisKey,
    JSON.stringify({
      status: "processing",
      requestHash,
    }),
    IDEMPOTENCY_TTL,
  );

  // Handle an existing idempotency key.
  if (!isNewRequest) {
    const cachedData = await getCache(redisKey);

    if (!cachedData) {
      throw new AppError("Unable to process request. Please retry.", 409);
    }

    const record: IdempotencyRecord = JSON.parse(cachedData);

    // Ensure the same key is not used with different request data.
    if (record.requestHash !== requestHash) {
      throw new AppError(
        "Idempotency key used with different request data",
        409,
      );
    }

    // The original request is still running.
    if (record.status === "processing") {
      throw new AppError("Request is already processing", 409);
    }

    // Return the original response.
    return record.response;
  }

  try {
    // Check whether the student is already enrolled.
    const existingEnrollment = await enrollmentRepository.findEnrollment(
      studentId,
      courseId,
    );

    if (existingEnrollment) {
      throw new AppError("You are already enrolled in this course", 409);
    }

    // Create the enrollment.
    const enrollment = await enrollmentRepository.createEnrollment(
      studentId,
      courseId,
    );

    // Save the completed response in Redis.
    const completedRecord: IdempotencyRecord = {
      status: "completed",
      requestHash,
      response: enrollment,
    };

    await setCache(redisKey, JSON.stringify(completedRecord), IDEMPOTENCY_TTL);

    return enrollment;
  } catch (error) {
    // Release the key if the operation fails.
    await delCache(redisKey).catch(() => undefined);

    // Handle MongoDB duplicate key error.
    if (error instanceof Error && "code" in error && error.code === 11000) {
      throw new AppError("You are already enrolled in this course", 409);
    }

    throw error;
  }
};

// Get all courses enrolled by a student.
export const getMyEnrollments = async (studentId: string) => {
  return enrollmentRepository.findEnrollmentsByStudent(studentId);
};
