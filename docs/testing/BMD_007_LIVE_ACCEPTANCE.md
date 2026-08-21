# BMD-007 Live Frontend Acceptance

This suite exercises the real Spring Boot, PostgreSQL, XeLaTeX, and frontend integration. It does not intercept or mock API requests.

## Prerequisites

- backend running at `http://127.0.0.1:8080` with XeLaTeX available;
- a dedicated, registered Student acceptance account;
- an Admin acceptance account;
- the Student account has a complete profile suitable for CV generation.

Set credentials in the current PowerShell process. Do not commit them:

```powershell
$env:CV_LIVE_STUDENT_EMAIL="student@example.test"
$env:CV_LIVE_STUDENT_PASSWORD="replace-locally"
$env:CV_LIVE_ADMIN_EMAIL="admin@example.test"
$env:CV_LIVE_ADMIN_PASSWORD="replace-locally"
```

If the backend uses another origin, set `CV_LIVE_BACKEND_URL`. The Vite proxy currently expects the application backend on port `8080`.

Run:

```powershell
npm ci
npm run e2e:cv-live
```

The three serial tests verify:

1. Student preview, save, and real PDF download;
2. Profile mutation, `OUTDATED`, replacement, restoration, and `CURRENT`;
3. Admin latest-saved-CV visibility and real PDF download.

The suite restores the Student's original profile summary and saves a final replacement so the active CV finishes in the `CURRENT` state.
