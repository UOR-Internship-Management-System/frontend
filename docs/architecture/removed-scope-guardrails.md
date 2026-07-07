# Removed-Scope Guardrails

Sprint 1 keeps a scanner in `scripts/verify-removed-scope.mjs` and constants in `src/shared/constants/removedScope.ts`.

The scanner blocks active implementation text that implies removed functionality, including admin approval, pending registration, rejected registration, temporary password, skill master, verified skill, estimated GPA planner, CV review, CV approval, company login, company portal, AI ranking, AI scoring, match percentage, automated selection, project approval, project verification, GPA inside internship request, and GPA request field.

Allowed contexts are this document, the scanner, the constants file, and the official project documentation archive.
