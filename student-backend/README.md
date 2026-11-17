# Student Attendance Backend

Independent Express/MongoDB API for student attendance. It lives separately from the existing Next.js frontend and does not change its UI or files.

## Existing frontend compatibility

The current frontend is a teacher-oriented demo: it logs in with email, expects a `teacher` response, and submits a name and roll number to an unauthenticated QR scan. This API intentionally does not honor those identity fields. Student login uses PRN/password, student routes require a JWT, and the scan endpoint derives the student solely from that JWT. Do not connect the current teacher UI to this student API without separately designing the frontend integration.

## Requirements and local setup

- Node.js 20 or newer and npm.
- MongoDB running locally, or a MongoDB connection string.

From `student-backend`:

1. `npm install` — installs Express, Mongoose, JWT, bcrypt, validation/security middleware, and test dependencies listed in `package.json`.
2. Copy `.env.example` to `.env`. Replace both example secrets with distinct random values of at least 32 characters; configure `MONGODB_URI` and `CLIENT_ORIGIN`. Never commit `.env` or use the example secret values in production.
3. `npm run dev` — starts the API with Node's watch mode on port `10000` by default.
4. `npm test` — runs API integration tests against a temporary MongoDB instance.

Use `npm start` for a non-watch local run. The API health check is `GET http://localhost:10000/api/health`.

The admin key is only for trusted attendance-session management; do not put it in a browser app. For production, put these endpoints behind a staff/admin identity and use HTTPS, a managed MongoDB deployment, secret management, and appropriate database backups.

## Security and attendance behavior

- Passwords are bcrypt-hashed (12 rounds); password hashes are excluded from normal student queries and responses.
- Student routes use `Authorization: Bearer <JWT>`. Student IDs, PRNs, and names in request bodies never select the authenticated identity.
- Students can update only their name, email, and profile photo. Academic placement is set at registration and cannot be changed through the student profile API.
- The QR token is random and returned only when a trusted admin creates a session. MongoDB stores its SHA-256 hash. Scans require an authenticated student, an unexpired active session for their department/section/semester, and a unique student/session pair.
- Students cannot create, edit, or delete attendance records. An absent status is derived when a class session exists but the authenticated student has no attendance record.
- Attendance is `present` through the session's configured late threshold and `late` after it.

## API

All request/response bodies are JSON. Except registration, login, health, and admin session management, endpoints require `Authorization: Bearer <JWT>`. Errors use `{ "error": "message" }`.

### Student authentication

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Register a student and return student profile plus JWT. |
| `POST` | `/api/auth/login` | Log in by PRN/password and return student profile plus JWT. |

Registration body:

```json
{
  "name": "A Student",
  "prn": "CS001",
  "email": "student@example.edu",
  "password": "a-strong-password",
  "department": "Computer Science",
  "section": "A",
  "semester": 4,
  "profilePhoto": "https://example.edu/photo.jpg"
}
```

`profilePhoto` is optional and must be an HTTP(S) URL when supplied. Passwords must contain at least 8 characters and no more than 72 UTF-8 bytes (bcrypt's input limit).

Login body:

```json
{ "prn": "CS001", "password": "a-strong-password" }
```

Example response (`201` registration / `200` login):

```json
{
  "student": {
    "id": "665f1a...",
    "name": "A Student",
    "prn": "CS001",
    "email": "student@example.edu",
    "department": "Computer Science",
    "section": "A",
    "semester": 4,
    "profilePhoto": "https://example.edu/photo.jpg"
  },
  "token": "<signed-jwt>"
}
```

### Student profile

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/profile` | Return the authenticated student's profile. |
| `PATCH` | `/api/profile` | Update name, email, and/or profile photo only. |

Example update:

```json
{ "name": "A. Student", "profilePhoto": "https://example.edu/new-photo.jpg" }
```

Example response:

```json
{ "student": { "id": "665f1a...", "name": "A. Student", "prn": "CS001", "email": "student@example.edu", "department": "Computer Science", "section": "A", "semester": 4, "profilePhoto": "https://example.edu/new-photo.jpg" } }
```

### Attendance sessions and QR scanning

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/attendance/sessions` | Trusted staff creates a scoped session and receives its QR token. Requires `x-admin-key`. |
| `PATCH` | `/api/attendance/sessions/:sessionId/close` | Trusted staff deactivates a session. Requires `x-admin-key`. |
| `POST` | `/api/attendance/scan` | Authenticated student validates a QR token and marks their own attendance once. |
| `GET` | `/api/attendance/history` | Return attendance history, including derived absences. |

Session creation body:

```json
{
  "subject": "Algorithms",
  "department": "Computer Science",
  "section": "A",
  "semester": 4,
  "expiresInMinutes": 15,
  "lateAfterMinutes": 10
}
```

Send `x-admin-key: <ADMIN_API_KEY>` with the session create/close requests. The duration values are optional (defaults: 15 and 10 minutes; allowed: 1–120 and 0–120 respectively).

Example response:

```json
{
  "session": {
    "id": "665f1b...",
    "subject": "Algorithms",
    "department": "Computer Science",
    "section": "A",
    "semester": 4,
    "startsAt": "2026-11-01T04:30:00.000Z",
    "expiresAt": "2026-11-01T04:45:00.000Z",
    "lateAfter": "2026-11-01T04:40:00.000Z",
    "active": true
  },
  "qrToken": "<opaque-random-token>"
}
```

Scan body:

```json
{ "qrToken": "<opaque-random-token>" }
```

Example response (`201`):

```json
{ "status": "present", "markedAt": "2026-11-01T04:35:00.000Z", "subject": "Algorithms", "sessionId": "665f1b..." }
```

Repeated scans return `409`; invalid, inactive, or expired tokens return `400`; a student outside the session's class scope receives `403`.

History supports optional ISO-8601 `from`, `to`, `subject`, and `limit` query parameters (`limit` defaults to 100 and is capped at 200). Example:

```json
{
  "history": [
    { "sessionId": "665f1b...", "subject": "Algorithms", "date": "2026-11-01T04:30:00.000Z", "status": "present", "markedAt": "2026-11-01T04:35:00.000Z" },
    { "sessionId": "665f1c...", "subject": "Algorithms", "date": "2026-10-30T04:30:00.000Z", "status": "absent", "markedAt": null }
  ]
}
```

### Dashboard

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/dashboard` | Return class totals and subject-wise attendance for the authenticated student's class. |

Example response:

```json
{
  "totalClasses": 12,
  "attendedClasses": 10,
  "absentClasses": 2,
  "attendancePercentage": 83.33,
  "subjects": [
    { "subject": "Algorithms", "totalClasses": 6, "attendedClasses": 5, "absentClasses": 1, "lateClasses": 1, "attendancePercentage": 83.33 }
  ]
}
```

`attendedClasses` includes both present and late records. Total classes include sessions scoped to the student's department, section, and semester.
An active session is included only after the student has checked in; an unmarked session counts as absent only after it has been closed or its expiry time has passed.

### Timetable

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/timetable` | Return the weekly schedule for the student's department, section, and semester (optional `?day=1..6`). |
| `POST` | `/api/timetable` | Create a timetable entry. Requires `x-admin-key`. |

