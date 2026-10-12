# Security, Privacy, and Threat Model

## Assets

- Employee identity details and work history.
- Current salary and compensation insight data.
- Audit records of historical changes, including actor/reason.
- Supabase database password and connection configuration.
- Supabase Auth access tokens and signing/public-key metadata.
- HR account email address allowlist and deployment control plane.

## Actors and trust boundaries

| Actor / component | Trust level | Important rule |
|---|---|---|
| Browser / Angular runtime | Untrusted | UI guard is UX only; no private credentials; request authorization server-side |
| Supabase Auth | Identity provider | Validate issuer, signature, timestamps, and audience; do not trust decoded claims without validation |
| Spring Boot API | Trusted application service, exposed to internet | Validate input, authorize every protected request, avoid logging secrets/tokens |
| PostgreSQL | Data authority | Constraints, transaction boundary, RLS policies, limited credentials |
| Vercel / Render configuration | Secret boundary | Production values stored as protected environment variables, not committed |
| Demo data | Synthetic | Use only fake salaries and reserved `.test` addresses |

## Threats and mitigations

| Threat | Current mitigation in source | Residual gap / verification |
|---|---|---|
| Unauthenticated API reads | Spring resource server; protected routes default-deny | Add automated security integration tests and verify deployed behavior |
| Any signed-in user reads salary | `SUPABASE_ALLOWED_HR_EMAILS` check in Spring Security | Email allowlist is operationally manual; formal role/org membership needed at production scale |
| Token forgery or invalid claims | Nimbus JWKS decoder restricts ES256/RS256, validates issuer, default time claims, audience `authenticated` | Verify actual Supabase project signing configuration and claims; never solve by trusting unverified JWT payloads |
| Direct browser access to salary tables | RLS enabled + explicit deny policies for `anon` and `authenticated` | Re-test direct Data API access with the public key after DB changes; DB owner/service role semantics require care |
| SQL injection through sort | Sort field and direction are allowlisted before repository query | Keep SQL parameters bound and extend test if query construction changes |
| Duplicate employee ID/email | Unique DB constraints; duplicate-key error maps to 409 | Add DB integration test and confirm UI explains conflict |
| Lost concurrent change | `expectedVersion` optimistic concurrency check | Test stale update at repository/HTTP level |
| Salary changed without audit | Update and audit are in a transaction | Add rollback/failure injection test and consider DB-enforced append-only protections |
| Data leak from exception | Generic fallback response hides internals | Ensure server logs preserve stack trace without secrets; current fallback source did not log before troubleshooting update |
| Overly broad CORS | Configured origin list, explicit methods/headers | Use exact Vercel origins; CORS is not authentication and must not replace authorization |
| Credential leakage | `.env` ignored by `.gitignore`; backend example file documents keys | A database credential and token appeared in shared troubleshooting artifacts; rotate DB password, invalidate exposed session, audit git history and provider settings |
| Overfetching / excessive queries | Maximum page size 100; server-side filters | Add rate limiting/monitoring before production; consider query timeout/limits |
| Sensitive info in demo | Synthetic seeded records and demo checklist | Never expose Network request Authorization header or environment values during video |

## Secure configuration rules

1. Supabase publishable key may be included in browser code. It is not a database credential; RLS and server authorization still matter.
2. `SPRING_DATASOURCE_PASSWORD` belongs only in local untracked `.env` and backend-host environment settings.
3. Never include Supabase service-role/secret keys, JWT signing secrets, database passwords, or access tokens in Angular builds, artifacts, screenshots, CI logs, or Git.
4. Do not use a shared demo password or real company data. Use a dedicated low-privilege demo HR account.
5. CORS configuration must match the exact deployed Vercel origin. Set `API_BASE_URL` in Vercel to `https://<render-service>.onrender.com/api`.
6. For a production HR system, require MFA/SSO according to policy, formal role management, organization scoping, audit retention, rate limiting, backup/restore, access reviews, and documented incident response.

## Credential-exposure remediation checklist

- [ ] Reset the Supabase database password that was visible in troubleshooting screenshots/logs/ZIP.
- [ ] Update Render and local untracked `.env` with the new password; redeploy/restart.
- [ ] Sign out the demo user and revoke/expire any exposed access session where the provider supports it.
- [ ] Inspect `git status`, tracked files, and complete Git history for accidental `.env`, token, database URL/password, and service-role key commits.
- [ ] Ensure zipped deliverables contain no `.env`, `target/`, `node_modules/`, or production environment output.
- [ ] Replace or delete screenshots that contain bearer tokens or secrets.
- [ ] Verify the new DB credential works before final demo and that old credential no longer works.

## Privacy and retention

Seeded records are synthetic. Audit data is sensitive because it reflects compensation decisions. Decide who can read audit history, how long it is retained, who can export it, and how backups are protected before real data is used. The assessment does not implement a full compliance/retention program.
