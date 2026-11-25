# Learnova — Online Learning Platform Frontend

React 19 + TypeScript + Vite frontend for the Learnova API.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

Configure:
- `VITE_API_URL=http://localhost:3000`
- `VITE_GOOGLE_CLIENT_ID=your_google_client_id`

The backend must allow credentialed requests from the Vite origin (`http://localhost:5173`).

## Implemented areas

- Public landing page and server-side course catalog search, price filters, sorting and pagination
- Course details and student enrollment with `Idempotency-Key`
- Cookie-based authentication, email verification, Google login, forgot/reset password and 2FA
- Student dashboard and enrolled-course classroom/lesson reading
- Course reviews: list, create, update and delete the current student's review
- Teacher workspace: list/create/update/delete own courses and create/update/delete lessons created in the current browser session
- Admin statistics dashboard
- Role-protected student, teacher and admin routes
- Light/dark theme, responsive layouts, animations and toast feedback

## Backend limitations reflected in the UI

The frontend intentionally does not invent unsupported APIs or data:
- No teacher endpoint exists to list existing lessons. Newly created lessons are kept in the current UI session; they cannot be reloaded as a teacher.
- No profile edit or disable-2FA endpoint exists.
- No admin user-management or role-assignment endpoint exists.
- No progress tracking, payments, quizzes, certificates, video upload or course thumbnails/categories are implemented by the backend.
- The catalog endpoint does not return a total-count field, so pagination uses page length to determine whether another page may exist.

## Build

```bash
npm run build
```

The project uses TypeScript strict mode. The build should be run after installing dependencies on the target OS.
