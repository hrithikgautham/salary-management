# AI-assisted workflow record

## Working principles

1. Frame the user problem and non-goals before coding.
2. Generate small cohesive changes, then inspect structure and security assumptions.
3. Prefer explicit validation and deterministic tests over generated complexity.
4. Do not send secrets, real salary data, passwords, or database dumps to AI tools.
5. Keep meaningful artifacts and commit descriptions alongside the code.

## Representative prompts used

- "Draft a one-page requirements document for a salary-management product used by an HR manager managing 10,000 employees across multiple countries. State non-goals and currency assumptions."
- "Design a small Spring Boot API for employee search, paginated filtering, compensation update, audit trail, and dashboard aggregations. Use BigDecimal, backend validation, allowlisted sorting, and optimistic concurrency."
- "Implement Supabase email/password auth in Angular and attach access tokens to Spring API calls. Spring must validate tokens cryptographically and validate issuer and timestamps; never trust a browser-provided user ID."
- "Create an idempotent synthetic 10,000 employee seed script and make salary analytics group by currency instead of mixing incomparable values."
- "Write fast deterministic tests for salary domain constraints and key request validation. Document which checks still need a staging environment."
- "Review the setup for accidental secrets, overly broad CORS, unbounded pagination, unsafe SQL sort interpolation, and misleading cross-currency totals."

## Checks to run before submitting

- Run backend tests and frontend tests locally.
- Apply migration and seed script in a disposable Supabase project or staging schema first.
- Confirm a real Supabase access token passes Spring Security and expired/invalid tokens get 401.
- Confirm CORS only permits the configured Vercel domain(s).
- Try invalid and stale salary edits and verify audit consistency.
- Review Git diff and ensure no `.env`, database password, service-role key, or user data is committed.
