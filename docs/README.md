# ACME Salary Management — Assessment Artifacts

**Purpose:** Give an assessor a concise, evidence-oriented view of the product framing, architecture, engineering decisions, quality strategy, AI-assisted workflow, and delivery status for the ACME salary-management assessment.

> These artifacts describe the repository and deployment evidence available during the 12–13 October 2026 working session. They distinguish implemented behavior from items that still need end-to-end verification. They are decision records, not a claim that every production-readiness activity is complete.

## How to review this pack

| Order | Artifact | Why it matters |
|---|---|---|
| 1 | [`requirements/one-page-requirements.md`](requirements/one-page-requirements.md) | Requested one-page requirement document and non-goals |
| 2 | [`product/product-framing.md`](product/product-framing.md) | Persona, workflows, acceptance criteria, and scope choices |
| 3 | [`architecture/architecture.md`](architecture/architecture.md) | Runtime components, trust boundaries, request flow |
| 4 | [`architecture/data-model-and-migrations.md`](architecture/data-model-and-migrations.md) | Relational model, money representation, seed strategy |
| 5 | [`architecture/adr/`](architecture/adr/) | Decisions and trade-offs captured as short ADRs |
| 6 | [`api/api-contract.md`](api/api-contract.md) | Endpoint semantics and error behavior |
| 7 | [`quality/testing-strategy.md`](quality/testing-strategy.md) and [`quality/test-matrix.md`](quality/test-matrix.md) | Existing test scope, gaps, and verification gates |
| 8 | [`security/threat-model.md`](security/threat-model.md) | Assets, boundaries, current controls, residual risks |
| 9 | [`performance/10k-record-performance.md`](performance/10k-record-performance.md) | Why database-side pagination is used and how to measure it |
| 10 | [`ai/ai-assisted-development-record.md`](ai/ai-assisted-development-record.md) | Intentional use of AI with review and verification gates |
| 11 | [`delivery/development-journal-and-commits.md`](delivery/development-journal-and-commits.md) | Actual local commit history and development progression |
| 12 | [`delivery/deployment-runbook.md`](delivery/deployment-runbook.md) | Local, Vercel, Render, and Supabase configuration |
| 13 | [`delivery/readiness-and-open-issues.md`](delivery/readiness-and-open-issues.md) | Honest snapshot of live verification and next steps |
| 14 | [`delivery/demo-script.md`](delivery/demo-script.md) | Five-minute assessor walkthrough |
| 15 | [`operations/incident-and-support-runbook.md`](operations/incident-and-support-runbook.md) | Debugging sequence and secret-handling hygiene |
| 16 | [`implementation-assets/seed-employees-unique-names.sql`](implementation-assets/seed-employees-unique-names.sql) | Repeatable seed variant with 10,000 distinct synthetic full names |

## System summary

- **UI:** Angular 20 single-page application; static hosting on Vercel.
- **API:** Spring Boot 3.5, Java 21, JDBC, Spring Security resource-server JWT validation; deployed separately on Render.
- **Identity:** Supabase Auth email/password flow; browser uses only the publishable key.
- **Database:** Supabase PostgreSQL. Data access is designed to pass through Spring Boot; browser-facing roles have explicit deny policies on salary tables.
- **Main feature areas:** employee directory/search/filter/pagination, employee create, salary update with a reason and audit record, dashboard KPIs, and country/department/currency compensation summaries.

## Important current-status note

The application has been deployed to Vercel and Render according to the deployment screenshots, and Render reported the service as live. However, the most recent browser evidence still showed a dashboard request returning HTTP 500. The captured URL was `/dashboard/summary`, while the source controller is mapped to `/api/dashboard/summary`; production `API_BASE_URL` must therefore be checked to ensure it ends in `/api`. Database connectivity and successful end-to-end behavior should be treated as **not yet verified** until the dashboard, employee list, salary update, and audit flow all pass in the deployed environment. See [readiness and open issues](delivery/readiness-and-open-issues.md).

## Security note before sharing

A database credential and a bearer token were visible in troubleshooting materials. This pack contains **no secret values**. Before public submission: reset the Supabase database password, sign out/revoke exposed sessions where possible, search the repository and Git history for secrets, and verify `.env` is not tracked. Treat any credential that appeared in a shared screenshot or ZIP as exposed.

## How to use this pack

Copy the files into the repository's `docs/assessment-artifacts/` directory (or replace older docs after reviewing them). The SQL file is a reviewed alternative seed asset; inspect it before replacing `infra/scripts/seed-employees.sql`. Run tests and end-to-end smoke checks from the runbooks rather than treating documentation as test evidence.
