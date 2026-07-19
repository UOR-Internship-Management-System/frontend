# Routing Map

Public routes: `/`, `/student/sign-up`, `/student/verify-otp`, `/student/create-password`, `/student/login`, `/student/forgot-password`, `/admin/login`.

Student routes: `/student/dashboard`, `/student/profile`, `/student/skills`, `/student/projects`, `/student/cv-builder`, `/student/academic-records`.

Sprint 6 Admin routes: `/admin/dashboard`, `/admin/academic-ledger`, `/admin/students`, `/admin/students/:studentId`.

Admin navigation intentionally exposes only Dashboard, Academic Ledger, and Registered Students. Internship management, candidate filtering, and shortlist routes are outside the approved reduced scope and are not registered.

Fallback routes: `/unauthorized` and wildcard not found.
