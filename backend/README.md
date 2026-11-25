## API Endpoints

### Authentication (`/auth`)

| Method | Endpoint                  | Description                      |
| ------ | ------------------------- | -------------------------------- |
| POST   | `/auth/register`          | Register a new user              |
| POST   | `/auth/login`             | User login                       |
| POST   | `/auth/google`            | Login using Google               |
| POST   | `/auth/verify-email`      | Verify email using OTP           |
| GET    | `/auth/my-profile`        | Get authenticated user profile   |
| POST   | `/auth/logout`            | User logout                      |
| POST   | `/auth/forgot-password`   | Request password reset           |
| POST   | `/auth/reset-password`    | Reset password                   |
| POST   | `/auth/2fa/enable`        | Enable two-factor authentication |
| POST   | `/auth/2fa/verify-enable` | Verify and activate 2FA          |
| POST   | `/auth/2fa/verify-login`  | Verify 2FA during login          |

### Courses (`/course`)

| Method | Endpoint              | Description                                      |
| ------ | --------------------- | ------------------------------------------------ |
| POST   | `/course`             | Create a course                                  |
| GET    | `/course/all-courses` | Get all courses                                  |
| GET    | `/course/my-courses`  | Get courses created by the authenticated teacher |
| GET    | `/course/:id`         | Get course by ID                                 |
| PATCH  | `/course/:id`         | Update a course                                  |
| DELETE | `/course/:id`         | Delete a course                                  |

### Lessons (`/lessons`)

| Method | Endpoint                    | Description           |
| ------ | --------------------------- | --------------------- |
| POST   | `/lessons`                  | Create a lesson       |
| GET    | `/lessons/course/:courseId` | Get lessons by course |
| PATCH  | `/lessons/:lessonId`        | Update a lesson       |
| DELETE | `/lessons/:lessonId`        | Delete a lesson       |

### Enrollments (`/enrollments`)

| Method | Endpoint                      | Description                             |
| ------ | ----------------------------- | --------------------------------------- |
| POST   | `/enrollments`                | Enroll in a course                      |
| GET    | `/enrollments/my-enrollments` | Get authenticated student's enrollments |

### Reviews (`/reviews`)

| Method | Endpoint                    | Description              |
| ------ | --------------------------- | ------------------------ |
| POST   | `/reviews`                  | Create a course review   |
| GET    | `/reviews/course/:courseId` | Get reviews for a course |
| PATCH  | `/reviews/:reviewId`        | Update a review          |
| DELETE | `/reviews/:reviewId`        | Delete a review          |

### Admin (`/admin`)

| Method | Endpoint       | Description                    |
| ------ | -------------- | ------------------------------ |
| GET    | `/admin/stats` | Get admin dashboard statistics |

## Features

### Authentication & Security

- User registration and login.
- Email verification using OTP.
- Google Authentication.
- JWT-based authentication.
- Forgot and reset password using OTP.
- Two-Factor Authentication (2FA).
- Login attempt protection using Redis.
- Password hashing using bcrypt.
- Role-Based Access Control (RBAC).

### Course Management

- Create, update, delete, and retrieve courses.
- Paginated course listing.
- Search and filter courses by price range.
- Sort courses by price or creation date.
- Redis caching with version-based cache invalidation.
- Teacher ownership validation and admin management.
- Prevent deletion of courses with enrolled students.

### Lesson Management

- Create, update, and delete lessons.
- Retrieve lessons by course.

### Student Enrollments

- Enroll in courses and retrieve enrolled courses.
- Prevent duplicate enrollments.
- Redis-based idempotency to ensure safe request retries.
- Request hashing using SHA-256.
- Handle concurrent and repeated enrollment requests.
- Store completed responses for one hour.

### Reviews & Ratings

- Create, update, and delete course reviews.
- Only enrolled students can review courses.
- Prevent duplicate reviews per student and course.
- Students can manage only their own reviews.
- Calculate average ratings and total review counts.

### Admin Dashboard

- View user, course, enrollment, and review statistics.
- Track popular courses.
- Fetch dashboard statistics concurrently using Promise.all.
- Admin-only access control.

### Additional Features

- Redis caching for course listings.
- Request validation using Zod.
- Centralized error handling.
- Login rate limiting.
- Correlation ID middleware.

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Omar-Mohamed111/Online-Learning-Platform.git
cd Online-Learning-Platform/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the backend root directory and add the following variables:

```env
PORT=

MONGO_URI=

JWT_SECRET=

REDIS_URL=

EMAIL_USER=
EMAIL_PASS=

GOOGLE_CLIENT_ID=

RATE_LIMIT_SECRET=
```

Fill in the values with your own configuration.

### 4. Run the Development Server

```bash
npm run dev
```
