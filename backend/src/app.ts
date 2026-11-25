import express from "express";
import { errorHandler } from "./pkg/errors/errorHandler";
import authRoute from "./app/auth/auth.route";
import courseRoute from "./app/courses/course.route";
import cookieParse from "cookie-parser";
import enrollmentRoutes from "./app/enrollments/enrollment.route";
import lessonRoutes from "./app/Lessons/lesson.route";
import reviewRoutes from "./app/reviews/review.route";
import adminRoutes from "./app/admin/admin.route";
import cors from "cors";
import correlationId from "./middleware/correlationId";

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json());
app.use(cookieParse());

app.use(correlationId);

app.use("/auth", authRoute);

app.use("/course", courseRoute);

app.use("/enrollments", enrollmentRoutes);

app.use("/lessons", lessonRoutes);

app.use("/reviews", reviewRoutes);

app.use("/admin", adminRoutes);

app.use(errorHandler);

export default app;
