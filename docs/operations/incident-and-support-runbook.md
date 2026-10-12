# Incident and Support Runbook

## Triage order for a failing page

1. **Identify boundary:** is failure in the Vercel asset request, Supabase Auth sign-in, browser-to-Render API request, or Render-to-PostgreSQL request?
2. **Capture the exact failing URL and status:** omit query data that may contain PII and never copy Authorization headers.
3. **Check browser Console and Network response:** note status, response body, request path, and whether `Authorization: Bearer` exists—do not disclose its value.
4. **Check Render logs at the same timestamp:** find the actual exception and first `Caused by` line. Server response should stay generic; server logs need a safe, redacted stack trace.
5. **Check runtime config by key name, not by sharing values:** API path, CORS origin, issuer/JWKS URI, allowlist, database URL format, pooler hostname/port/username, current rotated credential.
6. **Reproduce with one request and one test account:** avoid changing many variables at once.
7. **Make a minimal fix and re-run the precise failing check.** Then test the next layer (not just deployment health).

## Known issue patterns from this project

| Evidence | Likely layer | Focused action |
|---|---|---|
| Vercel build says `cd frontend` not found | Build settings/root directory mismatch | If Root Directory=`frontend`, remove `cd frontend` from commands; output path is relative to that root |
| Vercel 404 on homepage | Deployment/build output/domain | Check active deployment URL and output file `dist/salary-management/browser/index.html` |
| Deep route refresh 404 | SPA fallback rewrite | Restore a frontend-root `vercel.json` rewrite to `/index.html` |
| Browser URL is Render host + `/dashboard/summary` | Angular build-time config | `API_BASE_URL` missing `/api`; rebuild after setting `https://<host>/api` |
| Browser request 401 | Token/auth boundary | Confirm active Supabase session and Bearer header presence (never reveal value); inspect JWT validation/allowlist logs |
| Browser request 403 | Authorization | Confirm authenticated test email is in `SUPABASE_ALLOWED_HR_EMAILS` on Render |
| Browser request 500 and Hikari starts | Database/API code | Read server exception; inspect JDBC URL and connection parameters; never guess before checking logs |
| PostgreSQL driver says it rejects the URL | JDBC format | Use `jdbc:postgresql://...`; plain `postgresql://...` is not a JDBC URL |
| Direct Supabase connection unreachable | Network/IPv6 path | Use Supabase Session Pooler details for compatible backend networking; exact credentials vary by mode |
| `password authentication failed` | Secret drift | Reset Supabase DB password, set matching Render secret, restart/deploy |

## Safe exception logging

Unexpected exception handling should return a generic client detail so SQL, hostnames, or stack traces are not exposed to users. Server logs should include a correlation/request ID and the stack trace, while redacting `Authorization`, password, connection URI credentials, and sensitive row contents. Never add request headers or environment dumps to logs during troubleshooting.

## Deployment health versus application health

- `/actuator/health` being `UP` establishes that the process passes the configured health check; it may not prove that every route or database query is healthy unless datasource health is included and enabled.
- A Render “service live” message is not a successful business request.
- A successful homepage is not proof of API integration.
- Required end-to-end proof is the exact `/api/dashboard/summary` returning 200 from the Vercel origin with a valid session, followed by employee and salary workflows.

## Incident postmortem template

```text
Date/time and environment:
User-visible symptom:
Exact endpoint/status (no tokens or secrets):
Impact/scope:
Primary evidence:
Root cause:
Fix/commit:
Validation performed and result:
Data/security impact:
Follow-up prevention:
```
